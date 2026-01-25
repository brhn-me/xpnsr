
from typing import List, Optional
from uuid import UUID
from sqlmodel import select, func, extract
from sqlalchemy.ext.asyncio import AsyncSession
from src.transactions.models import Transaction, TransactionType
from src.categories.models import Category
from .models import TaxBracket, TaxSettings
from .schemas import TaxBracketCreate, TaxSummary

async def get_brackets(session: AsyncSession, user_id: UUID, year: int) -> List[TaxBracket]:
    statement = select(TaxBracket).where(TaxBracket.user_id == user_id, TaxBracket.year == year).order_by(TaxBracket.min_income)
    result = await session.execute(statement)
    return result.scalars().all()

async def create_bracket(session: AsyncSession, bracket_in: TaxBracketCreate, user_id: UUID) -> TaxBracket:
    bracket = TaxBracket(**bracket_in.dict(), user_id=user_id)
    session.add(bracket)
    await session.commit()
    await session.refresh(bracket)
    return bracket

async def calculate_summary(session: AsyncSession, user_id: UUID, year: int) -> TaxSummary:
    # 1. Total Income
    income_query = select(func.sum(Transaction.amount)).where(
        Transaction.user_id == user_id,
        Transaction.type == TransactionType.INCOME,
        extract('year', Transaction.date) == year
    )
    income_res = await session.execute(income_query)
    total_income = income_res.scalar() or 0.0

    # 2. Tax Paid at Source (TPS)
    tps_query = select(func.sum(Transaction.tax_deducted_at_source)).where(
        Transaction.user_id == user_id,
        Transaction.type == TransactionType.INCOME, # Assuming TPS is on Income
        extract('year', Transaction.date) == year
    )
    tps_res = await session.execute(tps_query)
    paid_at_source = tps_res.scalar() or 0.0

    # 3. Tax Paid Manually (Expense category = 'Tax' or similar)
    # We need to find categories usually named 'Tax'. Or we can rely on a specific logic.
    # For now, let's look for categories with 'tax' in title (case insensitive)
    # This is a bit loose but MVP friendly.
    # Better: User explicitly categorized as 'Tax'. 
    # Let's query transactions joined with Category where category.title ilike '%tax%'
    manual_tax_query = select(func.sum(Transaction.amount)).join(Category).where(
        Transaction.user_id == user_id,
        Transaction.type == TransactionType.EXPENSE,
        Category.title.ilike("%tax%"),
        extract('year', Transaction.date) == year
    )
    manual_res = await session.execute(manual_tax_query)
    paid_manually = manual_res.scalar() or 0.0

    # 4. Settings (Deductions)
    settings_query = select(TaxSettings).where(TaxSettings.user_id == user_id, TaxSettings.year == year)
    settings_res = await session.execute(settings_query)
    settings = settings_res.scalars().first()
    
    deduction = settings.standard_deduction if settings else 0.0
    allowance = settings.tax_free_allowance if settings else 0.0

    # 5. Calculate Liability using Brackets
    brackets = await get_brackets(session, user_id, year)
    
    taxable_income = max(0, total_income - deduction - allowance)
    liability = 0.0
    
    if not brackets:
        # Fallback flat rate if no brackets? Or 0?
        liability = 0.0
    else:
        remaining_income = taxable_income
        # Logic: sequential brackets.
        # Assuming brackets are 0-10k, 10k-50k, etc.
        # But usually users enter brackets as "First 10k @ 0%", "Next 40k @ 10%".
        # Current model: min_income, max_income.
        # Let's assume they cover the whole range.
        
        # Sort by min_income
        brackets.sort(key=lambda b: b.min_income)
        
        # Better logic: Progressive calculation
        # If income is 50000.
        # Bracket 1: 0 - 10000 @ 0% -> Tax on 10000 = 0.
        # Bracket 2: 10000 - infinity @ 10% -> Tax on (50000-10000) = 4000.
        
        for bracket in brackets:
            if taxable_income < bracket.min_income:
                continue
                
            # Calculate overlap
            upper = bracket.max_income if bracket.max_income else float('inf')
            lower = bracket.min_income
            
            # Income captured in this bracket
            # The bracket applies to income BETWEEN min and max.
            # So if income is 50,000. Bracket is 10k-50k. 
            # Income inside this bracket is min(50k, max) - min.
            
            # Wait, standard bracket definition is "Income between X and Y".
            # Amount to tax = min(assessable, upper) - lower.
            # Only if assessable > lower.
            
            assessable_in_bracket = min(taxable_income, upper) - lower
            if assessable_in_bracket > 0:
                liability += assessable_in_bracket * (bracket.rate / 100)

    return TaxSummary(
        year=year,
        total_income=total_income,
        taxable_income=taxable_income,
        total_tax_liability=liability,
        tax_paid_at_source=paid_at_source,
        tax_paid_manually=paid_manually,
        tax_due=liability - (paid_at_source + paid_manually),
        transactions_count=0 # Placeholder or fetch count if needed
    )
