from sqlalchemy.ext.asyncio import AsyncSession
from src.core.database import engine, init_db
from src.categories.service import ensure_defaults
# Import models to ensure they are registered with SQLModel metadata
from src.categories.models import Category
from src.transactions.models import Transaction

async def main():
    print("Initializing DB...")
    await init_db()
    print("DB Initialized.")
    
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        print("Running ensure_defaults...")
        try:
            await ensure_defaults(session)
            print("ensure_defaults completed successfully.")
        except Exception as e:
            print(f"Error in ensure_defaults: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
