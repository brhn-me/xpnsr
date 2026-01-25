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
        {
            "title": "Salary",
            "type": "income",
            "icon": "dollar",
            "subcategories": [
                {"title": "Job", "type": "income", "icon": "job"},
                {"title": "Freelance", "type": "income", "icon": "deal"},
                {"title": "Bonus", "type": "income", "icon": "income"}
            ]
        },
        {
            "title": "Investments",
            "type": "income",
            "icon": "trending-up",
            "subcategories": [
                {"title": "Dividends", "type": "income", "icon": "growth"},
                {"title": "Crypto", "type": "income", "icon": "crypto"},
                {"title": "Real Estate", "type": "income", "icon": "office"},
                {"title": "Interest", "type": "income", "icon": "tax"}
            ]
        },
        {
            "title": "Gifts & Grants",
            "type": "income",
            "icon": "gift",
            "subcategories": [
                {"title": "Birthday", "type": "income", "icon": "celebration"},
                {"title": "Holidays", "type": "income", "icon": "party"}
            ]
        },
        {"title": "Loans", "type": "income", "icon": "income", "subcategories": []},
        {
            "title": "Housing",
            "type": "expense",
            "icon": "home",
            "subcategories": [
                {"title": "Rent", "type": "expense", "icon": "home"},
                {"title": "Mortgage", "type": "expense", "icon": "bank"}
            ]
        },
        {
            "title": "Utility Bills",
            "type": "expense",
            "icon": "bill",
            "subcategories": [
                {"title": "TV", "type": "expense", "icon": "tv"},
                {"title": "Laundry", "type": "expense", "icon": "cleaning"}
            ]
        },
        {
            "title": "Food",
            "type": "expense",
            "icon": "burger",
            "subcategories": [
                {"title": "Resturant", "type": "expense", "icon": "restaurant"},
                {"title": "Drinks", "type": "expense", "icon": "coffee"},
                {"title": "Snacks", "type": "expense", "icon": "snack"},
                {"title": "Beers", "type": "expense", "icon": "beer"}
            ]
        },
        {
            "title": "Transportation",
            "type": "expense",
            "icon": "public-transport",
            "subcategories": [
                {"title": "Ship", "type": "expense", "icon": "marina"},
                {"title": "Fuel", "type": "expense", "icon": "refuel"}
            ]
        },
        {
            "title": "Personal Care",
            "type": "expense",
            "icon": "vital",
            "subcategories": [
                {"title": "Grooming", "type": "expense", "icon": "grooming"},
                {"title": "Fitness", "type": "expense", "icon": "gym"}
            ]
        },
        {
            "title": "Entertainment",
            "type": "expense",
            "icon": "tv",
            "subcategories": [
                {"title": "Movies", "type": "expense", "icon": "movie"},
                {"title": "Games", "type": "expense", "icon": "gaming"},
                {"title": "Music", "type": "expense", "icon": "music"},
                {"title": "Subscriptions", "type": "expense", "icon": "cloudy"}
            ]
        },
        {
            "title": "Health",
            "type": "expense",
            "icon": "checkup",
            "subcategories": [
                {"title": "Doctor", "type": "expense", "icon": "checkup"},
                {"title": "Pharmacy", "type": "expense", "icon": "meds"},
                {"title": "Hospital", "type": "expense", "icon": "firstaid"},
                {"title": "Health Insurance", "type": "expense", "icon": "shield"}
            ]
        },
        {
            "title": "Education",
            "type": "expense",
            "icon": "study",
            "subcategories": [
                {"title": "Tuition", "type": "expense", "icon": "study"},
                {"title": "Books", "type": "expense", "icon": "learning"},
                {"title": "Courses", "type": "expense", "icon": "knowledge"}
            ]
        },
        {
            "title": "Shopping",
            "type": "expense",
            "icon": "shopping-bag",
            "subcategories": [
                {"title": "Cloths", "type": "expense", "icon": "clothed"},
                {"title": "Shoes", "type": "expense", "icon": "shoe"},
                {"title": "Crockeries", "type": "expense", "icon": "cooking-pot"},
                {"title": "Furnitures", "type": "expense", "icon": "furniture"},
                {"title": "Electronics", "type": "expense", "icon": "laptop"},
                {"title": "Sports", "type": "expense", "icon": "sports"}
            ]
        },
        {
            "title": "Traveling",
            "type": "expense",
            "icon": "resort",
            "subcategories": [
                {"title": "Documents", "type": "expense", "icon": "navigation"}
            ]
        },
        {
            "title": "Hobbies",
            "type": "expense",
            "icon": "art",
            "subcategories": [
                {"title": "Plants", "type": "expense", "icon": "ecology"},
                {"title": "Pets", "type": "expense", "icon": "wildlife"}
            ]
        },
        {"title": "Donations", "type": "expense", "icon": "income", "subcategories": []}
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
