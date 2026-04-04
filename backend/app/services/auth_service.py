# app/services/auth_service.py
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.participant import Participant
from app.schemas.user_schema import UserCreate
from app.core.security import get_password_hash, verify_password

def get_user_by_email(db: Session, email: str):
    """Tìm user theo email (chỉ lấy user chưa bị xóa mềm)."""
    return db.query(Participant).filter(
        Participant.email == email, 
        Participant.IsDeleted == False
    ).first()

def create_user(db: Session, user_in: UserCreate):
    """Xử lý logic tạo tài khoản mới."""
    # 1. Kiểm tra xem email đã tồn tại chưa
    existing_user = get_user_by_email(db, email=user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email này đã được đăng ký."
        )
    
    # 2. Băm mật khẩu
    hashed_pw = get_password_hash(user_in.password)
    
    # 3. Tạo Object Model
    db_user = Participant(
        email=user_in.email,
        passwordHash=hashed_pw,
        fullName=user_in.fullName,
        phone=user_in.phone,
        address=user_in.address,
        dob=user_in.dob
    )
    
    # 4. Lưu vào Database
    db.add(db_user)
    db.commit()
    db.refresh(db_user) # Lấy data mới nhất (có id tự tăng) từ DB về
    
    return db_user

def authenticate_user(db: Session, email: str, password: str):
    """Kiểm tra email và mật khẩu khi đăng nhập."""
    user = get_user_by_email(db, email)
    if not user:
        return False
    if not verify_password(password, user.passwordHash):
        return False
    return user