# app/schemas/project_schema.py
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class ProjectBase(BaseModel):
    projectTitle: str
    isCompleted: Optional[bool] = False

class ProjectCreate(ProjectBase):
    pass # Lúc tạo chỉ cần gửi lên projectTitle là đủ

class ProjectUpdate(ProjectBase):
    pass # Lúc update cũng chỉ sửa tên dự án

# Schema trả về thông tin dự án
class ProjectResponse(ProjectBase):
    projectId: int
    CreatedAt: datetime
    UpdatedAt: datetime

    model_config = ConfigDict(from_attributes=True)

from pydantic import EmailStr

class ProjectMemberAdd(BaseModel):
    email: EmailStr
    role: str = "Member"

class ProjectMemberResponse(BaseModel):
    participantId: int
    fullName: str
    email: str
    role: str