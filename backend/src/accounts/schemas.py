
from pydantic import BaseModel
from uuid import UUID
from typing import Optional
from .models import AccountType

class AccountBase(BaseModel):
    name: str
    type: AccountType
    currency: str = "USD"
    balance: float = 0.0
    interest_rate: float = 0.0
    account_number: Optional[str] = None
    bank_name: Optional[str] = None
    branch_name: Optional[str] = None
    is_active: bool = True

class AccountCreate(AccountBase):
    pass

class AccountUpdate(AccountBase):
    name: Optional[str] = None
    type: Optional[AccountType] = None
    currency: Optional[str] = None
    balance: Optional[float] = None
    interest_rate: Optional[float] = None
    account_number: Optional[str] = None
    bank_name: Optional[str] = None
    branch_name: Optional[str] = None
    is_active: Optional[bool] = None

class AccountResponse(AccountBase):
    id: UUID
    user_id: UUID

    class Config:
        from_attributes = True
