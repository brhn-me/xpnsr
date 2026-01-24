from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from src.auth.models import User
from src.core.security import get_password_hash
from src.core.config import settings

async def create_default_user(session: AsyncSession):
    result = await session.execute(select(User).where(User.email == settings.FIRST_SUPERUSER))
    user = result.scalars().first()
    if user:
        return

    user = User(
        email=settings.FIRST_SUPERUSER,
        hashed_password=get_password_hash(settings.FIRST_SUPERUSER_PASSWORD),
        full_name="Admin User",
        is_active=True
    )
    session.add(user)
    await session.commit()
