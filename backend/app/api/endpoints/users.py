# app/api/endpoints/users.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.dependencies import get_db, get_current_user
from app.schemas.user_schema import UserResponse, UserBase
from app.services import user_service
from app.models.participant import Participant

router = APIRouter()

@router.get("/me", response_model=UserResponse)
def get_my_profile(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lấy thông tin cá nhân của người dùng đang đăng nhập."""
    return user_service.get_user_by_id(db=db, user_id=current_user.get("user_id"))

@router.put("/me", response_model=UserResponse)
def update_my_profile(
    profile_in: UserBase,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cập nhật thông tin cá nhân."""
    return user_service.update_user_profile(db=db, user_id=current_user.get("user_id"), profile_in=profile_in)

@router.get("/{user_id}", response_model=UserResponse)
def get_user_public_info(
    user_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lấy thông tin cơ bản của một thành viên khác."""
    return user_service.get_user_by_id(db=db, user_id=user_id)

from pydantic import BaseModel
from fastapi import HTTPException
from app.core.security import verify_password, get_password_hash

class PasswordChangeRequest(BaseModel):
    oldPassword: str
    newPassword: str

@router.put("/me/password")
def change_password(
    data: PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """API đổi mật khẩu trong trang Settings"""
    user = db.query(Participant).filter(Participant.participantId == current_user["user_id"]).first()
    
    # Kiểm tra mật khẩu cũ
    if not verify_password(data.oldPassword, user.passwordHash):
        raise HTTPException(status_code=400, detail="Mật khẩu cũ không chính xác!")
    
    # Cập nhật mật khẩu mới
    user.passwordHash = get_password_hash(data.newPassword)
    db.commit()
    return {"message": "Đổi mật khẩu thành công!"}