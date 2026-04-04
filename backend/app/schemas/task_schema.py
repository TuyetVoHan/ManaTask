# app/schemas/task_schema.py
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import date, datetime

class TaskBase(BaseModel):
    taskTitle: str
    description: Optional[str] = None
    deadline: Optional[date] = None
    # storyPoint tối đa là 5 theo như URD bạn thiết kế
    storyPoint: Optional[int] = Field(default=0, le=5, description="Tối đa 5 point 1 tuần")
    statusId: int
    assigneeId: Optional[int] = None

# Khi tạo Task, Frontend phải gửi kèm projectId để biết task này thuộc dự án nào
class TaskCreate(TaskBase):
    projectId: int

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

from typing import Optional
from datetime import date

class TaskUpdateFull(BaseModel):
    taskTitle: Optional[str] = None
    description: Optional[str] = None
    deadline: Optional[date] = None
    storyPoint: Optional[int] = None
    assigneeId: Optional[int] = None # Cho phép Giao việc cho người khác