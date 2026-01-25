import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlmodel import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.recurring.models import RecurringBill, Frequency
from src.transactions.models import Transaction, TransactionType
from src.categories.models import Category

class RecurringService:
    async def create_bill(self, session: AsyncSession, bill: RecurringBill) -> RecurringBill:
        session.add(bill)
        await session.commit()
        await session.refresh(bill)
        return bill

    async def get_bills(self, session: AsyncSession, user_id: uuid.UUID) -> List[RecurringBill]:
        query = select(RecurringBill).where(RecurringBill.user_id == user_id).options(selectinload(RecurringBill.category))
        result = await session.execute(query)
        return result.scalars().all()

    async def update_bill(self, session: AsyncSession, bill_id: uuid.UUID, user_id: uuid.UUID, update_data: Dict[str, Any]) -> Optional[RecurringBill]:
        query = select(RecurringBill).where(RecurringBill.id == bill_id, RecurringBill.user_id == user_id)
        result = await session.execute(query)
        bill = result.scalar_one_or_none()
        
        if not bill:
            return None
            
        for key, value in update_data.items():
            if value is not None:
                setattr(bill, key, value)
                
        session.add(bill)
        await session.commit()
        await session.refresh(bill)
        return bill

    async def delete_bill(self, session: AsyncSession, bill_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        query = select(RecurringBill).where(RecurringBill.id == bill_id, RecurringBill.user_id == user_id)
        result = await session.execute(query)
        bill = result.scalar_one_or_none()
        
        if not bill:
            return False
            
        await session.delete(bill)
        await session.commit()
        return True

    async def get_bills_status(self, session: AsyncSession, user_id: uuid.UUID, month: int, year: int):
        # 1. Fetch all bills
        bills = await self.get_bills(session, user_id)
        
        # 2. Define time range for the month
        # Handle overflow for next month calc
        if month == 12:
            next_month = 1
            next_month_year = year + 1
        else:
            next_month = month + 1
            next_month_year = year
            
        start_date = datetime(year, month, 1)
        end_date = datetime(next_month_year, next_month, 1) # Exclusive upper bound
        
        # 3. Fetch all expenses for this month to match against
        # We need to fetch transactions and verify category + amount
        # Optimization: Fetch aggregated sum per category? 
        # But we might need individual transactions to link them or to check if multiple small ones sum up?
        # The prompt says: "find out if for that category and subcategory if the payment in same date range is alrady greater or equal than default amount"
        # This implies SUM check.
        
        # Let's fetch Sum of expenses per category for this month
        query = select(
            Transaction.category_id,
            func.sum(Transaction.amount).label("total_amount")
        ).where(
            Transaction.user_id == user_id,
            Transaction.type == TransactionType.EXPENSE,
            Transaction.date >= start_date,
            Transaction.date < end_date
        ).group_by(Transaction.category_id)
        
        res = await session.execute(query)
        category_totals = {row.category_id: row.total_amount for row in res.all()}
        
        # Also need to consider subcategories! 
        # If a Bill is for Parent Category "Utilities", and we have a transaction for "Utilities > Electric", 
        # does that count? 
        # Typically yes if the bill is defined on the Parent. 
        # But the Transaction stores `category_id` which might be the subcategory ID.
        # We need to map subcategories to their parents maybe?
        # Or, simpler: The bill defines a specific category ID. The comparison checks if THAT category ID (or its children) has spending.
        # Complex. Let's start with strict Category ID match for now as per "same category and subcategory" phrasing.
        # Actually "category and subcategory" implies exact match of the ID stored.
        
        # Let's refine the query to be flexible if needed, but for MVP strict match on category_id is safest and easiest.
        
        bill_statuses = []
        for bill in bills:
            # Check frequency relevance
            if bill.frequency == Frequency.YEARLY:
                if bill.month_of_year != month:
                    # Not due this month
                    continue
            
            spent = category_totals.get(bill.category_id, 0.0)
            status = "PAID" if spent >= bill.amount else "UNPAID"
            
            bill_statuses.append({
                "bill": bill,
                "status": status,
                "amount_paid": spent
            })
            
        return bill_statuses

recurring_service = RecurringService()
