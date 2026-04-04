from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Project(Base):
    __tablename__ = "projects"

    projectId = Column("projectid", Integer, primary_key=True, index=True)
    projectTitle = Column("projecttitle", String(150), nullable=False)
    CreatedAt = Column("createdat", DateTime(timezone=True), server_default=func.now())
    UpdatedAt = Column("updatedat", DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    IsDeleted = Column("isdeleted", Boolean, default=False)
    isCompleted = Column("iscompleted", Boolean, default=False)

    members = relationship("ProjectMember", back_populates="project")
    tasks = relationship("Task", back_populates="project")
    statuses = relationship("Status", back_populates="project")

class ProjectMember(Base):
    __tablename__ = "projectmember"

    # Lưu ý: ForeignKey cũng phải trỏ tới tên cột viết thường
    participantId = Column("participantid", Integer, ForeignKey("participants.participantid", ondelete="CASCADE"), primary_key=True)
    projectId = Column("projectid", Integer, ForeignKey("projects.projectid", ondelete="CASCADE"), primary_key=True)
    role = Column("role", String(20), CheckConstraint("role IN ('Leader', 'Member')"), nullable=False)
    
    CreatedAt = Column("createdat", DateTime(timezone=True), server_default=func.now())
    IsDeleted = Column("isdeleted", Boolean, default=False)

    participant = relationship("Participant", back_populates="project_memberships")
    project = relationship("Project", back_populates="members")