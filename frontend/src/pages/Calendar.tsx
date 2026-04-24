import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { Header } from "../components/Header";
import { Calendar as CalendarUI } from "../components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Clock, CalendarCheck } from "lucide-react";

export default function Calendar() {
  const navigate = useNavigate();
  
  // FIX: Khởi tạo mảng rỗng [] để tránh lỗi undefined khi dùng hàm .filter
  const [tasks, setTasks] = useState<any[]>([]); 
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        // FIX: Chỉ cần gọi 1 API duy nhất (Vì Backend đã tự động lọc các task Done rồi)
        const res = await api.get("/tasks/me");
        setTasks(res.data);
      } catch (error) {
        console.error("Lỗi tải dữ liệu Lịch:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTasks();
  }, []); // FIX: Thêm [] để ngăn không cho React bị lặp (Infinite Loop)

  // Lọc các task có Hạn chót (Deadline) trùng với Ngày đang chọn trên lịch
  const selectedDateTasks = tasks.filter((t) => {
    if (!t.deadline) return false;
    const taskDate = new Date(t.deadline);
    return date && taskDate.toDateString() === date.toDateString();
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Lịch công việc</h2>
          <p className="text-gray-500 font-medium mt-1">Theo dõi các hạn chót (Deadline) của bạn</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CỘT TRÁI: BỘ LỊCH CHỌN NGÀY */}
          <Card className="lg:col-span-1 border-0 shadow-md h-fit">
            <CardContent className="p-4 flex justify-center">
              <CalendarUI 
                mode="single" 
                selected={date} 
                onSelect={setDate} 
                className="rounded-md" 
              />
            </CardContent>
          </Card>

          {/* CỘT PHẢI: DANH SÁCH CÔNG VIỆC THEO NGÀY */}
          <Card className="lg:col-span-2 border-0 shadow-md">
            <CardHeader className="bg-gray-50/50 border-b pb-4">
              <CardTitle className="flex items-center text-xl text-gray-800">
                <CalendarCheck className="mr-2 h-6 w-6 text-blue-600" />
                Công việc ngày {date?.toLocaleDateString('vi-VN') || "..."}
              </CardTitle>
              <CardDescription>Các công việc bạn cần hoàn thành trong ngày này</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="text-center py-10 text-gray-400 font-medium animate-pulse">
                  Đang tải dữ liệu lịch...
                </div>
              ) : selectedDateTasks.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-gray-400 font-medium text-base">
                    Bạn không có deadline nào trong ngày này. Thật tuyệt vời! 🎉
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDateTasks.map((task: any) => (
                    <div 
                      key={task.taskId} 
                      // Nâng cấp UX: Làm nổi bật thẻ khi di chuột vào
                      className="group p-5 border rounded-xl hover:border-blue-400 hover:shadow-md transition-all cursor-pointer bg-white flex flex-col"
                      // Tính năng: Bấm vào Task sẽ bay thẳng về Dự án và mở Dialog Task đó lên
                      onClick={() => navigate(`/project/${task.projectId}`, { state: { openTaskId: task.taskId } })}
                    >
                      <h4 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors mb-4 text-lg">
                        {task.taskTitle}
                      </h4>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="flex items-center text-sm font-medium text-red-600 bg-red-50 px-3 py-1.5 rounded-full border border-red-100">
                          <Clock className="w-4 h-4 mr-1.5" /> 
                          Hạn chót: {new Date(task.deadline).toLocaleDateString('vi-VN')}
                        </span>
                        <span className="text-sm font-bold text-gray-400 group-hover:text-blue-500 transition-colors">
                          Vào dự án xử lý &rarr;
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}