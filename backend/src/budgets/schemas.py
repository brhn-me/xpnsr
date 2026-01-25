
from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class BudgetBase(BaseModel):
    category_id: UUID
    amount: float
    month: int
    year: int

class BudgetCreate(BudgetBase):
    pass

class BudgetUpdate(BaseModel):
    amount: float

class BudgetResponse(BudgetBase):
    id: UUID
    spent: float = 0.0
    percentage: float = 0.0

    class Config:
        from_attributes = True
