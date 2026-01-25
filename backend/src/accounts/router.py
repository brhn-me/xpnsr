
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from ..database import get_db
from ..auth.router import get_current_user
from ..auth.models import User
from . import service, schemas

router = APIRouter(
    prefix="/accounts",
    tags=["accounts"]
)

@router.get("/", response_model=List[schemas.AccountResponse])
def read_accounts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.get_accounts(db, current_user.id)

@router.post("/", response_model=schemas.AccountResponse)
def create_account(
    account: schemas.AccountCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.create_account(db, account, current_user.id)

@router.put("/{account_id}", response_model=schemas.AccountResponse)
def update_account(
    account_id: UUID,
    account: schemas.AccountUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    updated = service.update_account(db, account_id, account, current_user.id)
    if not updated:
        raise HTTPException(status_code=404, detail="Account not found")
    return updated

@router.delete("/{account_id}")
def delete_account(
    account_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not service.delete_account(db, account_id, current_user.id):
        raise HTTPException(status_code=404, detail="Account not found")
    return {"message": "Account deleted successfully"}
