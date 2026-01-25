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
    title: str
    type: TransactionType
    icon: str | None = None
    slug: str = Field(index=True, unique=True, nullable=False)
    sort_order: int = Field(default=0)
    parent_category_id: uuid.UUID | None = Field(default=None, foreign_key="category.id", ondelete="CASCADE")

class Category(CategoryBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    
    parent: Optional["Category"] = Relationship(back_populates="subcategories", sa_relationship_kwargs={"remote_side": "Category.id"})
    subcategories: List["Category"] = Relationship(
        back_populates="parent",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    transactions: List["Transaction"] = Relationship(
        back_populates="category",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
