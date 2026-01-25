import uuid
from enum import Enum
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from src.categories.models import Category
from src.auth.models import User

class Frequency(str, Enum):
    MONTHLY = "monthly"
    YEARLY = "yearly"

class RecurringBillBase(SQLModel):
    title: str
    amount: float
    frequency: Frequency = Frequency.MONTHLY
    day_of_month: int = Field(ge=1, le=31, description="Day of the month the bill is due")
    month_of_year: int | None = Field(default=None, ge=1, le=12, description="Month of the year (for yearly bills)")
    category_id: uuid.UUID = Field(foreign_key="category.id")
    
class RecurringBill(RecurringBillBase, table=True):
    __tablename__ = "recurring_bill"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id")
    
    user: User = Relationship()
    category: Category = Relationship()
