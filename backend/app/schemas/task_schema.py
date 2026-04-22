# app/schemas/task_schema.py
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import date, datetime

class TaskBase(BaseModel):
    taskTitle: str
    description: Optional[str] = None
    deadline: Optional[date] = None
    # XÓA GIỚI HẠN Ở ĐÂY: Để API trả về không bị sập nếu trong DB lỡ có task điểm cao
    storyPoint: Optional[int] = Field(default=0, description="Điểm đánh giá khối lượng công việc")
    statusId: int
    assigneeId: Optional[int] = None

# Khi tạo Task, Frontend phải gửi kèm projectId để biết task này thuộc dự án nào
class TaskCreate(TaskBase):
    projectId: int
    # BẢO VỆ LÚC TẠO: Chỉ cho phép nhập từ 0 đến 100
    storyPoint: Optional[int] = Field(default=0, ge=0, le=100, description="Story Point từ 0 đến 100")

# Khi kéo thả Task trên bảng Kanban, thường chỉ gửi lên statusId mới
class TaskUpdateStatus(BaseModel):
    statusId: int

# Schema trả về thông tin Task
class TaskResponse(TaskBase):
    taskId: int
    projectId: int
    CreatedAt: datetime
    UpdatedAt: datetime

    model_config = ConfigDict(from_attributes=True)

class TaskUpdateFull(BaseModel):
    taskTitle: Optional[str] = None
    description: Optional[str] = None
    deadline: Optional[date] = None
    # BẢO VỆ LÚC SỬA: Chỉ cho phép sửa điểm từ 0 đến 100
    storyPoint: Optional[int] = Field(None, ge=0, le=100, description="Story Point từ 0 đến 100")
    assigneeId: Optional[int] = None # Cho phép Giao việc cho người khác
    statusId: Optional[int] = None