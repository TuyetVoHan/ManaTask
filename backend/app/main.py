from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.api_router import api_router
from app.db.database import engine, Base

# Tự động tạo các bảng trong database (nếu chưa tồn tại)
# Lưu ý: Khi deploy, lệnh này giúp đảm bảo DB trên Supabase luôn đồng bộ
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ManaTask API",
    description="Hệ thống API backend cho ứng dụng quản lý công việc ManaTask",
    version="1.1.0"
)

# CẤU HÌNH CORS (Bảo mật đường truyền)
# Chúng ta cấp phép cho Localhost để test và Vercel để chạy thực tế
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://mana-task.vercel.app/", # Link Frontend đã deploy của bạn
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # Chỉ cho phép các domain trong danh sách trên
    allow_credentials=True,
    allow_methods=["*"],    # Cho phép tất cả các phương thức (GET, POST, PUT, DELETE)
    allow_headers=["*"],    # Cho phép tất cả các loại Header (Authorization, Content-Type...)
)

# Kết nối các đầu API (Routes)
# Tất cả các API sẽ bắt đầu bằng tiền tố /api (Ví dụ: /api/tasks, /api/projects)
app.include_router(api_router, prefix="/api")

@app.get("/")
def read_root():
    """Trang chào mừng API (Dùng để kiểm tra nhanh xem Backend có đang chạy không)"""
    return {
        "status": "Online",
        "message": "Chào mừng đến với ManaTask API!",
        "version": "1.1.0",
        "docs": "/docs" # Đường dẫn đến tài liệu Swagger UI
    }