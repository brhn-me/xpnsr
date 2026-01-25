import sys
import os
import asyncio
import uuid
import random
from datetime import datetime, timedelta

# Add backend root to path
sys.path.append(os.path.dirname(__file__))

from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.core.database import engine
from src.categories.models import Category
from src.transactions.models import Transaction, TransactionType
from src.auth.models import User
from src.core.config import settings

async def populate_data():
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    
    async with async_session() as session:
        # Get Default User
        result = await session.execute(select(User).where(User.email == settings.SUPER_ADMIN))
        user = result.scalars().first()
        if not user:
            print("Default user not found, please run main.py first to seed user.")
            return

        # Get Categories
        result = await session.execute(select(Category))
        categories = result.scalars().all()
        if not categories:
             print("No categories found. Run seed_categories.py first.")
             return
        
        income_cats = [c for c in categories if c.type == TransactionType.INCOME]
        expense_cats = [c for c in categories if c.type == TransactionType.EXPENSE]

        print(f"Found {len(income_cats)} income categories and {len(expense_cats)} expense categories.")

        transactions = []
        
        # 1. Past 12 months data
        start_date = datetime.utcnow() - timedelta(days=365)
        
        for _ in range(120): # Generate 120 transactions
            # Random date within last year
            random_days = random.randint(0, 365)
            tx_date = start_date + timedelta(days=random_days)
            
            # Determine type (70% expense, 30% income)
            if random.random() < 0.3 and income_cats:
                cat = random.choice(income_cats)
                amount = random.uniform(1000, 5000) # Salary/Income range
                tx_type = TransactionType.INCOME
            elif expense_cats:
                cat = random.choice(expense_cats)
                amount = random.uniform(10, 500) # Expense range
                tx_type = TransactionType.EXPENSE
            else:
                continue

            tx = Transaction(
                title=f"Test {cat.title} {random.randint(1, 100)}",
                description=f"Dummy transaction for {cat.title}",
                amount=round(amount, 2),
                type=tx_type,
                date=tx_date,
                category_id=cat.id,
                user_id=user.id
            )
            transactions.append(tx)

        # Bulk save
        session.add_all(transactions)
        await session.commit()
        print(f"Successfully added {len(transactions)} dummy transactions!")

if __name__ == "__main__":
    asyncio.run(populate_data())
