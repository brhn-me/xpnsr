
from sqlmodel import SQLModel
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
