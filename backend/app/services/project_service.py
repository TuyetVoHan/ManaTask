# app/services/project_service.py
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.project import Project, ProjectMember
from app.schemas.project_schema import ProjectCreate, ProjectUpdate
from app.services.notification_service import send_notification
from sqlalchemy import or_

def get_projects_by_user(db: Session, user_id: int):
    """Lấy danh sách các dự án mà user đang tham gia."""
    # JOIN bảng Project và ProjectMember
    projects = db.query(Project).join(ProjectMember).filter(
        ProjectMember.participantId == user_id,
        Project.IsDeleted == False,
        ProjectMember.IsDeleted == False
    ).all()
    return projects

from app.models.task import Status # Nhớ import Status

def create_project(db: Session, project_in: ProjectCreate, user_id: int):
    """Tạo dự án mới và gán quyền Leader cho người tạo."""
    # 1. Tạo project mới
    new_project = Project(projectTitle=project_in.projectTitle)
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    
    # 2. Tự động thêm user vào bảng ProjectMember với vai trò Leader
    project_member = ProjectMember(
        participantId=user_id,
        projectId=new_project.projectId,
        role="Leader"
    )
    db.add(project_member)
    
    # 3. --- TỰ ĐỘNG TẠO 3 CỘT MẶC ĐỊNH CHO DỰ ÁN NÀY ---
    default_statuses = ["To Do", "In Progress", "Done"]
    for s_name in default_statuses:
        new_status = Status(statusName=s_name, projectId=new_project.projectId)
        db.add(new_status)

    db.commit()
    return new_project

def update_project(db: Session, project_id: int, project_in: ProjectUpdate, user_id: int):
    """Sửa tên dự án (Chỉ Leader mới được phép)."""
    # 1. Lấy quyền của user trong dự án này
    membership = db.query(ProjectMember).filter(
        ProjectMember.projectId == project_id,
        ProjectMember.participantId == user_id,
        ProjectMember.IsDeleted == False
    ).first()
    
    if not membership or membership.role != "Leader":
        raise HTTPException(status_code=403, detail="Chỉ Leader mới có quyền sửa dự án.")
    
    # 2. Tiến hành update
    project = db.query(Project).filter(Project.projectId == project_id, Project.IsDeleted == False).first()
    if not project:
        raise HTTPException(status_code=404, detail="Không tìm thấy dự án.")
        
    project.projectTitle = project_in.projectTitle
    db.commit()
    db.refresh(project)
    return project

def delete_project(db: Session, project_id: int, user_id: int):
    """Xóa mềm dự án (Chuyển IsDeleted = True)."""
    # Tương tự như update, kiểm tra quyền Leader ở đây...
    project = db.query(Project).filter(Project.projectId == project_id, Project.IsDeleted == False).first()
    if project:
        project.IsDeleted = True
        db.commit()

from app.models.participant import Participant

def get_project_members(db: Session, project_id: int):
    """Lấy danh sách thành viên trong dự án"""
    # JOIN bảng ProjectMember và Participant để lấy tên + email
    results = db.query(ProjectMember, Participant).join(
        Participant, ProjectMember.participantId == Participant.participantId
    ).filter(
        ProjectMember.projectId == project_id,
        ProjectMember.IsDeleted == False
    ).all()
    
    # Format lại dữ liệu trả về
    members = []
    for pm, p in results:
        members.append({
            "participantId": p.participantId,
            "fullName": p.fullName,
            "email": p.email,
            "role": pm.role
        })
    return members

def add_member_to_project(db: Session, project_id: int, email: str, role: str, current_user_id: int):
    """Mời thành viên vào dự án (Chỉ Leader mới được mời)"""
    # 1. Kiểm tra quyền Leader
    leader_check = db.query(ProjectMember).filter(
        ProjectMember.projectId == project_id,
        ProjectMember.participantId == current_user_id,
        ProjectMember.role == "Leader"
    ).first()
    if not leader_check:
        raise HTTPException(status_code=403, detail="Chỉ Leader mới được thêm thành viên.")

    # 2. Tìm User qua Email
    user_to_add = db.query(Participant).filter(Participant.email == email, Participant.IsDeleted == False).first()
    if not user_to_add:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng với Email này.")

    # 3. Kiểm tra xem người này đã trong dự án chưa
    existing_member = db.query(ProjectMember).filter(
        ProjectMember.projectId == project_id,
        ProjectMember.participantId == user_to_add.participantId
    ).first()

    if existing_member:
        if existing_member.IsDeleted == False:
            # Nếu đang hoạt động bình thường trong dự án
            raise HTTPException(status_code=400, detail="Người này đã ở trong dự án.")
        else:
            # Nếu đã từng bị đuổi (Xóa mềm), thì khôi phục (Reactivate) lại
            existing_member.IsDeleted = False
            existing_member.role = role
            db.commit()
            return {"message": "Thêm lại thành viên thành công!"}

    # 4. Thêm mới hoàn toàn nếu chưa từng tham gia dự án
    new_member = ProjectMember(participantId=user_to_add.participantId, projectId=project_id, role=role)
    db.add(new_member)
    db.commit()
    project = db.query(Project).filter(Project.projectId == project_id).first()
    proj_name = project.projectTitle if project else "một dự án"
    
    send_notification(
        db=db, 
        participant_id=user_to_add.participantId, 
        content=f"🎉 Bạn vừa được mời tham gia dự án: {proj_name}",
        project_id=project_id # <--- THÊM DÒNG NÀY (Để chuyển hướng vào dự án)
    )
    return {"message": "Thêm thành viên thành công!"}

from app.models.task import Task, Status

def get_project_statistics(db: Session, project_id: int):
    """Tính toán tiến độ, đóng góp thành viên và phân bổ (Fix lỗi sập trắng trang)"""
    from app.models.task import Task, Status
    from app.models.participant import Participant
    from sqlalchemy import or_, and_
    
    # 1. Lấy toàn bộ Task của dự án
    tasks = db.query(Task).filter(Task.projectId == project_id, Task.IsDeleted == False).all()
    task_status_ids = [t.statusId for t in tasks]
    
    # 2. Lấy Cột trạng thái (ĐÃ FIX LỖI SẬP TRANG TẠI ĐÂY)
    # Tự động linh hoạt dựa trên việc dự án có task hay không
    conditions = [and_(Status.projectId == project_id, Status.IsDeleted == False)]
    if task_status_ids:
        conditions.append(Status.statusId.in_(task_status_ids))
        
    statuses = db.query(Status).filter(or_(*conditions)).order_by(Status.orderIndex.asc()).all()

    # 3. Lọc tên cột DUY NHẤT để biểu đồ Bar Chart không bị lặp đúp
    unique_status_names = []
    for s in statuses:
        if s.statusName not in unique_status_names:
            unique_status_names.append(s.statusName)

    # 4. Tìm ID của các cột mang ý nghĩa "Hoàn thành" / "Done"
    done_status_ids = [
        s.statusId for s in statuses 
        if 'done' in s.statusName.lower() or 'hoàn thành' in s.statusName.lower()
    ]

    total_sp = sum((t.storyPoint or 0) for t in tasks)
    completed_sp = sum((t.storyPoint or 0) for t in tasks if t.statusId in done_status_ids)
    progress = (completed_sp / total_sp * 100) if total_sp > 0 else 0

    # 5. TÍNH ĐÓNG GÓP: Chỉ tính Task Đã Done, Có người làm, và STORY POINT > 0
    completed_tasks = [t for t in tasks if t.statusId in done_status_ids and t.assigneeId is not None]
    member_sp = {}
    
    for t in completed_tasks:
        if t.assigneeId not in member_sp:
            member_sp[t.assigneeId] = 0
        member_sp[t.assigneeId] += (t.storyPoint or 0)
    
    contributions = []
    for a_id, sp in member_sp.items():
        if sp > 0:
            user = db.query(Participant).filter(Participant.participantId == a_id).first()
            contributions.append({
                "fullName": user.fullName if user else "Ẩn danh",
                "completedSP": sp
            })

    # 6. Gom số lượng Task theo TÊN CỘT
    tasks_by_status = []
    for name in unique_status_names:
        matching_ids = [s.statusId for s in statuses if s.statusName == name]
        count = sum(1 for t in tasks if t.statusId in matching_ids)
        
        # Chỉ hiển thị cột nếu nó đang Active HOẶC nếu nó có chứa Task
        is_active_column = any((s.statusName == name and not s.IsDeleted and s.projectId == project_id) for s in statuses)
        if is_active_column or count > 0:
            tasks_by_status.append({
                "statusName": name,
                "taskCount": count
            })

    # 7. Gom các task bị mồ côi
    known_ids = [s.statusId for s in statuses]
    orphaned_count = sum(1 for t in tasks if t.statusId not in known_ids)
    if orphaned_count > 0:
        tasks_by_status.append({
            "statusName": "Lỗi/Chưa phân loại",
            "taskCount": orphaned_count
        })
        
    return {
        "totalTasks": len(tasks),
        "totalSP": total_sp,
        "completedSP": completed_sp,
        "progressPercent": round(progress, 2),
        "memberContributions": contributions,
        "tasksByStatus": tasks_by_status
    }

def remove_member_from_project(db: Session, project_id: int, participant_id: int, current_user_id: int):
    """Xóa thành viên khỏi dự án"""
    # Kiểm tra người thao tác có phải là Leader không
    leader_check = db.query(ProjectMember).filter(
        ProjectMember.projectId == project_id,
        ProjectMember.participantId == current_user_id,
        ProjectMember.role == "Leader"
    ).first()
    
    if not leader_check:
        raise HTTPException(status_code=403, detail="Chỉ Leader mới được quyền xóa thành viên.")
        
    # Không cho phép Leader tự xóa chính mình bằng API này
    if participant_id == current_user_id:
        raise HTTPException(status_code=400, detail="Leader không thể tự xóa chính mình.")

    member = db.query(ProjectMember).filter(
        ProjectMember.projectId == project_id,
        ProjectMember.participantId == participant_id,
        ProjectMember.IsDeleted == False
    ).first()
    
    if member:
        member.IsDeleted = True
        db.commit()
    return {"message": "Đã xóa thành viên khỏi dự án."}