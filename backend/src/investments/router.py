
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from ..database import get_db
from ..auth.router import get_current_user
from ..auth.models import User
from . import service, schemas

router = APIRouter(
    prefix="/investments",
    tags=["investments"]
)

@router.get("/", response_model=List[schemas.InvestmentResponse])
def read_investments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.get_investments(db, current_user.id)

@router.post("/", response_model=schemas.InvestmentResponse)
def create_investment(
    investment: schemas.InvestmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.create_investment(db, investment, current_user.id)

@router.put("/{investment_id}", response_model=schemas.InvestmentResponse)
def update_investment(
    investment_id: UUID,
    investment: schemas.InvestmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    updated = service.update_investment(db, investment_id, investment, current_user.id)
    if not updated:
        raise HTTPException(status_code=404, detail="Investment not found")
    return updated

@router.delete("/{investment_id}")
def delete_investment(
    investment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not service.delete_investment(db, investment_id, current_user.id):
        raise HTTPException(status_code=404, detail="Investment not found")
    return {"message": "Investment deleted successfully"}
