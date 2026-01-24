from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from sqlalchemy import desc

from src.core.database import get_session
from src.core.deps import get_active_user
from src.auth.models import User
from src.transactions.models import Transaction
from src.transactions.schemas import TransactionCreate, TransactionRead

router = APIRouter()

@router.post("/", response_model=TransactionRead)
async def create_transaction(
    transaction_in: TransactionCreate,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_active_user)]
):
    transaction = Transaction(**transaction_in.dict(), user_id=current_user.id)
    session.add(transaction)
    await session.commit()
    await session.refresh(transaction)
    return transaction

@router.get("/", response_model=List[TransactionRead])
async def get_transactions(
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_active_user)],
    skip: int = 0,
    limit: int = 20
):
    # Helper query to join category for title?
    # SQLModel should load relationships lazily or we can use response_model to auto-fetch?
    # Async lazy loading is tricky. Better to eager load.
    # For now, let's just return basic and relying on lazy load might fail in async Pydantic recursion if not careful.
    # Actually, the schema expects `description` `title` which are on Transaction.
    # But `category_title` is custom in Read Schema.
    query = select(Transaction).where(Transaction.user_id == current_user.id).order_by(desc(Transaction.date)).offset(skip).limit(limit)
    result = await session.execute(query)
    transactions = result.scalars().all()
    # We might need to manually populate category_title or use a joined load.
    # For MVP speed, let the frontend fetch categories or just ID. 
    # But user wants "clean code".
    # I'll update schema to just optional.
    return transactions
