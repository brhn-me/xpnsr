
import uuid
from datetime import datetime
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

class TaxExemptCategory(SQLModel, table=True):
    category_id: uuid.UUID = Field(primary_key=True, foreign_key="category.id")
    user_id: uuid.UUID = Field(primary_key=True, foreign_key="user.id")

class TaxFiling(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", index=True)
    year: int = Field(index=True)
    
    # Personal Info
    full_name: str
    tax_id: str | None = None
    employment_status: str | None = None # Employed, Self-Employed, etc.
    
    # Income Details
    basic_salary: float = 0.0
    house_rent: float = 0.0
    medical_allowance: float = 0.0
    conveyance: float = 0.0
    business_income: float = 0.0
    business_expense: float = 0.0
    other_income: float = 0.0
    
    # Deductions / Investments
    provident_fund: float = 0.0
    insurance: float = 0.0
    savings_certificate: float = 0.0
    donations: float = 0.0
    
    # Reliefs
    dependents: int = 0
    disability_relief: bool = False
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
