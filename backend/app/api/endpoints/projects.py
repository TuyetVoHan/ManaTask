# app/api/endpoints/projects.py
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.api.dependencies import get_db, get_current_user
from app.schemas.project_schema import ProjectCreate, ProjectUpdate, ProjectResponse
from app.services import project_service

router = APIRouter()

@router.get("/", response_model=List[ProjectResponse])
def get_user_projects(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Lấy danh sách tất cả các dự án mà user đang tham gia."""
    return project_service.get_projects_by_user(db=db, user_id=current_user.get("user_id"))

@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    project_in: ProjectCreate, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Tạo dự án mới (Hệ thống tự động add user này làm Leader)."""
    return project_service.create_project(db=db, project_in=project_in, user_id=current_user.get("user_id"))

@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    project_in: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Sửa thông tin dự án (Chỉ Leader mới được sửa)."""
    return project_service.update_project(db=db, project_id=project_id, project_in=project_in, user_id=current_user.get("user_id"))

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Xóa mềm dự án (Chuyển IsDeleted = True)."""
    project_service.delete_project(db=db, project_id=project_id, user_id=current_user.get("user_id"))
    return

from app.schemas.project_schema import ProjectMemberAdd, ProjectMemberResponse

@router.get("/{project_id}/members", response_model=List[ProjectMemberResponse])
def get_project_members(
    project_id: int, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
    """Lấy danh sách thành viên dự án"""
    return project_service.get_project_members(db=db, project_id=project_id)

@router.post("/{project_id}/members")
def add_project_member(
    project_id: int, 
    member_in: ProjectMemberAdd, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
    """Mời người khác vào dự án qua Email"""
    return project_service.add_member_to_project(
        db=db, project_id=project_id, email=member_in.email, 
        role=member_in.role, current_user_id=current_user.get("user_id")
    )

@router.get("/{project_id}/statistics")
def get_project_statistics(
    project_id: int, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
    """API lấy dữ liệu vẽ biểu đồ thống kê"""
    return project_service.get_project_statistics(db=db, project_id=project_id)

@router.delete("/{project_id}/members/{participant_id}")
def remove_project_member(
    project_id: int,
    participant_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Xóa thành viên khỏi dự án"""
    return project_service.remove_member_from_project(
        db=db, project_id=project_id, 
        participant_id=participant_id, current_user_id=current_user["user_id"]
    )

@router.put("/{project_id}/toggle-complete")
def toggle_project_complete(
    project_id: int, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
    """Bật/Tắt trạng thái Hoàn thành của dự án (Chỉ Leader)"""
    from app.models.project import Project, ProjectMember
    
    # 1. Kiểm tra xem người bấm có phải Leader không
    membership = db.query(ProjectMember).filter(
        ProjectMember.projectId == project_id,
        ProjectMember.participantId == current_user["user_id"],
        ProjectMember.IsDeleted == False
    ).first()
    
    if not membership or membership.role != "Leader":
        raise HTTPException(status_code=403, detail="Chỉ Leader mới có quyền đóng/mở dự án.")
        
    # 2. Tìm dự án và gạt công tắc (True thành False, False thành True)
    project = db.query(Project).filter(Project.projectId == project_id, Project.IsDeleted == False).first()
    if not project:
        raise HTTPException(status_code=404, detail="Không tìm thấy dự án.")
        
    project.isCompleted = not getattr(project, 'isCompleted', False)
    db.commit()
    
    return {"message": "Đã cập nhật trạng thái dự án", "isCompleted": project.isCompleted}

# Mở cổng API cho nút Đánh dấu hoàn thành
@router.put("/{project_id}/toggle-complete")
def toggle_project_completion_endpoint(
    project_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return project_service.toggle_project_completion(
        db=db, 
        project_id=project_id, 
        user_id=current_user.userId
    )