import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

export function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "", confirmPassword: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      await api.post("/auth/signup", {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName
      });
      alert("🎉 Đăng ký thành công! Hãy đăng nhập.");
      navigate("/signin");
    } catch (error: any) {
      alert("Lỗi: " + (error.response?.data?.detail || "Không thể đăng ký"));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-600">📝 Tạo tài khoản mới</CardTitle>
          <CardDescription>Tham gia ManaTask để quản lý dự án hiệu quả hơn</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Họ và tên</Label>
              <Input required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="Nguyễn Văn A" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="name@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Mật khẩu</Label>
              <Input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Xác nhận mật khẩu</Label>
              <Input type="password" required value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 font-bold py-6">Đăng ký tài khoản</Button>
            <div className="text-center mt-4">
              <button type="button" onClick={() => navigate("/signin")} className="text-sm text-blue-600 hover:underline font-bold">Đã có tài khoản? Đăng nhập</button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}