
import uuid
from sqlmodel import SQLModel, Field
from typing import Optional

class TaxBracket(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id")
    year: int
    min_income: float
    max_income: Optional[float] = None # None means infinity
    rate: float # Percentage 0-100

class TaxSettings(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id")
    year: int
    standard_deduction: float = Field(default=0.0)
    tax_free_allowance: float = Field(default=0.0)
