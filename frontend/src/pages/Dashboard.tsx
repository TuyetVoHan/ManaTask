import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { Header } from "../components/Header";
import { ProjectCard } from "../components/ProjectCard";
import { ProjectCreateDialog } from "../components/ProjectCreateDialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Search, Plus, Folder, TrendingUp, CheckCircle } from "lucide-react";

export default function Dashboard() {
  const [projects, setProjects] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects/");
      
      // LOGIC SẮP XẾP: Đẩy các dự án isCompleted = true xuống cuối mảng
      const sortedProjects = [...res.data].sort((a: any, b: any) => {
        if (a.isCompleted === b.isCompleted) return 0;
        return a.isCompleted ? 1 : -1;
      });
      
      setProjects(sortedProjects);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((p: any) => 
    p.projectTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Tính toán số liệu cho Thẻ thống kê
  const total = projects.length;
  const completed = projects.filter(p => p.isCompleted).length;
  const active = total - completed;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="p-8 max-w-7xl mx-auto w-full flex-1">
        
        {/* Tiêu đề & Nút Tạo mới */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Dự án của tôi</h2>
            <p className="text-gray-500 font-medium">Quản lý và theo dõi tiến độ các dự án</p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700 font-bold px-6">
            <Plus className="mr-2 h-5 w-5" /> Tạo dự án mới
          </Button>
        </div>

        {/* 3 Thẻ thống kê nổi bật */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase">Tổng dự án</p>
              <h3 className="text-3xl font-black text-gray-900 mt-1">{total}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-full"><Folder className="h-6 w-6" /></div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase">Đang thực hiện</p>
              <h3 className="text-3xl font-black text-blue-600 mt-1">{active}</h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full"><TrendingUp className="h-6 w-6" /></div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase">Đã hoàn thành</p>
              <h3 className="text-3xl font-black text-green-600 mt-1">{completed}</h3>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-full"><CheckCircle className="h-6 w-6" /></div>
          </div>
        </div>

        {/* Thanh tìm kiếm */}
        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input 
            className="pl-10 h-12 bg-white border-gray-200 shadow-sm rounded-xl"
            placeholder="Tìm kiếm dự án..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Lưới Dự Án */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <div className="text-gray-400 mb-2">Chưa có dự án nào khớp với tìm kiếm</div>
            <Button variant="outline" onClick={() => setIsCreateOpen(true)}>Tạo dự án ngay</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project: any) => (
              <ProjectCard 
                key={project.projectId} 
                project={project} 
                onClick={() => navigate(`/project/${project.projectId}`)} 
              />
            ))}
          </div>
        )}
      </main>

      <ProjectCreateDialog 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        onSuccess={fetchProjects} 
      />
    </div>
  );
}