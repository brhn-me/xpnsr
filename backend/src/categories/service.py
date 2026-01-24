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
        # INCOME
        {"title": "Salary", "type": "income", "icon": "dollar-sign", "subcategories": [
            {"title": "Bonus", "type": "income"},
            {"title": "Regular", "type": "income"}
        ]},
        {"title": "Freelance", "type": "income", "icon": "briefcase", "subcategories": [
            {"title": "Contract", "type": "income"},
            {"title": "Consulting", "type": "income"}
        ]},
        {"title": "Investments", "type": "income", "icon": "trending-up", "subcategories": [
            {"title": "Dividends", "type": "income"},
            {"title": "Interest", "type": "income"},
            {"title": "Crypto", "type": "income"}
        ]},
        {"title": "Gifts", "type": "income", "icon": "gift", "subcategories": []},
        {"title": "Other Income", "type": "income", "icon": "banknote", "subcategories": []},

        # EXPENSES
        {"title": "Housing", "type": "expense", "icon": "home", "subcategories": [
            {"title": "Rent", "type": "expense"},
            {"title": "Utilities", "type": "expense", "icon": "zap"},
            {"title": "Internet", "type": "expense", "icon": "wifi"},
            {"title": "Maintenance", "type": "expense", "icon": "wrench"}
        ]},
        {"title": "Food", "type": "expense", "icon": "utensils", "subcategories": [
            {"title": "Groceries", "type": "expense", "icon": "apple"},
            {"title": "Dining Out", "type": "expense", "icon": "coffee"},
            {"title": "Snacks", "type": "expense"}
        ]},
        {"title": "Transportation", "type": "expense", "icon": "car", "subcategories": [
            {"title": "Fuel", "type": "expense", "icon": "fuel"},
            {"title": "Public Transit", "type": "expense", "icon": "bus"},
            {"title": "Maintenance", "type": "expense"},
            {"title": "Parking", "type": "expense"}
        ]},
        {"title": "Entertainment", "type": "expense", "icon": "gamepad", "subcategories": [
            {"title": "Movies", "type": "expense", "icon": "tv"},
            {"title": "Music", "type": "expense", "icon": "music"},
            {"title": "Games", "type": "expense"},
            {"title": "Hobbies", "type": "expense"}
        ]},
        {"title": "Health", "type": "expense", "icon": "heart", "subcategories": [
            {"title": "Medical", "type": "expense"},
            {"title": "Pharmacy", "type": "expense", "icon": "pill"},
            {"title": "Fitness", "type": "expense", "icon": "dumbbell"}
        ]},
        {"title": "Shopping", "type": "expense", "icon": "shopping-cart", "subcategories": [
            {"title": "Clothing", "type": "expense", "icon": "shirt"},
            {"title": "Electronics", "type": "expense", "icon": "smartphone"},
            {"title": "Home", "type": "expense", "icon": "armchair"}
        ]},
        {"title": "Personal", "type": "expense", "icon": "user", "subcategories": [
            {"title": "Education", "type": "expense", "icon": "graduation-cap"},
            {"title": "Grooming", "type": "expense", "icon": "scissors"}
        ]},
        {"title": "Travel", "type": "expense", "icon": "plane", "subcategories": [
            {"title": "Flights", "type": "expense"},
            {"title": "Accommodation", "type": "expense", "icon": "building"},
            {"title": "Activities", "type": "expense"}
        ]},
        {"title": "Bills & Fees", "type": "expense", "icon": "credit-card", "subcategories": [
            {"title": "Phone", "type": "expense", "icon": "smartphone"},
            {"title": "Insurance", "type": "expense"},
            {"title": "Taxes", "type": "expense"}
        ]}
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
            sub_slug = generate_slug(f"{cat.title} {sub['title']}")
            sub_cat = Category(
                **sub,
                slug=sub_slug,
                parent_category_id=cat.id, # Now UUID
                sort_order=order_counter 
            )
            order_counter += 1
            session.add(sub_cat)
    
    await session.commit()
