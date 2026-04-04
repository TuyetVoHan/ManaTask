from sqlalchemy import Column, Integer, String, Text, Date, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Status(Base):
    __tablename__ = "status"

    statusId = Column("statusid", Integer, primary_key=True, index=True)
    statusName = Column("statusname", String(50), nullable=False)
    orderIndex = Column("orderindex", Integer, default=0)
    projectId = Column("projectid", Integer, ForeignKey("projects.projectid", ondelete="CASCADE"), nullable=True)
    CreatedAt = Column("createdat", DateTime(timezone=True), server_default=func.now())
    IsDeleted = Column("isdeleted", Boolean, default=False)

    project = relationship("Project", back_populates="statuses")
    tasks = relationship("Task", back_populates="status")

class Task(Base):
    __tablename__ = "tasks"

    taskId = Column("taskid", Integer, primary_key=True, index=True)
    taskTitle = Column("tasktitle", String(100), nullable=False)
    projectId = Column("projectid", Integer, ForeignKey("projects.projectid", ondelete="CASCADE"), nullable=False)
    statusId = Column("statusid", Integer, ForeignKey("status.statusid", ondelete="RESTRICT"), nullable=False)
    assigneeId = Column("assigneeid", Integer, ForeignKey("participants.participantid", ondelete="SET NULL"), nullable=True)
    
    deadline = Column("deadline", Date)
    description = Column("description", Text)
    storyPoint = Column("storypoint", Integer, default=0)
    
    CreatedAt = Column("createdat", DateTime(timezone=True), server_default=func.now())
    UpdatedAt = Column("updatedat", DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    IsDeleted = Column("isdeleted", Boolean, default=False)

    project = relationship("Project", back_populates="tasks")
    status = relationship("Status", back_populates="tasks")
    assignee = relationship("Participant", back_populates="tasks_assigned")

class Notification(Base):
    __tablename__ = "notifications"

    notificationId = Column("notificationid", Integer, primary_key=True, index=True)
    participantId = Column("participantid", Integer, ForeignKey("participants.participantid", ondelete="CASCADE"), nullable=False)
    
    # --- THÊM CỘT PROJECT ID VÀO ĐÂY ---
    projectId = Column("projectid", Integer, ForeignKey("projects.projectid", ondelete="CASCADE"), nullable=True)
    
    taskId = Column("taskid", Integer, ForeignKey("tasks.taskid", ondelete="CASCADE"), nullable=True)
    content = Column("content", Text, nullable=False)
    isRead = Column("isread", Boolean, default=False)
    CreatedAt = Column("createdat", DateTime(timezone=True), server_default=func.now())
    IsDeleted = Column("isdeleted", Boolean, default=False)

class Comment(Base):
    __tablename__ = "comments"

    commentId = Column("commentid", Integer, primary_key=True, index=True)
    participantId = Column("participantid", Integer, ForeignKey("participants.participantid", ondelete="CASCADE"), nullable=False)
    taskId = Column("taskid", Integer, ForeignKey("tasks.taskid", ondelete="CASCADE"), nullable=False)
    commentContent = Column("commentcontent", Text, nullable=False)
    CreatedAt = Column("createdat", DateTime(timezone=True), server_default=func.now())
    IsDeleted = Column("isdeleted", Boolean, default=False)