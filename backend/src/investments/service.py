
from sqlalchemy.orm import Session
from .models import Investment
from .schemas import InvestmentCreate, InvestmentUpdate
from uuid import UUID
from typing import Optional

def get_investments(db: Session, user_id: UUID):
    return db.query(Investment).filter(Investment.user_id == user_id).all()

def get_investment(db: Session, investment_id: UUID, user_id: UUID):
    return db.query(Investment).filter(Investment.id == investment_id, Investment.user_id == user_id).first()

def create_investment(db: Session, investment: InvestmentCreate, user_id: UUID):
    db_investment = Investment(
        **investment.dict(),
        user_id=user_id
    )
    db.add(db_investment)
    db.commit()
    db.refresh(db_investment)
    return db_investment

def update_investment(db: Session, investment_id: UUID, investment_update: InvestmentUpdate, user_id: UUID):
    db_investment = get_investment(db, investment_id, user_id)
    if not db_investment:
        return None
    
    update_data = investment_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_investment, key, value)
    
    db.commit()
    db.refresh(db_investment)
    return db_investment

def delete_investment(db: Session, investment_id: UUID, user_id: UUID):
    db_investment = get_investment(db, investment_id, user_id)
    if db_investment:
        db.delete(db_investment)
        db.commit()
        return True
    return False
