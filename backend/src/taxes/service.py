from typing import List, Optional
from uuid import UUID
from datetime import datetime
from sqlmodel import select, func, extract
from sqlalchemy.ext.asyncio import AsyncSession
from src.transactions.models import Transaction, TransactionType
from src.categories.models import Category
from .models import TaxBracket, TaxSettings, TaxExemptCategory
from .schemas import TaxBracketCreate, TaxSummary, TaxExemptionCreate, TaxSettingsUpdate

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

async def get_settings(session: AsyncSession, user_id: UUID, year: int) -> TaxSettings:
    statement = select(TaxSettings).where(TaxSettings.user_id == user_id, TaxSettings.year == year)
    result = await session.execute(statement)
    settings = result.scalars().first()
    if not settings:
        settings = TaxSettings(user_id=user_id, year=year)
        session.add(settings)
        await session.commit()
        await session.refresh(settings)
    return settings

async def update_settings(session: AsyncSession, user_id: UUID, year: int, settings_in: TaxSettingsUpdate) -> TaxSettings:
    settings = await get_settings(session, user_id, year)
    settings.standard_deduction = settings_in.standard_deduction
    settings.tax_free_allowance = settings_in.tax_free_allowance
    session.add(settings)
    await session.commit()
    await session.refresh(settings)
    return settings

async def toggle_exemption(session: AsyncSession, user_id: UUID, exemption_in: TaxExemptionCreate) -> bool:
    statement = select(TaxExemptCategory).where(
        TaxExemptCategory.user_id == user_id,
        TaxExemptCategory.category_id == exemption_in.category_id
    )
    result = await session.execute(statement)
    existing = result.scalars().first()
    
    if exemption_in.is_exempt and not existing:
        new_exempt = TaxExemptCategory(user_id=user_id, category_id=exemption_in.category_id)
        session.add(new_exempt)
    elif not exemption_in.is_exempt and existing:
        await session.delete(existing)
    
    await session.commit()
    return exemption_in.is_exempt

async def get_exempt_categories(session: AsyncSession, user_id: UUID) -> List[UUID]:
    statement = select(TaxExemptCategory.category_id).where(TaxExemptCategory.user_id == user_id)
    result = await session.execute(statement)
    return result.scalars().all()

async def calculate_summary(session: AsyncSession, user_id: UUID, year: int) -> TaxSummary:
    # 0. Get Exempt Categories
    exempt_cats_res = await session.execute(select(TaxExemptCategory.category_id).where(TaxExemptCategory.user_id == user_id))
    exempt_ids = exempt_cats_res.scalars().all()

    # 1. Total Income (Excluding Exempt)
    income_query = select(func.sum(Transaction.amount)).where(
        Transaction.user_id == user_id,
        Transaction.type == TransactionType.INCOME,
        extract('year', Transaction.date) == year
    )
    if exempt_ids:
        income_query = income_query.where(Transaction.category_id.not_in(exempt_ids))

    income_res = await session.execute(income_query)
    taxable_income_base = income_res.scalar() or 0.0
    
    # 1a. Total Gross Income (For display)
    gross_query = select(func.sum(Transaction.amount)).where(
        Transaction.user_id == user_id,
        Transaction.type == TransactionType.INCOME,
        extract('year', Transaction.date) == year
    )
    gross_res = await session.execute(gross_query)
    total_gross_income = gross_res.scalar() or 0.0

    # 2. Tax Paid at Source (TPS)
    tps_query = select(func.sum(Transaction.tax_deducted_at_source)).where(
        Transaction.user_id == user_id,
        Transaction.type == TransactionType.INCOME, 
        extract('year', Transaction.date) == year
    )
    tps_res = await session.execute(tps_query)
    paid_at_source = tps_res.scalar() or 0.0

    # 3. Tax Paid Manually
    manual_tax_query = select(func.sum(Transaction.amount)).join(Category).where(
        Transaction.user_id == user_id,
        Transaction.type == TransactionType.EXPENSE,
        Category.title.ilike("%tax%"),
        extract('year', Transaction.date) == year
    )
    manual_res = await session.execute(manual_tax_query)
    paid_manually = manual_res.scalar() or 0.0

    # 4. Settings (Deductions)
    settings = await get_settings(session, user_id, year)
    
    deduction = settings.standard_deduction
    allowance = settings.tax_free_allowance

    # 5. Calculate Liability using Brackets
    brackets = await get_brackets(session, user_id, year)
    
    taxable_income = max(0, taxable_income_base - deduction - allowance)
    liability = 0.0
    
    if brackets:
        brackets.sort(key=lambda b: b.min_income)
        for bracket in brackets:
            if taxable_income < bracket.min_income:
                continue
            
            upper = bracket.max_income if bracket.max_income else float('inf')
            lower = bracket.min_income
            
            assessable_in_bracket = min(taxable_income, upper) - lower
            if assessable_in_bracket > 0:
                liability += assessable_in_bracket * (bracket.rate / 100)

    return TaxSummary(
        year=year,
        total_income=total_gross_income, # Return Gross
        taxable_income=taxable_income,
        total_tax_liability=liability,
        tax_paid_at_source=paid_at_source,
        tax_paid_manually=paid_manually,
        tax_due=liability - (paid_at_source + paid_manually),
        transactions_count=0 
    )

from .models import TaxFiling
from .schemas import TaxFilingCreate

async def get_filing(session: AsyncSession, user_id: UUID, year: int) -> TaxFiling | None:
    statement = select(TaxFiling).where(TaxFiling.user_id == user_id, TaxFiling.year == year)
    result = await session.execute(statement)
    return result.scalars().first()

async def create_or_update_filing(session: AsyncSession, user_id: UUID, year: int, filing_in: TaxFilingCreate) -> TaxFiling:
    filing = await get_filing(session, user_id, year)
    if not filing:
        filing = TaxFiling(user_id=user_id, year=year, **filing_in.dict(exclude={'year'}))
        session.add(filing)
    else:
        filing_data = filing_in.dict(exclude={'year'}, exclude_unset=True)
        for key, value in filing_data.items():
            setattr(filing, key, value)
        filing.updated_at = datetime.utcnow()
        session.add(filing)
    
    await session.commit()
    await session.refresh(filing)
    return filing
