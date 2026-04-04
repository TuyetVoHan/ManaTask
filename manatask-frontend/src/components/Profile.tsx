import { useState, useEffect } from "react";
import api from "../services/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "./ui/card";
import { Avatar } from "./ui/avatar";

export function Profile() {
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    address: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Lấy thông tin user
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/users/me");
        setProfile({
          fullName: res.data.fullName || "",
          email: res.data.email || "", // Email thường không cho sửa
          phone: res.data.phone || "",
          dob: res.data.dob || "",
          address: res.data.address || ""
        });
      } catch (error) {
        console.error("Lỗi lấy thông tin:", error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.put("/users/me", {
        email: profile.email,
        fullName: profile.fullName,
        phone: profile.phone || null,
        dob: profile.dob || null,
        address: profile.address || null
      });
      alert("🎉 Cập nhật hồ sơ thành công!");
    } catch (error: any) {
      alert("Lỗi cập nhật: " + (error.response?.data?.detail || "Vui lòng thử lại"));
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>;

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-sm">
      <CardHeader className="flex flex-col items-center gap-4 sm:flex-row sm:justify-start">
        <Avatar name={profile.fullName} className="h-20 w-20 text-2xl font-bold" />
        <div>
          <CardTitle className="text-2xl font-bold text-gray-800">{profile.fullName}</CardTitle>
          <CardDescription className="text-base">{profile.email}</CardDescription>
        </div>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Họ và tên <span className="text-red-500">*</span></Label>
            <Input id="fullName" value={profile.fullName} onChange={(e) => setProfile({...profile, fullName: e.target.value})} required />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input id="phone" type="tel" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} placeholder="09xx..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Ngày sinh</Label>
              <Input id="dob" type="date" value={profile.dob} onChange={(e) => setProfile({...profile, dob: e.target.value})} />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Địa chỉ</Label>
            <Input id="address" value={profile.address} onChange={(e) => setProfile({...profile, address: e.target.value})} placeholder="Thành phố, Quốc gia..." />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end pt-4 border-t mt-4">
          <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 px-8 font-bold">
            {isLoading ? "Đang lưu..." : "💾 Lưu thay đổi"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}