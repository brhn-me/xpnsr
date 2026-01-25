
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from src.core.database import get_session
from src.auth.router import get_current_user
from src.auth.models import User
from . import service, schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.BudgetResponse])
async def read_budgets(
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2000, le=3000),
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    return await service.get_budgets(session, current_user.id, month, year)

@router.post("/", response_model=schemas.BudgetResponse)
async def set_budget(
    budget: schemas.BudgetCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    db_budget = await service.upsert_budget(session, budget, current_user.id)
    return schemas.BudgetResponse(
        id=db_budget.id,
        category_id=db_budget.category_id,
        amount=db_budget.amount,
        month=db_budget.month,
        year=db_budget.year,
        spent=0.0,
        percentage=0.0
    )

@router.delete("/{budget_id}")
async def delete_budget(
    budget_id: UUID,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if not await service.delete_budget(session, budget_id, current_user.id):
        raise HTTPException(status_code=404, detail="Budget not found")
    return {"message": "Budget deleted successfully"}
