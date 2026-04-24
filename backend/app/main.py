# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import các cấu hình và Router đã viết
from app.core.config import settings
from app.api.api_router import api_router
from app.db.database import engine
from app.db.base_class import Base

# (Tùy chọn) Lệnh này giúp SQLAlchemy tự động quét các file models 
# và tạo bảng trong Supabase nếu nó chưa tồn tại. 
# Vì bạn đã chạy file SQL bằng tay trên Supabase rồi, lệnh này sẽ an toàn bỏ qua các bảng đã có.
Base.metadata.create_all(bind=engine)

# Khởi tạo ứng dụng FastAPI
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API Backend cho hệ thống ManaTask - Quản lý dự án sinh viên",
    version="1.0.0",
    docs_url="/docs", # Đường dẫn mặc định để xem tài liệu Swagger UI
    redoc_url="/redoc"
)

# CẤU HÌNH CORS (Bảo mật đường truyền)
# Chúng ta cấp phép cho Localhost để test và Vercel để chạy thực tế
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://mana-task.vercel.app/", # Link Frontend đã deploy của bạn
]
# Cấu hình CORS (Cross-Origin Resource Sharing)
# Rất quan trọng: Giúp Frontend (ví dụ chạy ở localhost:3000) 
# có quyền gọi API xuống Backend (chạy ở localhost:8000) mà không bị trình duyệt chặn.
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # Trong thực tế khi deploy, nên thay "*" bằng URL của Frontend
    allow_credentials=True,
    allow_methods=["*"], # Cho phép tất cả các method (GET, POST, PUT, DELETE...)
    allow_headers=["*"],
)

# Gắn toàn bộ các API con (auth, projects, tasks, users) vào app chính
app.include_router(api_router, prefix="/api")

# Tạo một API gốc (Health Check) để kiểm tra server có đang sống không
@app.get("/")
def root():
    return {
        "status": "success",
        "message": "Chào mừng đến với API của ManaTask!",
        "version": "1.0.0"
    }