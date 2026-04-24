import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Dùng để chuyển trang
import api from "../services/api"; // Ống nước API của chúng ta

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

export function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Hàm xử lý khi bấm nút Đăng nhập
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Gọi API xuống Backend FastAPI
      const response = await api.post('/auth/login', { 
        email: email, 
        password: password 
      });
      
      // Lưu Token vào LocalStorage
      localStorage.setItem('access_token', response.data.access_token);
      
      // Thành công -> Chuyển hướng vào Dashboard
      navigate("/dashboard");
      
    } catch (error: any) {
      alert('Đăng nhập thất bại: ' + (error.response?.data?.detail || "Vui lòng kiểm tra lại"));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-1 text-center mb-2">
          <CardTitle className="text-2xl font-bold text-blue-600">🚀 ManaTask</CardTitle>
          <CardDescription>
            Đăng nhập để quản lý dự án của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="focus-visible:ring-blue-500"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mật khẩu</Label>
                <button
                  type="button"
                  onClick={() => navigate("/reset-password")}
                  className="text-sm text-blue-600 hover:underline font-medium"
                >
                  Quên mật khẩu?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="focus-visible:ring-blue-500"
              />
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 mt-2">
              Đăng nhập
            </Button>
            
            <div className="text-center mt-4">
              <span className="text-sm text-gray-500">Chưa có tài khoản? </span>
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="text-sm text-blue-600 hover:underline font-bold"
              >
                Đăng ký ngay
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}