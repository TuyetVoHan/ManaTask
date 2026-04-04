from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from app.api.dependencies import get_db, get_current_user
from app.models.task import Status, Task
from app.models.project import ProjectMember

router = APIRouter()

class StatusCreate(BaseModel):
    statusName: str
    projectId: int

class StatusUpdate(BaseModel):
    statusName: str

class StatusReorder(BaseModel):
    statusIds: List[int]

@router.get("/project/{project_id}")
def get_statuses_by_project(project_id: int, db: Session = Depends(get_db)):
    """Lấy danh sách cột trạng thái, SẮP XẾP THEO orderindex"""
    return db.query(Status).filter(
        Status.projectId == project_id,
        Status.IsDeleted == False
    ).order_by(Status.orderIndex.asc(), Status.statusId.asc()).all()

@router.post("/")
def create_status(status_in: StatusCreate, db: Session = Depends(get_db)):
    """Tạo cột trạng thái mới"""
    new_status = Status(statusName=status_in.statusName, projectId=status_in.projectId)
    db.add(new_status)
    db.commit()
    return {"message": "Tạo cột thành công!"}

@router.put("/{status_id}")
def update_status(status_id: int, status_in: StatusUpdate, db: Session = Depends(get_db)):
    """Đổi tên cột"""
    status = db.query(Status).filter(Status.statusId == status_id, Status.IsDeleted == False).first()
    if not status: raise HTTPException(status_code=404, detail="Không tìm thấy cột")
    
    status.statusName = status_in.statusName
    db.commit()
    return {"message": "Đã đổi tên cột"}

@router.delete("/{status_id}")
def delete_status(status_id: int, db: Session = Depends(get_db)):
    """Xóa cột (Chỉ cho xóa nếu cột đang trống)"""
    status = db.query(Status).filter(Status.statusId == status_id, Status.IsDeleted == False).first()
    if not status: raise HTTPException(status_code=404)
    
    # Kiểm tra xem có task nào đang ở cột này không
    tasks_in_status = db.query(Task).filter(Task.statusId == status_id, Task.IsDeleted == False).first()
    if tasks_in_status:
        raise HTTPException(status_code=400, detail="Không thể xóa cột đang chứa công việc. Hãy kéo công việc sang cột khác trước!")
        
    status.IsDeleted = True
    db.commit()
    return {"message": "Đã xóa cột"}

@router.put("/project/{project_id}/reorder")
def reorder_statuses(project_id: int, data: StatusReorder, db: Session = Depends(get_db)):
    """Cập nhật thứ tự các cột khi kéo thả"""
    for index, s_id in enumerate(data.statusIds):
        # Update orderIndex cho từng cột dựa vào mảng ID gửi lên
        db.query(Status).filter(Status.statusId == s_id).update({"orderIndex": index})
    db.commit()
    return {"message": "Đã lưu vị trí cột"}