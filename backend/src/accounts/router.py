
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from src.core.database import get_session
from src.auth.router import get_current_user
from src.auth.models import User
from . import service, schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.AccountResponse])
async def read_accounts(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    return await service.get_accounts(session, current_user.id)

@router.post("/", response_model=schemas.AccountResponse)
async def create_account(
    account: schemas.AccountCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    return await service.create_account(session, account, current_user.id)

@router.put("/{account_id}", response_model=schemas.AccountResponse)
async def update_account(
    account_id: UUID,
    account: schemas.AccountUpdate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    updated = await service.update_account(session, account_id, account, current_user.id)
    if not updated:
        raise HTTPException(status_code=404, detail="Account not found")
    return updated

@router.delete("/{account_id}")
async def delete_account(
    account_id: UUID,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if not await service.delete_account(session, account_id, current_user.id):
        raise HTTPException(status_code=404, detail="Account not found")
    return {"message": "Account deleted successfully"}
