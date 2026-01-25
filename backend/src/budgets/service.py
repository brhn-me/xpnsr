
from typing import List, Optional
from uuid import UUID
from sqlmodel import select
from sqlalchemy import func, extract
from sqlalchemy.ext.asyncio import AsyncSession
from .models import Budget
from .schemas import BudgetCreate, BudgetResponse
from src.transactions.models import Transaction, TransactionType

async def get_budgets(session: AsyncSession, user_id: UUID, month: int, year: int) -> List[BudgetResponse]:
    # 1. Fetch budgets
    statement = select(Budget).where(
        Budget.user_id == user_id,
        Budget.month == month,
        Budget.year == year
    )
    result = await session.execute(statement)
    budgets = result.scalars().all()

    results = []
    for budget in budgets:
        # 2. Calculate spent
        # Note: In async, we can do this query for each loop or optimize with a group by.
        # For simplicity/readability, query inside loop for now (N+1 but limited by category count).
        spend_query = select(func.sum(Transaction.amount)).where(
            Transaction.user_id == user_id,
            Transaction.category_id == budget.category_id,
            Transaction.type == TransactionType.EXPENSE,
            extract('month', Transaction.date) == month,
            extract('year', Transaction.date) == year
        )
        spend_result = await session.execute(spend_query)
        spent = spend_result.scalar() or 0.0
        
        percentage = (spent / budget.amount * 100) if budget.amount > 0 else 0
        
        results.append(BudgetResponse(
            id=budget.id,
            category_id=budget.category_id,
            amount=budget.amount,
            month=budget.month,
            year=budget.year,
            spent=spent,
            percentage=percentage
        ))

    return results

async def upsert_budget(session: AsyncSession, budget_in: BudgetCreate, user_id: UUID) -> Budget:
    statement = select(Budget).where(
        Budget.user_id == user_id,
        Budget.category_id == budget_in.category_id,
        Budget.month == budget_in.month,
        Budget.year == budget_in.year
    )
    result = await session.execute(statement)
    existing = result.scalars().first()

    if existing:
        existing.amount = budget_in.amount
        session.add(existing)
        await session.commit()
        await session.refresh(existing)
        return existing
    else:
        new_budget = Budget(**budget_in.dict(), user_id=user_id)
        session.add(new_budget)
        await session.commit()
        await session.refresh(new_budget)
        return new_budget

async def delete_budget(session: AsyncSession, budget_id: UUID, user_id: UUID) -> bool:
    budget = await session.get(Budget, budget_id)
    if not budget or budget.user_id != user_id:
        return False
    
    await session.delete(budget)
    await session.commit()
    return True
