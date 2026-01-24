from sqlmodel import SQLModel
from typing import List, Optional
from src.categories.models import CategoryBase, TransactionType

class CategoryCreate(CategoryBase):
    pass

class CategoryRead(CategoryBase):
    subcategories: List["CategoryRead"] = [] # Recursive?

class CategoryUpdate(SQLModel):
    title: str | None = None
    icon: str | None = None
