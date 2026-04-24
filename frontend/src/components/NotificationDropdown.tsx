import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // <--- THÊM IMPORT NÀY
import api from "../services/api";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const navigate = useNavigate(); // <--- KHỞI TẠO NÀY

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications/");
      setNotifications(res.data);
    } catch (error) {
      console.error("Lỗi lấy thông báo:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const intervalId = setInterval(() => { fetchNotifications(); }, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsReadAndNavigate = async (notif: any) => {
    // 1. Đánh dấu đã đọc trên Backend trước
    if (!notif.isRead) {
      try {
        await api.put(`/notifications/${notif.notificationId}/read`);
        fetchNotifications();
      } catch (error) { console.error(error); }
    }

    // 2. CHUYỂN HƯỚNG DỰA VÀO DỮ LIỆU THÔNG BÁO
    if (notif.projectId && notif.taskId) {
      // Trường hợp có Task: Bay vào dự án và ra lệnh mở cái Task đó lên
      navigate(`/project/${notif.projectId}`, { state: { openTaskId: notif.taskId } });
    } 
    else if (notif.projectId) {
      // Trường hợp chỉ có Dự án: Bay vào xem Bảng Kanban
      navigate(`/project/${notif.projectId}`);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put("/notifications/read-all");
      fetchNotifications();
    } catch (error) { console.error(error); }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-gray-100 rounded-full">
          <Bell className="h-5 w-5 text-gray-600" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] bg-red-500 hover:bg-red-600 border-none">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50/80">
          <span className="font-black text-sm tracking-tight text-gray-800">THÔNG BÁO MỚI</span>
          <Button variant="ghost" size="sm" className="text-xs text-blue-600 h-6 px-2 font-bold hover:bg-blue-50" onClick={handleMarkAllAsRead}>
            <CheckCheck className="h-4 w-4 mr-1" /> Đã đọc hết
          </Button>
        </div>
        <ScrollArea className="h-[350px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-sm font-medium text-gray-400">Bạn không có thông báo nào.</div>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif.notificationId} 
                className={`p-4 border-b text-sm cursor-pointer transition-all hover:bg-gray-50 ${
                  notif.isRead ? 'bg-white text-gray-500' : 'bg-blue-50/50 text-gray-900 border-l-4 border-l-blue-500'
                }`}
                onClick={() => handleMarkAsReadAndNavigate(notif)}
              >
                <p className="mb-1.5 font-medium leading-snug">{notif.content}</p>
                <span className="text-[11px] text-gray-400 font-medium">
                  {new Date(notif.CreatedAt).toLocaleString('vi-VN')}
                </span>
              </div>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}