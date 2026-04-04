# app/api/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.core.security import verify_token
from app.models.participant import Participant

# Đường dẫn API dùng để lấy token (khớp với route trong auth.py)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Xác thực Token và trả về thông tin User thực tế từ Database."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token không hợp lệ hoặc đã hết hạn",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # 1. Giải mã token
    payload = verify_token(token)
    if payload is None:
        raise credentials_exception
        
    # 2. Lấy ID người dùng từ payload (đã lưu lúc create_access_token)
    user_id: int = payload.get("user_id")
    if user_id is None:
        raise credentials_exception
        
    # 3. Truy vấn DB để đảm bảo user vẫn tồn tại và chưa bị xóa
    user = db.query(Participant).filter(
        Participant.participantId == user_id, 
        Participant.IsDeleted == False
    ).first()
    
    if user is None:
        raise credentials_exception
        
    # Trả về object user để các API khác sử dụng
    return {"user_id": user.participantId, "email": user.email}