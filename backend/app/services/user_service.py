# app/services/user_service.py
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.participant import Participant
from app.schemas.user_schema import UserBase

def get_user_by_id(db: Session, user_id: int):
    """Lấy thông tin một user bất kỳ."""
    user = db.query(Participant).filter(
        Participant.participantId == user_id, 
        Participant.IsDeleted == False
    ).first()
    if not user:
        raise HTTPException(status_code=404, detail="Người dùng không tồn tại.")
    return user

def update_user_profile(db: Session, user_id: int, profile_in: UserBase):
    """Cập nhật thông tin cá nhân của user đang đăng nhập."""
    user = get_user_by_id(db, user_id)
    
    # Cập nhật các trường
    user.fullName = profile_in.fullName
    user.phone = profile_in.phone
    user.address = profile_in.address
    user.dob = profile_in.dob
    
    db.commit()
    db.refresh(user)
    return user