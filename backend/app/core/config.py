# app/core/config.py
import os
from dotenv import load_dotenv

# Tải các biến môi trường từ file .env lên hệ thống
load_dotenv()

class Settings:
    PROJECT_NAME: str = "SynkTask API"
    
    # Chuỗi kết nối Database lấy từ Supabase
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    
    # Key bí mật dùng để ký và giải mã JWT Token (Nên đổi thành chuỗi ngẫu nhiên dài trong .env)
    SECRET_KEY: str = os.getenv("SECRET_KEY", "chuoi-bi-mat-mac-dinh-danh-cho-dev")
    ALGORITHM: str = "HS256"
    
    # Thời gian sống của Token (7 ngày)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 

# Khởi tạo một đối tượng settings để import ở các file khác
settings = Settings()