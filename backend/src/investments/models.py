
import uuid
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import date
from enum import Enum

class InvestmentType(str, Enum):
    FD = "FD"
    BONDS = "BONDS"
    DPS = "DPS"
    STOCK = "STOCK"
    TRADING = "TRADING"

class InvestmentStatus(str, Enum):
    ACTIVE = "ACTIVE"
    MATURED = "MATURED"
    CLOSED = "CLOSED"

class InvestmentBase(SQLModel):
    title: str = Field(index=True)
    type: InvestmentType
    account_id: uuid.UUID = Field(foreign_key="account.id")
    
    principal_amount: float
    current_value: float
    interest_rate: float = Field(default=0.0)
    interest_amount: float = Field(default=0.0)
    start_date: date
    maturity_date: Optional[date] = None
    tenure_months: int = Field(default=0)
    
    auto_renew: bool = Field(default=False)
    tax_rate: float = Field(default=0.0)
    tax_amount: float = Field(default=0.0)
    status: InvestmentStatus = Field(default=InvestmentStatus.ACTIVE)

class Investment(InvestmentBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id")
    # Relationships
    # account: "Account" = Relationship()
