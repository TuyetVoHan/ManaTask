# app/api/endpoints/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.dependencies import get_db
from app.schemas.user_schema import UserCreate, UserResponse, Token
from app.services import auth_service
from app.core.security import create_access_token

router = APIRouter()

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def sign_up(user_in: UserCreate, db: Session = Depends(get_db)):
    """Đăng ký tài khoản mới."""
    # Service sẽ lo toàn bộ việc check trùng email, băm mật khẩu và lưu DB
    return auth_service.create_user(db=db, user_in=user_in)

@router.post("/login", response_model=Token)
def login(login_data: dict, db: Session = Depends(get_db)):
    """Xác thực và cấp phát JWT Token."""
    email = login_data.get("email")
    password = login_data.get("password")
    
    # 1. Kiểm tra thông tin đăng nhập qua Service
    user = auth_service.authenticate_user(db=db, email=email, password=password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Email hoặc mật khẩu không đúng."
        )
    
    # 2. Đăng nhập thành công -> Tạo vé thông hành (Token)
    access_token = create_access_token(
        data={"user_id": user.participantId, "email": user.email}
    )
    
    return {"access_token": access_token, "token_type": "bearer"}