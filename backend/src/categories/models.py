import uuid
from enum import Enum
from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from src.transactions.models import Transaction

class TransactionType(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"

class CategoryBase(SQLModel):
    id: str = Field(primary_key=True) # unique string, lowercase underscored
    title: str
    type: TransactionType
    icon: str | None = None
    parent_category_id: str | None = Field(default=None, foreign_key="category.id")

class Category(CategoryBase, table=True):
    parent: Optional["Category"] = Relationship(back_populates="subcategories", sa_relationship_kwargs={"remote_side": "Category.id"})
    subcategories: List["Category"] = Relationship(back_populates="parent")
    transactions: List["Transaction"] = Relationship(back_populates="category")
