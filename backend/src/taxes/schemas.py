
from sqlmodel import SQLModel
from datetime import datetime
from uuid import UUID
from typing import Optional, List

# Tax Bracket Schemas
class TaxBracketBase(SQLModel):
    year: int
    min_income: float
    max_income: Optional[float] = None
    rate: float

class TaxBracketCreate(TaxBracketBase):
    pass

class TaxBracketResponse(TaxBracketBase):
    id: UUID

# Tax Summary Schema
class TaxSummary(SQLModel):
    year: int
    total_income: float
    taxable_income: float
    total_tax_liability: float
    tax_paid_at_source: float
    tax_paid_manually: float
    tax_due: float
    transactions_count: int

class TaxExemptionCreate(SQLModel):
    category_id: UUID
    is_exempt: bool

class TaxSettingsUpdate(SQLModel):
    standard_deduction: float
    tax_free_allowance: float

class TaxFilingBase(SQLModel):
    year: int
    full_name: str
    tax_id: str | None = None
    employment_status: str | None = None
    basic_salary: float = 0.0
    house_rent: float = 0.0
    medical_allowance: float = 0.0
    conveyance: float = 0.0
    business_income: float = 0.0
    business_expense: float = 0.0
    other_income: float = 0.0
    provident_fund: float = 0.0
    insurance: float = 0.0
    savings_certificate: float = 0.0
    donations: float = 0.0
    dependents: int = 0
    disability_relief: bool = False

class TaxFilingCreate(TaxFilingBase):
    pass

class TaxFilingRead(TaxFilingBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
