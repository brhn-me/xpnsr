
from typing import List, Optional
from uuid import UUID
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from .models import Investment
from .schemas import InvestmentCreate, InvestmentUpdate

async def get_investments(session: AsyncSession, user_id: UUID) -> List[Investment]:
    statement = select(Investment).where(Investment.user_id == user_id)
    result = await session.execute(statement)
    return result.scalars().all()

async def create_investment(session: AsyncSession, investment_in: InvestmentCreate, user_id: UUID) -> Investment:
    investment = Investment(**investment_in.dict(), user_id=user_id)
    session.add(investment)
    await session.commit()
    await session.refresh(investment)
    return investment

async def update_investment(session: AsyncSession, investment_id: UUID, investment_in: InvestmentUpdate, user_id: UUID) -> Optional[Investment]:
    investment = await session.get(Investment, investment_id)
    if not investment or investment.user_id != user_id:
        return None
    
    update_data = investment_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(investment, key, value)
    
    session.add(investment)
    await session.commit()
    await session.refresh(investment)
    return investment

async def delete_investment(session: AsyncSession, investment_id: UUID, user_id: UUID) -> bool:
    investment = await session.get(Investment, investment_id)
    if not investment or investment.user_id != user_id:
        return False
    
    await session.delete(investment)
    await session.commit()
    return True
