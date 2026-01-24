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

@router.get("", response_model=List[CategoryRead])
async def get_categories(
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_active_user)]
):
    # Return all categories sorted by sort_order
    stmt = select(Category).options(selectinload(Category.subcategories).selectinload(Category.subcategories)).order_by(Category.sort_order)
    result = await session.execute(stmt)
    categories = result.scalars().all()

    return categories

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
        
    session.delete(category)
    await session.commit()
    return None
