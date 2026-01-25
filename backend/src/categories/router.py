from typing import Annotated, List
import uuid
import re
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from sqlalchemy.orm import selectinload

from src.core.database import get_session
from src.core.deps import get_active_user
from src.auth.models import User
from src.categories.models import Category, TransactionType
from src.categories.schemas import CategoryCreate, CategoryRead, CategoryUpdate

router = APIRouter()

def generate_slug(title: str) -> str:
    # Basic slug generation: lowercase, remove special chars, replace spaces with underscores
    slug = title.lower()
    slug = re.sub(r'[^a-z0-9\s_]', '', slug)
    slug = re.sub(r'\s+', '_', slug)
    slug = slug.strip('_')
    return slug

from sqlalchemy import func

@router.get("", response_model=List[CategoryRead])
async def get_categories(
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_active_user)]
):
    # 1. Get all categories sorted by order
    stmt = select(Category).order_by(Category.sort_order)
    result = await session.execute(stmt)
    categories = result.scalars().all()

    # 2. Build map and tree in memory
    cat_map = {}
    for cat in categories:
        data = cat.model_dump()
        cat_read = CategoryRead(**data)
        cat_map[cat.id] = cat_read
    
    root_categories = []

    for cat in categories:
        cat_read = cat_map[cat.id]
        if cat.parent_category_id:
            parent = cat_map.get(cat.parent_category_id)
            if parent:
                parent.subcategories.append(cat_read)
        else:
            root_categories.append(cat_read)

    return root_categories

@router.post("", response_model=CategoryRead)
async def create_category(
    category_in: CategoryCreate,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_active_user)]
):
    # Generate unique slug
    base_slug = generate_slug(category_in.title)
    slug = base_slug
    counter = 1
    
    # Check for slug uniqueness
    while True:
        stmt = select(Category).where(Category.slug == slug)
        existing = await session.execute(stmt)
        if not existing.first():
            break
        slug = f"{base_slug}_{counter}"
        counter += 1
    
    # Get max sort order to append to end
    stmt = select(Category).order_by(Category.sort_order.desc()).limit(1) # type: ignore
    result = await session.execute(stmt)
    last_cat = result.scalar_one_or_none()
    new_order = (last_cat.sort_order + 1) if last_cat else 0

    category = Category(
        **category_in.dict(), 
        slug=slug, 
        sort_order=new_order
    )
    
    session.add(category)
    await session.commit()
    
    # Eagerly load subcategories for the response serialization
    stmt = select(Category).where(Category.id == category.id).options(selectinload(Category.subcategories).selectinload(Category.subcategories))
    category = (await session.execute(stmt)).scalar_one()
    return category

@router.patch("/{category_id}", response_model=CategoryRead)
async def update_category(
    category_id: uuid.UUID,
    category_in: CategoryUpdate,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_active_user)]
):
    category = await session.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    category_data = category_in.dict(exclude_unset=True)
    for key, value in category_data.items():
        setattr(category, key, value)
        
    session.add(category)
    await session.commit()
    
    # Eagerly load subcategories for the response serialization
    stmt = select(Category).where(Category.id == category_id).options(selectinload(Category.subcategories).selectinload(Category.subcategories))
    category = (await session.execute(stmt)).scalar_one()
    return category

@router.put("/order", status_code=204)
async def update_categories_order(
    ordered_ids: List[uuid.UUID] = Body(...),
    session: Annotated[AsyncSession, Depends(get_session)] = None, # type: ignore
    current_user: Annotated[User, Depends(get_active_user)] = None # type: ignore
):
    """
    Update the sort_order of categories based on the provided list of IDs.
    The first ID in the list gets sort_order=0, the second=1, etc.
    """
    for index, cat_id in enumerate(ordered_ids):
        category = await session.get(Category, cat_id)
        if category:
            category.sort_order = index
            session.add(category)
    
    await session.commit()
    return None

@router.delete("/{category_id}", status_code=204)
async def delete_category(
    category_id: uuid.UUID,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_active_user)]
):
    category = await session.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Check if category has any transactions (direct or through subcategories)
    from src.transactions.models import Transaction
    
    # Check direct transactions
    stmt = select(func.count(Transaction.id)).where(Transaction.category_id == category_id)
    direct_transactions = (await session.execute(stmt)).scalar() or 0
    
    if direct_transactions > 0:
        raise HTTPException(status_code=400, detail=f"Cannot delete category '{category.title}' because it has {direct_transactions} transactions associated with it.")
    
    # Check subcategories for transactions
    stmt = select(Category.id).where(Category.parent_category_id == category_id)
    subcat_ids = (await session.execute(stmt)).scalars().all()
    
    if subcat_ids:
        stmt = select(func.count(Transaction.id)).where(Transaction.category_id.in_(subcat_ids))
        sub_transactions = (await session.execute(stmt)).scalar() or 0
        if sub_transactions > 0:
            raise HTTPException(status_code=400, detail=f"Cannot delete category '{category.title}' because its subcategories have {sub_transactions} transactions associated.")

    print(f"--- DELETION START: {category_id} ({category.title}) ---")
    await session.delete(category)
    print(f"Session.delete called. Committing...")
    await session.commit()
    print(f"Commit successful for {category_id}")
    return None
