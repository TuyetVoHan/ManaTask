# app/schemas/user_schema.py
from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import date, datetime

# Các trường cơ bản dùng chung
class UserBase(BaseModel):
    email: EmailStr
    fullName: str
    phone: Optional[str] = None
    address: Optional[str] = None
    dob: Optional[date] = None

# Schema dùng khi Frontend gửi request Đăng ký (Cần có thêm mật khẩu)
class UserCreate(UserBase):
    password: str

# Schema dùng để trả dữ liệu về cho Frontend (TUYỆT ĐỐI KHÔNG trả về password)
class UserResponse(UserBase):
    participantId: int
    CreatedAt: datetime
    
    # Cấu hình này giúp Pydantic dịch được object của SQLAlchemy thành JSON
    model_config = ConfigDict(from_attributes=True) 

# Schema dùng để trả về Token khi Login thành công
class Token(BaseModel):
    access_token: str
    token_type: str