# app/api/endpoints/tasks.py
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.api.dependencies import get_db, get_current_user
from app.schemas.task_schema import TaskCreate, TaskUpdateStatus, TaskResponse
from app.services import task_service
from app.models.task import Task
from app.models.task import Comment
from pydantic import BaseModel
from app.models.participant import Participant
from app.models.project import ProjectMember
from app.models.project import Project

router = APIRouter()

@router.get("/me")
def get_my_tasks(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """API dùng cho trang Calendar: Lấy tất cả Task được giao cho User hiện tại (Trừ các task đã Done)"""
    from app.models.task import Task, Status # Import trực tiếp để tránh lỗi
    
    # Kết hợp (Join) bảng Task và bảng Status để lọc
    tasks = db.query(Task).join(Status, Task.statusId == Status.statusId).filter(
        Task.assigneeId == current_user["user_id"], 
        Task.IsDeleted == False,
        ~Status.statusName.ilike('%done%'),        # Bỏ qua các task nằm ở cột có chữ Done
        ~Status.statusName.ilike('%hoàn thành%')   # Bỏ qua các task nằm ở cột Hoàn thành
    ).all()
    
    return tasks

@router.get("/project/{project_id}", response_model=List[TaskResponse])
def get_tasks_by_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Lấy toàn bộ task của một dự án để render lên bảng Kanban."""
    
    # 1. KIỂM TRA BẢO MẬT (Lớp 2): Có nằm trong dự án không?
    is_member = db.query(ProjectMember).filter(
        ProjectMember.projectId == project_id,
        ProjectMember.participantId == current_user["user_id"],
        ProjectMember.IsDeleted == False
    ).first()
    
    if not is_member:
        raise HTTPException(status_code=403, detail="Bạn không có quyền xem dự án này.")

    # 2. Vượt qua bảo mật thì mới cho lấy Task
    return task_service.get_tasks_by_project(db=db, project_id=project_id)

@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_in: TaskCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Tạo một công việc mới trong dự án."""
    return task_service.create_task(db=db, task_in=task_in)

@router.put("/{task_id}/status", response_model=TaskResponse)
def update_task_status(
    task_id: int,
    status_in: TaskUpdateStatus,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Cập nhật trạng thái task (Dùng khi user kéo thả thẻ task trên UI)."""
    return task_service.update_task_status(db=db, task_id=task_id, status_in=status_in)

from app.schemas.task_schema import TaskUpdateFull

@router.put("/{task_id}")
def update_task_details(
    task_id: int,
    task_in: TaskUpdateFull,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Cập nhật các thông tin chi tiết của Task (Mô tả, Assignee, Deadline...)"""
    return task_service.update_task_details(db=db, task_id=task_id, task_in=task_in)

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Xóa công việc"""
    task_service.delete_task(db=db, task_id=task_id)
    return

# --- API BÌNH LUẬN CHO TASK ---
class CommentCreate(BaseModel):
    commentContent: str

@router.get("/{task_id}/comments")
def get_task_comments(task_id: int, db: Session = Depends(get_db)):
    """Lấy danh sách bình luận của một Task"""
    # Lấy kèm thông tin người bình luận
    results = db.query(Comment, Participant).join(
        Participant, Comment.participantId == Participant.participantId
    ).filter(Comment.taskId == task_id, Comment.IsDeleted == False).all()
    
    comments = []
    for c, p in results:
        comments.append({
            "commentId": c.commentId,
            "content": c.commentContent,
            "createdAt": c.CreatedAt,
            "authorName": p.fullName,
            "authorId": p.participantId
        })
    return comments

@router.post("/{task_id}/comments")
def add_task_comment(
    task_id: int, 
    comment_in: CommentCreate, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Gửi bình luận mới vào Task và bắn thông báo (Có kèm Tên Dự Án)"""
    # 1. Lưu bình luận vào Database
    new_comment = Comment(
        taskId=task_id,
        participantId=current_user["user_id"],
        commentContent=comment_in.commentContent
    )
    db.add(new_comment)
    db.commit()

    # 2. --- BẮN THÔNG BÁO ---
    # Lấy thông tin Task để biết ai đang làm
    task = db.query(Task).filter(Task.taskId == task_id).first()
    
    # Logic: Có người làm task NÀY + Người đó KHÔNG PHẢI là người đang gõ bình luận
    if task and task.assigneeId and task.assigneeId != current_user["user_id"]:
        
        # Lấy tên của người đang bình luận
        commenter = db.query(Participant).filter(Participant.participantId == current_user["user_id"]).first()
        commenter_name = commenter.fullName if commenter else "Một thành viên"
        
        # --- TÌM TÊN DỰ ÁN ---
        project = db.query(Project).filter(Project.projectId == task.projectId).first()
        proj_name = project.projectTitle if project else "một dự án"
        
        from app.services.project_service import send_notification 
        
        # Bắn thông báo với nội dung chi tiết!
        send_notification(
            db=db,
            participant_id=task.assigneeId,
            content=f"💬 {commenter_name} vừa bình luận vào công việc '{task.taskTitle}' tại dự án '{proj_name}'",
            project_id=task.projectId, 
            task_id=task.taskId
        )

    return {"message": "Đã thêm bình luận"}