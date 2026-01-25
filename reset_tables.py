
import asyncio
from src.core.database import engine
from src.accounts.models import Account
from src.investments.models import Investment
from src.database import Base

async def reset_tables():
    async with engine.begin() as conn:
        print("Dropping Investment table...")
        await conn.run_sync(Base.metadata.drop_all, tables=[Investment.__table__])
        print("Dropping Account table...")
        await conn.run_sync(Base.metadata.drop_all, tables=[Account.__table__])
        print("Tables dropped. Restarting server will recreate them.")

if __name__ == "__main__":
    asyncio.run(reset_tables())
