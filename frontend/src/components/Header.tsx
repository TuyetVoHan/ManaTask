import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";

import { Button } from "./ui/button";
import { Avatar } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { NotificationDropdown } from "./NotificationDropdown";
import { CalendarDays } from "lucide-react";

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState({ fullName: "User", email: "" });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/users/me");
        setUser(res.data);
      } catch (error) {
        console.error("Lỗi tải thông tin user:", error);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/signin");
  };

  return (
    <header className="border-b bg-white px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-6">
        <h1 
          className="text-2xl font-black text-blue-600 cursor-pointer tracking-tight" 
          onClick={() => navigate("/dashboard")}
        >
          🚀 ManaTask
        </h1>
        
        {/* Nút vào trang Lịch */}
        <Button 
          variant={location.pathname === '/calendar' ? 'secondary' : 'ghost'} 
          className={`hidden sm:flex font-bold ${location.pathname === '/calendar' ? 'text-blue-700 bg-blue-50' : 'text-gray-600'}`}
          onClick={() => navigate("/calendar")}
        >
          <CalendarDays className="h-4 w-4 mr-2" /> Lịch công việc
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <NotificationDropdown {...({} as any)} />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-gray-200 p-0 overflow-hidden">
              <Avatar name={user.fullName} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="p-3 border-b mb-1 bg-gray-50">
              <p className="font-bold text-sm text-gray-800">{user.fullName}</p>
              <p className="text-xs text-gray-500 font-medium truncate">{user.email}</p>
            </div>
            <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer py-2 font-medium">
              👤 Hồ sơ cá nhân
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer py-2 text-red-600 font-bold focus:bg-red-50 focus:text-red-700">
              🚪 Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}