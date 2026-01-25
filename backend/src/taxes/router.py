
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from src.core.database import get_session
from src.auth.router import get_current_user
from src.auth.models import User
from . import service, schemas

router = APIRouter()

@router.get("/summary", response_model=schemas.TaxSummary)
async def get_tax_summary(
    year: int = Query(..., ge=2000, le=3000),
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    return await service.calculate_summary(session, current_user.id, year)

@router.get("/brackets", response_model=List[schemas.TaxBracketResponse])
async def get_tax_brackets(
    year: int = Query(..., ge=2000, le=3000),
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    return await service.get_brackets(session, current_user.id, year)

@router.post("/brackets", response_model=schemas.TaxBracketResponse)
async def create_tax_bracket(
    bracket: schemas.TaxBracketCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    return await service.create_bracket(session, bracket, current_user.id)
