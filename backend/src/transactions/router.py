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
    data = transaction_in.dict()
    # Fix: remove timezone info as Postgres might complain if column is naive
    if data.get('date'):
        data['date'] = data['date'].replace(tzinfo=None)
        
    transaction = Transaction(**data, user_id=current_user.id)
    session.add(transaction)
    await session.commit()
    await session.refresh(transaction)
    return transaction

@router.get("/", response_model=List[TransactionRead])
async def get_transactions(
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_active_user)],
    skip: int = 0,
    limit: int = 20,
    search: str | None = None,
    type: str | None = None
):
    query = select(Transaction).where(Transaction.user_id == current_user.id)

    if search:
        # Case insensitive search on title
        query = query.where(Transaction.title.ilike(f"%{search}%"))
    
    if type and type in ['income', 'expense']:
        query = query.where(Transaction.type == type)

    query = query.order_by(desc(Transaction.date)).offset(skip).limit(limit)
    result = await session.execute(query)
    transactions = result.scalars().all()
    # We might need to manually populate category_title or use a joined load.
    # For MVP speed, let the frontend fetch categories or just ID. 
    # But user wants "clean code".
    # I'll update schema to just optional.
    return transactions

@router.delete("/{transaction_id}")
async def delete_transaction(
    transaction_id: str,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_active_user)]
):
    transaction = await session.get(Transaction, transaction_id)
    if not transaction or transaction.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    await session.delete(transaction)
    await session.commit()
    return {"ok": True}

@router.put("/{transaction_id}", response_model=TransactionRead)
async def update_transaction(
    transaction_id: str,
    transaction_in: TransactionCreate,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_active_user)]
):
    transaction = await session.get(Transaction, transaction_id)
    if not transaction or transaction.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Transaction not found")

    data = transaction_in.dict(exclude_unset=True)
    if data.get('date'):
        data['date'] = data['date'].replace(tzinfo=None)

    for key, value in data.items():
        setattr(transaction, key, value)

    session.add(transaction)
    await session.commit()
    await session.refresh(transaction)
    return transaction
