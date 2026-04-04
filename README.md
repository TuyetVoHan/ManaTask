## 1) Tổng quan

ManaTask gồm 2 phần:
- Backend: FastAPI (thư mục backend)
- Frontend: React + Vite (thư mục manatask-frontend)

Mặc định khi chạy local:
- Backend: http://localhost:8000
- Frontend: http://localhost:5173
- API docs (Swagger): http://localhost:8000/docs

## 2) Yêu cầu trước khi chạy

Cần cài sẵn:
- Python 3.10+ (khuyến nghị 3.11)
- Node.js 18+ và npm

Kiểm tra nhanh:

```powershell
python --version
node --version
npm --version
```

## 3) Tạo file .env cho backend

Tạo file backend/.env với nội dung tối thiểu:

```env
DATABASE_URL=postgresql://username:password@host:5432/dbname
SECRET_KEY=thay-bang-chuoi-bi-mat-rat-dai
```

Lưu ý:
- DATABASE_URL là chuỗi kết nối database của bạn (ví dụ Supabase Postgres).
- SECRET_KEY nên dài và ngẫu nhiên.

## 4) Cài thư viện backend

Do backend/requirements.txt hiện đang trống, bạn có thể cài nhanh bằng lệnh sau:

```powershell
cd backend
python -m pip install fastapi "uvicorn[standard]" sqlalchemy python-dotenv pydantic email-validator PyJWT "passlib[bcrypt]" psycopg2-binary
```

Nếu sau này bổ sung requirements.txt đầy đủ, có thể dùng:

```powershell
cd backend
python -m pip install -r requirements.txt
```

## 5) Chạy backend

```powershell
cd backend
python -m uvicorn app.main:app --reload
```

Kiểm tra backend đã lên:
- Mở trình duyệt: http://localhost:8000
- Mở API docs: http://localhost:8000/docs

## 6) Cài thư viện frontend

```powershell
cd manatask-frontend
npm install
```

## 7) Chạy frontend

```powershell
cd manatask-frontend
npm run dev
```

Sau đó mở URL Vite in ra trong terminal (thường là http://localhost:5173).

## 8) Quy trình chạy nhanh (copy 1 lần)

Mở 2 terminal riêng.

Terminal 1 (backend):

```powershell
cd backend
python -m uvicorn app.main:app --reload
```

Terminal 2 (frontend):

```powershell
cd manatask-frontend
npm run dev
```

## 9) Lỗi thường gặp

1. Lỗi CORS / không gọi được API
- Đảm bảo backend đang chạy cổng 8000.
- Frontend đang gọi API tại http://localhost:8000/api.

2. Lỗi kết nối database
- Kiểm tra lại DATABASE_URL trong backend/.env.
- Kiểm tra user/password/host/port/database.

3. Lỗi thiếu thư viện Python
- Chạy lại lệnh pip install ở mục 4.

4. Lỗi npm install hoặc npm run dev
- Xóa node_modules và cài lại:

```powershell
cd manatask-frontend
Remove-Item -Recurse -Force node_modules
npm install
npm run dev
```

## 10) Cấu trúc thư mục chính

```text
ManaTask/
	backend/
	manatask-frontend/
```

Chỉ cần nhớ 2 lệnh quan trọng nhất:
- Backend: python -m uvicorn app.main:app --reload
- Frontend: npm run dev
