
from typing import List, Optional
from uuid import UUID
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from .models import Account
from .schemas import AccountCreate, AccountUpdate

async def get_accounts(session: AsyncSession, user_id: UUID) -> List[Account]:
    statement = select(Account).where(Account.user_id == user_id)
    result = await session.execute(statement)
    return result.scalars().all()

async def create_account(session: AsyncSession, account_in: AccountCreate, user_id: UUID) -> Account:
    account = Account(**account_in.dict(), user_id=user_id)
    session.add(account)
    await session.commit()
    await session.refresh(account)
    return account

async def update_account(session: AsyncSession, account_id: UUID, account_in: AccountUpdate, user_id: UUID) -> Optional[Account]:
    account = await session.get(Account, account_id)
    if not account or account.user_id != user_id:
        return None
    
    update_data = account_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(account, key, value)
    
    session.add(account)
    await session.commit()
    await session.refresh(account)
    return account

async def delete_account(session: AsyncSession, account_id: UUID, user_id: UUID) -> bool:
    account = await session.get(Account, account_id)
    if not account or account.user_id != user_id:
        return False
    
    await session.delete(account)
    await session.commit()
    return True
