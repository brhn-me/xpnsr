from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from datetime import datetime
from typing import List, Any
from pydantic import BaseModel

from src.auth.models import User
from src.core.deps import get_current_user
from src.core.database import get_session
from src.recurring.models import RecurringBill, RecurringBillBase
from src.recurring.service import recurring_service
from src.categories.models import Category

router = APIRouter()

class RecurringBillRead(RecurringBillBase):
    id: uuid.UUID
    category: Category | None = None

class RecurringBillStatus(BaseModel):
    bill: RecurringBillRead
    status: str
    amount_paid: float

@router.get("/", response_model=List[RecurringBillStatus])
async def get_recurring_bills_status(
    month: int = Query(default=datetime.now().month),
    year: int = Query(default=datetime.now().year),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    valid_month = max(1, min(12, month))
    return await recurring_service.get_bills_status(session, current_user.id, valid_month, year)

@router.post("/", response_model=RecurringBill)
async def create_recurring_bill(
    bill_in: RecurringBillBase,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    # Verify category exists? (SQLAlchemy will fail FK if not)
    # Verify category exists? (SQLAlchemy will fail FK if not)
    bill = RecurringBill.model_validate(bill_in, update={"user_id": current_user.id})
    return await recurring_service.create_bill(session, bill)

@router.put("/{bill_id}", response_model=RecurringBill)
async def update_recurring_bill(
    bill_id: uuid.UUID,
    bill_in: RecurringBillBase,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    updated = await recurring_service.update_bill(session, bill_id, current_user.id, bill_in.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Bill not found")
    return updated

@router.delete("/{bill_id}")
async def delete_recurring_bill(
    bill_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    success = await recurring_service.delete_bill(session, bill_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Bill not found")
    return {"ok": True}
