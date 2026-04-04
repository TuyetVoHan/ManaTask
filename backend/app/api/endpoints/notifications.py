from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.dependencies import get_db, get_current_user
from app.models.task import Notification

router = APIRouter()

@router.get("/")
def get_my_notifications(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Lấy danh sách thông báo của tôi"""
    return db.query(Notification).filter(
        Notification.participantId == current_user["user_id"],
        Notification.IsDeleted == False
    ).order_by(Notification.CreatedAt.desc()).all()

@router.put("/{notif_id}/read")
def mark_as_read(notif_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Đánh dấu 1 thông báo là đã đọc"""
    notif = db.query(Notification).filter(
        Notification.notificationId == notif_id,
        Notification.participantId == current_user["user_id"]
    ).first()
    if notif:
        notif.isRead = True
        db.commit()
    return {"success": True}

@router.put("/read-all")
def mark_all_read(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Đánh dấu TẤT CẢ thông báo là đã đọc"""
    db.query(Notification).filter(
        Notification.participantId == current_user["user_id"]
    ).update({"isRead": True})
    db.commit()
    return {"success": True}