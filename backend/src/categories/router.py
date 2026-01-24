from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from sqlalchemy.orm import selectinload

from src.core.database import get_session
from src.core.deps import get_active_user
from src.auth.models import User
from src.categories.models import Category, TransactionType
from src.categories.schemas import CategoryCreate, CategoryRead, CategoryUpdate

router = APIRouter()


@router.get("", response_model=List[CategoryRead])
async def get_categories(
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_active_user)]
):
    # Ensure defaults exist
    # await ensure_defaults(session) # Moved to lifespan
    
    # Return all categories for now
    result = await session.execute(select(Category).options(selectinload(Category.subcategories)))
    categories = result.scalars().all()

    return categories

@router.post("", response_model=CategoryRead)
async def create_category(
    category_in: CategoryCreate,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_active_user)]
):
    # Verify ID or generate?
    # Schema has ID. User provides ID?
    # Frontend logic: 'slug' generated.
    # Check if ID exists.
    existing = await session.get(Category, category_in.id)
    if existing:
        raise HTTPException(status_code=400, detail="Category with this ID already exists")
    
    category = Category.from_orm(category_in)
    session.add(category)
    await session.commit()
    
    # Eagerly load subcategories for the response serialization
    stmt = select(Category).where(Category.id == category_in.id).options(selectinload(Category.subcategories))
    category = (await session.execute(stmt)).scalar_one()
    return category

@router.patch("/{category_id}", response_model=CategoryRead)
async def update_category(
    category_id: str,
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
    stmt = select(Category).where(Category.id == category_id).options(selectinload(Category.subcategories))
    category = (await session.execute(stmt)).scalar_one()
    return category

