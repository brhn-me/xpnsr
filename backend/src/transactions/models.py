import uuid
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship
from src.categories.models import TransactionType, Category
from src.auth.models import User
from typing import Optional

class TransactionBase(SQLModel):
    amount: float
    type: TransactionType
    title: str
    description: str | None = None
    date: datetime = Field(default_factory=datetime.utcnow)
    category_id: uuid.UUID = Field(foreign_key="category.id")
    tax_deducted_at_source: float = Field(default=0.0)
    subcategory_id: str | None = None # Optional, effectively logic handled in frontend or separate FK if we want strict enforcement? For now just string or FK to category.
    # User asked for subcategory. If subcategory is just a Category with a parent, then it is a Category.
    # Refined: We can just have category_id pointing to the subcategory. 
    # But user asked for "category" AND "subcategory" fields in the request description? 
    # "category", "subcategory".
    # If I structure it as just `category_id` (which leads to a category that might be a subcategory), it's cleaner.
    # However, to be explicit, I will assume the user wants to store both for query ease or strictly following the prompt.
    # But usually subcategory implies hierarchy. If I pick a subcategory, I know the category.
    # I'll stick to `category_id` being the specific category (which could be a subcategory).
    # And I'll add `user_id`.

class Transaction(TransactionBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id")
    
    user: User = Relationship()
    category: Category = Relationship(back_populates="transactions")
