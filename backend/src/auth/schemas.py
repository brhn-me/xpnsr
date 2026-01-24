import uuid
from sqlmodel import SQLModel
from pydantic import EmailStr

class UserCreate(SQLModel):
    email: EmailStr
    password: str
    full_name: str | None = None

class UserRead(SQLModel):
    id: uuid.UUID
    email: EmailStr
    full_name: str | None = None
    is_active: bool

class Token(SQLModel):
    access_token: str
    token_type: str
