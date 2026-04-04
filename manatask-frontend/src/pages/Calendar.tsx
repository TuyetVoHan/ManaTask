import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { Header } from "../components/Header";
import { Calendar as CalendarUI } from "../components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Clock, CalendarCheck } from "lucide-react";

export default function Calendar() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<any[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // State mới: Lưu ID của cột "Done"
  const [doneStatusId, setDoneStatusId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Gọi song song 2 API để tối ưu tốc độ: Lấy Task và Lấy Trạng thái
        const [taskRes, statusRes] = await Promise.all([
          api.get("/tasks/me"),
          api.get("/statuses/")
        ]);

        // Tìm ID của trạng thái "Done" (hoặc "Hoàn thành")
        const doneStatus = statusRes.data.find(
          (s: any) => s.statusName.toLowerCase() === 'done' || s.statusName.toLowerCase() === 'hoàn thành'
        );
        // Nếu không tìm thấy tên chính xác, giả định mặc định ID của Done là 3
        setDoneStatusId(doneStatus ? doneStatus.statusId : 3); 

        setTasks(taskRes.data);
      } catch (error) {
        console.error("Lỗi tải dữ liệu Lịch:", error);
      }
    };
    fetchData();
  }, []);

  // Lọc danh sách công việc
  const selectedDateTasks = tasks.filter((t) => {
    // 1. CHẶN: NẾU TASK ĐÃ XONG (CÓ STATUS LÀ DONE) THÌ KHÔNG HIỆN LÊN LỊCH NỮA
    if (doneStatusId && t.statusId === doneStatusId) return false;

    // 2. Lọc theo hạn chót trùng với ngày đang bấm trên lịch
    if (!t.deadline) return false;
    const taskDate = new Date(t.deadline);
    return date && taskDate.toDateString() === date.toDateString();
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 p-8 max-w-6xl mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <CalendarCheck className="text-blue-600 h-8 w-8" /> Lịch công việc
          </h2>
          <p className="text-gray-500 font-medium">Theo dõi hạn chót của tất cả công việc chưa hoàn thành</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="col-span-1 shadow-sm h-fit">
            <CardHeader><CardTitle>Chọn ngày</CardTitle></CardHeader>
            <CardContent className="flex justify-center">
              <CalendarUI mode="single" selected={date} onSelect={setDate} className="rounded-md border shadow-sm" />
            </CardContent>
          </Card>

          <Card className="col-span-1 md:col-span-2 shadow-sm">
            <CardHeader className="border-b bg-gray-50/50">
              <CardTitle className="text-xl">Công việc ngày {date?.toLocaleDateString('vi-VN')}</CardTitle>
              <CardDescription>Bạn có {selectedDateTasks.length} công việc cần hoàn thành</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col h-[400px] overflow-y-auto">
                {selectedDateTasks.length > 0 ? (
                  selectedDateTasks.map((task) => (
                    <div 
                      key={task.taskId} 
                      onClick={() => navigate(`/project/${task.projectId}`, { state: { openTaskId: task.taskId } })}
                      className="p-4 border-b hover:bg-blue-50 cursor-pointer transition-colors flex justify-between items-center group"
                    >
                      <div>
                        <h4 className="font-bold text-gray-800 text-lg mb-1 group-hover:text-blue-600 transition-colors">{task.taskTitle}</h4>
                        <p className="text-sm text-gray-500 line-clamp-1">{task.description || "Không có mô tả"}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="flex items-center text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded">
                          <Clock className="w-3 h-3 mr-1" /> Hạn chót
                        </span>
                        {task.storyPoint > 0 && (
                          <span className="text-xs font-bold text-blue-600 mt-2">
                            {task.storyPoint} Điểm
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <CalendarCheck className="h-12 w-12 mb-4 opacity-20" />
                    <p>Không có công việc nào chưa hoàn thành vào ngày này.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}