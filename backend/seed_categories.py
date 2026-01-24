import sys
import os
import asyncio
import uuid


# Add backend root to path
sys.path.append(os.path.dirname(__file__))

from sqlmodel import delete
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.database import engine
from src.categories.models import Category
from src.transactions.models import Transaction

def slugify(text):
    return text.lower().strip().replace(' ', '-').replace('/', '-').replace('&', 'and').replace(',', '')

async def seed_data():
    # Create Async Session
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    
    async with async_session() as session:
        print("Clearing existing categories...")
        await session.execute(delete(Category))
        await session.commit()
        
        print("Seeding new categories...")

        income_data = [
            ("Salary", "income", "wallet", [
                ("Full-Time", "briefcase"),
                ("Freelance", "briefcase"),
                ("Bonus", "hand-coins")
            ]),
            ("Investments", "income", "trending-up", [
                ("Dividends", "coins"),
                ("Crypto", "bitcoin"),
                ("Real Estate", "building")
            ]),
            ("Gifts & Grants", "income", "gift", [
                ("Birthday", "gift"), 
                ("Holidays", "gift")
            ]),
             ("Other Income", "income", "landmark", [])
        ]

        expense_data = [
            ("Housing", "expense", "home", [
                ("Rent/Mortgage", "home"),
                ("Utilities", "zap"),
                ("Internet & Wifi", "wifi"),
                ("Repairs & Maintenance", "wrench"),
                ("Furniture", "armchair")
            ]),
            ("Food & Drink", "expense", "utensils", [
                ("Groceries", "apple"),
                ("Dining Out", "coffee"),
                ("Drinks", "beer"),
                ("Snacks", "cookie")
            ]),
            ("Transportation", "expense", "car", [
                ("Fuel", "fuel"),
                ("Public Transport", "bus"),
                ("Car Maintenance", "wrench"),
                ("Flights", "plane"),
                ("Taxi/Uber", "car")
            ]),
            ("Personal Care", "expense", "user", [
                ("Clothing", "shirt"),
                ("Haircut/Salon", "scissors"),
                ("Gym & Fitness", "dumbbell"),
                ("Cosmetics", "heart")
            ]),
            ("Entertainment", "expense", "gamepad", [
                ("Movies & TV", "tv"),
                ("Games", "gamepad"),
                ("Music", "music"),
                ("Subscriptions", "repeat"),
                ("Events", "ticket") 
            ]),
            ("Health", "expense", "heart", [
                ("Doctor", "user"),
                ("Pharmacy", "pill"),
                ("Hospital", "hospital"),
                ("Health Insurance", "shield")
            ]),
             ("Education", "expense", "graduation-cap", [
                ("Tuition", "landmark"),
                ("Books", "file-text"),
                ("Courses", "file-text")
            ]),
             ("Miscellaneous", "expense", "globe", [
                ("Donations", "gift"),
                ("Pet Care", "paw-print")
            ])
        ]

        all_cats = income_data + expense_data
        
        global_sort_order = 0

        for parent_title, cat_type, parent_icon, subs in all_cats:
            parent_id = str(uuid.uuid4())
            parent = Category(
                id=parent_id,
                title=parent_title,
                type=cat_type,
                icon=parent_icon,
                slug=slugify(parent_title),
                sort_order=global_sort_order
            )
            session.add(parent)
            global_sort_order += 1
            
            sub_sort_order = 0
            for sub_title, sub_icon in subs:
                sub = Category(
                    id=str(uuid.uuid4()),
                    title=sub_title,
                    type=cat_type,
                    icon=sub_icon,
                    parent_category_id=parent_id,
                    slug=slugify(sub_title),
                    sort_order=sub_sort_order
                )
                session.add(sub)
                sub_sort_order += 1
        
        await session.commit()
        print("Seeding complete!")

def run_seed():
    asyncio.run(seed_data())

if __name__ == "__main__":
    run_seed()
