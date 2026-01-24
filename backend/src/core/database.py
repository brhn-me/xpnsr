from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel
import asyncio
from sqlalchemy.exc import OperationalError
from src.core.config import settings

engine = create_async_engine(settings.ASYNC_DATABASE_URL, echo=True, future=True)

async def init_db():
    retries = 5
    for i in range(retries):
        try:
            async with engine.begin() as conn:
                # await conn.run_sync(SQLModel.metadata.drop_all)
                await conn.run_sync(SQLModel.metadata.create_all)
            break
        except (OperationalError, OSError) as e:
            if i == retries - 1:
                raise e
            print(f"Database not ready, retrying in 2s... ({i+1}/{retries})")
            await asyncio.sleep(2)

async def get_session() -> AsyncSession:
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    async with async_session() as session:
        yield session
