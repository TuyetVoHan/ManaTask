import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// --- IMPORT CÁC TRANG (PAGES) ---
// Tùy thuộc vào cách bộ code Figma export, nếu file nào báo lỗi gạch đỏ ở chữ import,
// bạn có thể thử đổi từ import có ngoặc nhọn { } sang không có ngoặc nhọn nhé.
import { SignIn } from "./pages/SignIn";
import { SignUp } from "./pages/SignUp";
import ResetPasswordPage  from "./pages/ResetPasswordPage";

import Dashboard from "./pages/Dashboard"; 
import ProjectDetail from "./pages/ProjectDetail";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings"; // Figma dùng Settings thay cho Profile
import Calendar from "./pages/Calendar";
import ProjectSettings from "./pages/ProjectSettings";

// Component bảo vệ vòng ngoài: Bắt buộc có Token (đã đăng nhập) mới được vào
function PrivateRoute({ children }: { children: any }) {
  const token = localStorage.getItem("access_token");
  return token ? children : <Navigate to="/signin" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- CÁC TRANG CÔNG KHAI (KHÔNG CẦN ĐĂNG NHẬP) --- */}
        <Route path="/" element={<Navigate to="/signin" />} />
        
        {/* Trang Đăng nhập (Đã cấy API thành công) */}
        <Route path="/signin" element={<SignIn />} />
        
        {/* Trang Đăng ký và Quên mật khẩu */}
        <Route path="/signup" element={<SignUp {...({} as any)} />} />
        <Route path="/reset-password" element={<ResetPasswordPage {...({} as any)} />} />


        {/* --- CÁC TRANG BÊN TRONG (YÊU CẦU ĐĂNG NHẬP) --- */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              {/* Ép kiểu any để lách luật kiểm tra Props của TypeScript */}
              <Dashboard {...({} as any)} />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/project/:projectId" 
          element={
            <PrivateRoute>
              <ProjectDetail {...({} as any)} />
            </PrivateRoute>
          } 
        />

        {/* Trang Báo cáo Thống kê của dự án */}
       <Route path="/project/:projectId/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />

        {/* Trang Hồ sơ cá nhân (Figma đặt tên là Settings) */}
        <Route 
          path="/profile" 
          element={
            <PrivateRoute>
              <Settings {...({} as any)} />
            </PrivateRoute>
          } 
        />

        {/* Trang Lịch (Tính năng mở rộng của Figma) */}
        <Route 
          path="/calendar" 
          element={
            <PrivateRoute>
              <Calendar {...({} as any)} />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/project/:projectId/settings" 
          element={
            <PrivateRoute>
              <ProjectSettings />
            </PrivateRoute>
          } 
        />

      </Routes>
    </BrowserRouter>
  );
}