
from sqlalchemy.orm import Session
from .models import Account
from .schemas import AccountCreate, AccountUpdate
from uuid import UUID

def get_accounts(db: Session, user_id: UUID):
    return db.query(Account).filter(Account.user_id == user_id).all()

def get_account(db: Session, account_id: UUID, user_id: UUID):
    return db.query(Account).filter(Account.id == account_id, Account.user_id == user_id).first()

def create_account(db: Session, account: AccountCreate, user_id: UUID):
    db_account = Account(
        **account.dict(),
        user_id=user_id
    )
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    return db_account

def update_account(db: Session, account_id: UUID, account_update: AccountUpdate, user_id: UUID):
    db_account = get_account(db, account_id, user_id)
    if not db_account:
        return None
    
    update_data = account_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_account, key, value)
    
    db.commit()
    db.refresh(db_account)
    return db_account

def delete_account(db: Session, account_id: UUID, user_id: UUID):
    db_account = get_account(db, account_id, user_id)
    if db_account:
        db.delete(db_account)
        db.commit()
        return True
    return False
