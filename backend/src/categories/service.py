from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from src.categories.models import Category
from src.categories.router import generate_slug

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
        {"title": "Housing", "type": "expense", "icon": "home", "subcategories": [
            {"title": "Rent", "type": "expense"},
            {"title": "Utilities", "type": "expense"}
        ]},
        {"title": "Food", "type": "expense", "icon": "utensils", "subcategories": [
            {"title": "Groceries", "type": "expense"},
            {"title": "Dining Out", "type": "expense"}
        ]},
        {"title": "Salary", "type": "income", "icon": "dollar-sign", "subcategories": []},
        {"title": "Freelance", "type": "income", "icon": "briefcase", "subcategories": []}
    ]
    
    order_counter = 0
    for cat_data in defaults:
        subs = cat_data.pop("subcategories")
        
        # Create Slug
        slug = generate_slug(cat_data["title"])
        
        cat = Category(
            **cat_data,
            slug=slug,
            sort_order=order_counter
        )
        order_counter += 1
        
        session.add(cat)
        await session.flush() # Flush to get ID for subcategories
        
        for sub in subs:
            sub_slug = generate_slug(sub["title"])
            sub_cat = Category(
                **sub,
                slug=sub_slug,
                parent_category_id=cat.id, # Now UUID
                sort_order=order_counter 
            )
            order_counter += 1
            session.add(sub_cat)
    
    await session.commit()
