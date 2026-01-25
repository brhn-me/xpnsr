
from pydantic import BaseModel
from uuid import UUID
from typing import Optional
from datetime import date
from .models import InvestmentType, InvestmentStatus

class InvestmentBase(BaseModel):
    title: str
    type: InvestmentType
    account_id: Optional[UUID] = None
    principal_amount: float
    current_value: float
    interest_rate: float = 0.0
    interest_amount: float = 0.0
    start_date: date
    maturity_date: Optional[date] = None
    tenure_months: int = 0
    auto_renew: bool = False
    tax_rate: float = 0.0
    tax_amount: float = 0.0
    status: InvestmentStatus = InvestmentStatus.ACTIVE

class InvestmentCreate(InvestmentBase):
    pass

class InvestmentUpdate(InvestmentBase):
    title: Optional[str] = None
    type: Optional[InvestmentType] = None
    account_id: Optional[UUID] = None
    principal_amount: Optional[float] = None
    current_value: Optional[float] = None
    interest_rate: Optional[float] = None
    interest_amount: Optional[float] = None
    start_date: Optional[date] = None
    maturity_date: Optional[date] = None
    tenure_months: Optional[int] = None
    auto_renew: Optional[bool] = None
    tax_rate: Optional[float] = None
    tax_amount: Optional[float] = None
    status: Optional[InvestmentStatus] = None

class InvestmentResponse(InvestmentBase):
    id: UUID
    user_id: UUID

    class Config:
        from_attributes = True
