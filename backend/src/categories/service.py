from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from src.categories.models import Category

async def ensure_defaults(session: AsyncSession):
    # Check if exists
    result = await session.execute(select(Category))
    existing = result.scalars().all()
    if existing:
        print(f"--- CATEGORY DATA CHECK ---")
        print(f"Found {len(existing)} categories in DB: {[c.title for c in existing]}")
        print(f"---------------------------")
        return

    print("Populating default categories (DB is empty)...")

    defaults = [
        {"id": "housing", "title": "Housing", "type": "expense", "icon": "home", "subcategories": [
            {"id": "rent", "title": "Rent", "type": "expense"},
            {"id": "utilities", "title": "Utilities", "type": "expense"}
        ]},
        {"id": "food", "title": "Food", "type": "expense", "icon": "utensils", "subcategories": [
            {"id": "groceries", "title": "Groceries", "type": "expense"},
            {"id": "dining_out", "title": "Dining Out", "type": "expense"}
        ]},
        {"id": "salary", "title": "Salary", "type": "income", "icon": "dollar-sign", "subcategories": []},
        {"id": "freelance", "title": "Freelance", "type": "income", "icon": "briefcase", "subcategories": []}
    ]
    
    for cat_data in defaults:
        subs = cat_data.pop("subcategories")
        cat = Category(**cat_data)
        session.add(cat)
        
        for sub in subs:
            sub["parent_category_id"] = cat.id
            sub_cat = Category(**sub)
            session.add(sub_cat)
    
    await session.commit()
