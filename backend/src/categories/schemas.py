import uuid
from sqlmodel import SQLModel
from typing import List, Optional
from src.categories.models import CategoryBase, TransactionType

class CategoryCreate(SQLModel):
    title: str
    type: TransactionType
    icon: str | None = None
    parent_category_id: uuid.UUID | None = None

class CategoryRead(CategoryBase):
    id: uuid.UUID
    subcategories: List["CategoryRead"] = [] # Recursive?

class CategoryUpdate(SQLModel):
    title: str | None = None
    icon: str | None = None
    sort_order: int | None = None
