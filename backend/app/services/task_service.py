# app/services/task_service.py
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.task import Task
from app.schemas.task_schema import TaskCreate, TaskUpdateStatus
from app.models.project import Project

def get_tasks_by_project(db: Session, project_id: int):
    """Lấy danh sách task của một dự án."""
    return db.query(Task).filter(
        Task.projectId == project_id,
        Task.IsDeleted == False
    ).all()

def create_task(db: Session, task_in: TaskCreate):
    """Tạo một task mới."""
    new_task = Task(
        taskTitle=task_in.taskTitle,
        projectId=task_in.projectId,
        statusId=task_in.statusId,
        assigneeId=task_in.assigneeId,
        deadline=task_in.deadline,
        description=task_in.description,
        storyPoint=task_in.storyPoint
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    
    # --- BẮN THÔNG BÁO CÓ KÈM TÊN DỰ ÁN ---
    if new_task.assigneeId:
        from app.services.project_service import send_notification
        
        # 1. Tìm tên dự án
        project = db.query(Project).filter(Project.projectId == new_task.projectId).first()
        proj_name = project.projectTitle if project else "một dự án"

        # 2. Bắn thông báo
        send_notification(
            db=db,
            participant_id=new_task.assigneeId,
            content=f"📌 Bạn vừa được giao công việc '{new_task.taskTitle}' tại dự án '{proj_name}'",
            project_id=new_task.projectId, 
            task_id=new_task.taskId        
        )
        
    return new_task

def update_task_status(db: Session, task_id: int, status_in: TaskUpdateStatus):
    """Cập nhật trạng thái task (khi kéo thả trên UI)."""
    task = db.query(Task).filter(Task.taskId == task_id, Task.IsDeleted == False).first()
    if not task:
        raise HTTPException(status_code=404, detail="Không tìm thấy công việc này.")
        
    task.statusId = status_in.statusId
    db.commit()
    db.refresh(task)
    return task

from app.schemas.task_schema import TaskUpdateFull

def update_task_details(db: Session, task_id: int, task_in: TaskUpdateFull):
    """Cập nhật chi tiết nội dung, người làm, hạn chót của Task"""
    task = db.query(Task).filter(Task.taskId == task_id, Task.IsDeleted == False).first()
    if not task:
        raise HTTPException(status_code=404, detail="Không tìm thấy Task.")
    
    # Tuyệt chiêu của FastAPI: Chỉ lấy những trường thực sự được Frontend gửi lên
    # Kể cả Frontend cố tình gửi giá trị null, nó cũng sẽ bắt được để cập nhật
    update_data = task_in.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(task, key, value)

    db.commit()
    db.refresh(task)
    return task

def delete_task(db: Session, task_id: int):
    """Xóa mềm Task"""
    task = db.query(Task).filter(Task.taskId == task_id, Task.IsDeleted == False).first()
    if task:
        task.IsDeleted = True
        db.commit()
    return {"message": "Đã xóa công việc"}