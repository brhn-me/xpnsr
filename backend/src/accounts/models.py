
import uuid
from enum import Enum
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional

class AccountType(str, Enum):
    BANK = "BANK"
    MOBILE_WALLET = "MOBILE_WALLET"
    CASH = "CASH"

class AccountBase(SQLModel):
    name: str = Field(index=True)
    type: AccountType
    currency: str = Field(default="USD")
    balance: float = Field(default=0.0)
    interest_rate: float = Field(default=0.0)
    account_number: Optional[str] = None
    bank_name: Optional[str] = None
    branch_name: Optional[str] = None
    is_active: bool = Field(default=True)

class Account(AccountBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id")
    
    # Relationships
    # transactions: List["Transaction"] = Relationship(back_populates="account")
