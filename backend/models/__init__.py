"""
Pydantic models for request/response validation
"""
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class UserRegister(BaseModel):
    """User registration request schema"""
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    """User login request schema"""
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    """User response schema"""
    id: Optional[str] = None
    name: str
    email: str
    created_at: Optional[datetime] = None

class MessageEmbed(BaseModel):
    """Message embedding request schema"""
    receiver_email: EmailStr
    secret_message: str

class MessageExtract(BaseModel):
    """Message extraction request schema"""
    encryption_key: str

class EmailShare(BaseModel):
    """Email sharing request schema"""
    receiver_email: EmailStr
    encryption_key: str

class AuthResponse(BaseModel):
    """Authentication response schema"""
    access_token: str
    token_type: str
    user: UserResponse
