# app/db/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Lấy chuỗi kết nối từ file config (đã đọc từ .env)
SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL

# Sửa lỗi phổ biến: SQLAlchemy yêu cầu bắt đầu bằng 'postgresql://' thay vì 'postgres://'
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Khởi tạo Engine: "Động cơ" chịu trách nhiệm giao tiếp trực tiếp với DB
# pool_pre_ping=True giúp tự động kiểm tra và phục hồi kết nối nếu DB bị ngắt (rất hữu ích khi dùng Supabase)
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    pool_pre_ping=True
)

# Khởi tạo SessionLocal: Mỗi khi có 1 request (VD: tạo user), hệ thống sẽ dùng cái này
# để tạo ra 1 phiên làm việc độc lập, sau khi xong sẽ đóng lại.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)