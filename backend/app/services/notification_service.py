from app.models.task import Notification

def send_notification(db, participant_id: int, content: str, project_id: int = None, task_id: int = None):
    """Hàm dùng chung để bắn thông báo cho một User (Đã nâng cấp Clickable)"""
    new_noti = Notification(
        participantId=participant_id,
        content=content,
        projectId=project_id, # <--- TRUYỀN VÀO ĐÂY
        taskId=task_id
    )
    db.add(new_noti)
    db.commit()