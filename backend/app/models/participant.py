from sqlalchemy import Column, Integer, String, Date, Boolean, CHAR, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Participant(Base):
    __tablename__ = "participants"

    # Thêm tên cột chữ thường vào tham số đầu tiên
    participantId = Column("participantid", Integer, primary_key=True, index=True)
    passwordHash = Column("passwordhash", String(255), nullable=False)
    fullName = Column("fullname", String(100), nullable=False)
    email = Column("email", String(100), unique=True, index=True, nullable=False)
    dob = Column("dob", Date)
    address = Column("address", String(100))
    phone = Column("phone", CHAR(10), unique=True)
    CreatedAt = Column("createdat", DateTime(timezone=True), server_default=func.now())
    IsDeleted = Column("isdeleted", Boolean, default=False)

    project_memberships = relationship("ProjectMember", back_populates="participant")
    tasks_assigned = relationship("Task", back_populates="assignee")