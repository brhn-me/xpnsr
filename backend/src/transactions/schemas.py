import uuid
from datetime import datetime
from sqlmodel import SQLModel
from src.transactions.models import TransactionBase
from src.categories.models import TransactionType

class TransactionCreate(TransactionBase):
    pass

class TransactionRead(TransactionBase):
    id: uuid.UUID
    category_title: str | None = None
    category_icon: str | None = None

class TransactionUpdate(SQLModel):
    amount: float | None = None
    title: str | None = None
    category_id: str | None = None
