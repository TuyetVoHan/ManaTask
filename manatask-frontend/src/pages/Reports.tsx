import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { Header } from "../components/Header";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { ChevronLeft, Trophy, Target, TrendingUp, ListTodo } from "lucide-react";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as PieTooltip, Legend, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as BarTooltip 
} from "recharts";

const PIE_COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];

export default function Reports() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const checkAccessAndFetch = async () => {
      try {
        // LỚP BẢO MẬT 1: Chống truy cập trái phép (Đã được khôi phục)
        const projRes = await api.get("/projects/");
        const current = projRes.data.find((p: any) => p.projectId === Number(projectId));
        
        if (!current) {
          alert("🛑 Bạn không có quyền xem báo cáo của dự án này!");
          navigate("/dashboard");
          return;
        }

        const statsRes = await api.get(`/projects/${projectId}/statistics`);
        setStats(statsRes.data);
      } catch (error) {
        console.error(error);
      }
    };
    
    checkAccessAndFetch();
  }, [projectId]);

  if (!stats) return <div className="p-10 text-center text-gray-500 font-medium animate-pulse">Đang tải báo cáo dự án...</div>;

  // BỌC LỖI AN TOÀN: Nếu API backend chưa reload kịp và trả về thiếu, tự động gán mảng rỗng []
  // Nhờ đó React và Recharts sẽ không bao giờ bị sập (crash)
  const tasksByStatus = stats.tasksByStatus || [];
  const memberContributions = stats.memberContributions || [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="p-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => navigate(`/project/${projectId}`)}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Quay lại bảng
          </Button>
          <div>
            <h2 className="text-3xl font-black tracking-tight text-gray-900">Báo cáo & Phân tích</h2>
            <p className="text-gray-500 font-medium text-sm">Cập nhật theo thời gian thực (Real-time)</p>
          </div>
        </div>

        {/* 4 THẺ THỐNG KÊ TỔNG QUAN */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-bold text-gray-500 uppercase">Tổng Công Việc</CardTitle>
              <ListTodo className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent><div className="text-3xl font-black text-gray-900">{stats.totalTasks || 0}</div></CardContent>
          </Card>
          
          <Card className="bg-blue-600 text-white border-0 shadow-lg">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-bold uppercase opacity-80">Tổng Story Points</CardTitle>
              <Target className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent><div className="text-3xl font-black">{stats.totalSP || 0}</div></CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-bold text-gray-500 uppercase">SP Hoàn Thành</CardTitle>
              <Trophy className="h-5 w-5 text-yellow-500" />
            </CardHeader>
            <CardContent><div className="text-3xl font-black text-gray-900">{stats.completedSP || 0}</div></CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-bold text-gray-500 uppercase">Tiến Độ Dự Án</CardTitle>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent><div className="text-3xl font-black text-green-600">{stats.progressPercent || 0}%</div></CardContent>
          </Card>
        </div>

        {/* THANH TIẾN ĐỘ LỚN */}
        <Card className="border-0 shadow-md p-6 mb-8">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Mức độ hoàn thiện (Theo Story Point)</h3>
              <p className="text-sm text-gray-500">Tiến độ tổng thể của toàn bộ đội ngũ</p>
            </div>
            <span className="text-2xl font-black text-blue-600">{stats.progressPercent || 0}%</span>
          </div>
          <Progress value={stats.progressPercent || 0} className="h-4 bg-gray-100" />
        </Card>

        {/* KHU VỰC 2 BIỂU ĐỒ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* BIỂU ĐỒ CỘT: Phân bổ công việc */}
          <Card className="border-0 shadow-md p-6 flex flex-col">
            <CardTitle className="text-lg font-bold mb-1">📊 Phân bổ công việc theo Trạng thái</CardTitle>
            <p className="text-sm text-gray-500 mb-6">Số lượng Task hiện đang nằm ở các cột (Kanban Board)</p>
            
            {tasksByStatus.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-gray-400 font-medium">
                Chưa có dữ liệu để vẽ biểu đồ. Hãy tạo thêm các cột trạng thái!
              </div>
            ) : (
              <div className="flex-1 min-h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tasksByStatus} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="statusName" tick={{fontSize: 12, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{fontSize: 12, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                    <BarTooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="taskCount" name="Số lượng Task" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          {/* BIỂU ĐỒ TRÒN: Đóng góp của thành viên */}
          <Card className="border-0 shadow-md p-6 flex flex-col">
            <CardTitle className="text-lg font-bold mb-1">🏆 Đóng góp thành viên (Story Point)</CardTitle>
            <p className="text-sm text-gray-500 mb-6">Chỉ tính những công việc đã nằm ở cột Done</p>
            
            {memberContributions.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-gray-400 font-medium">
                Chưa có công việc nào được hoàn thành để thống kê đóng góp.
              </div>
            ) : (
              <div className="flex-1 h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={memberContributions} 
                      dataKey="completedSP" 
                      nameKey="fullName" 
                      cx="50%" cy="45%" 
                      innerRadius={70} 
                      outerRadius={100} 
                      paddingAngle={2} 
                      stroke="none"
                      // Tắt label mặc định hay bị tràn chữ ra ngoài
                      labelLine={false}
                      label={false}
                    >
                      {memberContributions.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <PieTooltip 
                      formatter={(value) => [`${value} SP`, "Hoàn thành"]}
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={40} 
                      iconType="circle"
                      wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}