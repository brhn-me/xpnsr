
import uuid
from sqlmodel import SQLModel, Field
from datetime import datetime

class BudgetBase(SQLModel):
    category_id: uuid.UUID = Field(foreign_key="category.id")
    amount: float
    month: int
    year: int
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Budget(BudgetBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id")
