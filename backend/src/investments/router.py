
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from src.core.database import get_session
from src.auth.router import get_current_user
from src.auth.models import User
from . import service, schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.InvestmentResponse])
async def read_investments(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    return await service.get_investments(session, current_user.id)

@router.post("/", response_model=schemas.InvestmentResponse)
async def create_investment(
    investment: schemas.InvestmentCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    return await service.create_investment(session, investment, current_user.id)

@router.put("/{investment_id}", response_model=schemas.InvestmentResponse)
async def update_investment(
    investment_id: UUID,
    investment: schemas.InvestmentUpdate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    updated = await service.update_investment(session, investment_id, investment, current_user.id)
    if not updated:
        raise HTTPException(status_code=404, detail="Investment not found")
    return updated

@router.delete("/{investment_id}")
async def delete_investment(
    investment_id: UUID,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if not await service.delete_investment(session, investment_id, current_user.id):
        raise HTTPException(status_code=404, detail="Investment not found")
    return {"message": "Investment deleted successfully"}
