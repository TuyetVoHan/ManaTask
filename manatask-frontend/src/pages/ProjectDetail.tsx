import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import api from "../services/api";

import { Header } from "../components/Header";
import { TaskColumn } from "../components/TaskColumn";
import { TaskCreateDialog } from "../components/TaskCreateDialog";
import { TaskViewDialog } from "../components/TaskViewDialog";
import { Button } from "../components/ui/button";
import { BarChart3, Plus, ChevronLeft, Users, Settings } from "lucide-react";

export default function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [tasks, setTasks] = useState([]);
  const [columns, setColumns] = useState([]);
  const [project, setProject] = useState<any>(null);
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      // 1. Kiểm tra quyền truy cập trước
      const projectRes = await api.get("/projects/");
      const current = projectRes.data.find((p: any) => p.projectId === Number(projectId));
      
      // Nếu không tìm thấy dự án trong danh sách của mình -> Đuổi về
      if (!current) {
        alert("🛑 Bạn không có quyền truy cập hoặc dự án không tồn tại!");
        navigate("/dashboard");
        return;
      }
      
      // 2. Nếu có quyền, mới được phép gọi API lấy Cột và Task
      setProject(current);
      const [statusRes, taskRes] = await Promise.all([
        api.get(`/statuses/project/${projectId}`),
        api.get(`/tasks/project/${projectId}`)
      ]);
      
      setColumns(statusRes.data);
      setTasks(taskRes.data);

      // Xử lý mở Task từ Calendar truyền sang
      if (location.state?.openTaskId) {
        const taskToOpen = taskRes.data.find((t: any) => t.taskId === location.state.openTaskId);
        if (taskToOpen) {
          setSelectedTask(taskToOpen);
          setIsViewOpen(true);
        }
        window.history.replaceState({}, document.title);
      }

    } catch (error) {
      console.error(error);
    }
  };

  const handleAddColumn = async () => {
    const colName = window.prompt("Nhập tên cột trạng thái mới (VD: Testing, Review):");
    if (!colName || !colName.trim()) return;

    try {
      await api.post("/statuses/", {
        statusName: colName.trim(),
        projectId: Number(projectId)
      });
      fetchData(); // Load lại bảng
    } catch (error: any) {
      alert("Lỗi: " + (error.response?.data?.detail || "Không thể tạo cột"));
    }
  };

const handleDragEnd = async (result: any) => {
    const { destination, source, draggableId, type } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // NẾU LÀ KÉO CỘT
    if (type === "COLUMN") {
      const newColumns = Array.from(columns);
      const [movedColumn] = newColumns.splice(source.index, 1);
      newColumns.splice(destination.index, 0, movedColumn);
      
      setColumns(newColumns); // Update UI mượt mà lập tức

      try {
        await api.put(`/statuses/project/${projectId}/reorder`, {
          statusIds: newColumns.map((col: any) => col.statusId)
        });
      } catch (error) {
        fetchData(); // Bị lỗi thì load lại
      }
      return;
    }

    // NẾU LÀ KÉO CÔNG VIỆC (TASK)
    const newStatusId = parseInt(destination.droppableId);
    const updatedTasks: any = tasks.map((t: any) => 
      t.taskId.toString() === draggableId ? { ...t, statusId: newStatusId } : t
    );
    setTasks(updatedTasks);
    try {
      await api.put(`/tasks/${draggableId}/status`, { statusId: newStatusId });
    } catch (error) { fetchData(); }
  };

  // Thêm 2 hàm này ngay dưới handleDragEnd:
  const handleEditColumn = async (id: number, currentTitle: string) => {
    const newTitle = window.prompt("Nhập tên mới cho cột:", currentTitle);
    if (!newTitle || !newTitle.trim() || newTitle === currentTitle) return;
    try {
      await api.put(`/statuses/${id}`, { statusName: newTitle.trim() });
      fetchData();
    } catch (error: any) { alert("Lỗi: " + error.response?.data?.detail); }
  };

  const handleDeleteColumn = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa cột này không?")) {
      try {
        await api.delete(`/statuses/${id}`);
        fetchData();
      } catch (error: any) { alert("Lỗi: " + (error.response?.data?.detail || "Không thể xóa")); }
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <Header />
      
      {/* Sub-header */}
      <div className="px-6 py-4 border-b bg-gray-50/50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              {project?.projectTitle || `Dự án #${projectId}`}
            </h2>
            <div className="flex items-center gap-2 text-xs text-gray-500 font-bold uppercase tracking-wider">
              <span className="flex items-center text-blue-600"><Users className="h-3 w-3 mr-1"/> Kanban Board</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="font-bold border-purple-200 text-purple-700 hover:bg-purple-50"
            onClick={() => navigate(`/project/${projectId}/report`)}
          >
            <BarChart3 className="mr-2 h-4 w-4" /> Thống kê
          </Button>
          <Button 
            onClick={() => setIsCreateOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 font-bold"
          >
            <Plus className="mr-2 h-5 w-5" /> Thêm công việc
          </Button>
          <Button 
            variant="outline" 
            className="font-bold border-gray-300 text-gray-700 hover:bg-gray-100"
            onClick={() => navigate(`/project/${projectId}/settings`)}
          >
            <Settings className="mr-2 h-4 w-4" /> Cài đặt
          </Button>
        </div>
      </div>

      {/* Board Area */}
      <main className="flex-1 overflow-x-auto p-6 bg-white">
        <DragDropContext onDragEnd={handleDragEnd}>
          {/* Bọc toàn bộ cột bằng Droppable direction="horizontal" */}
          <Droppable droppableId="all-columns" direction="horizontal" type="COLUMN">
            {(provided: any) => (
              <div 
                {...provided.droppableProps} 
                ref={provided.innerRef} 
                className="flex gap-6 h-full items-start"
              >
                {columns.map((col: any, index: number) => (
                  <TaskColumn 
                    key={col.statusId}
                    index={index}       // <--- TRUYỀN INDEX XUỐNG
                    statusId={col.statusId}
                    title={col.statusName}
                    tasks={tasks.filter((t: any) => t.statusId === col.statusId)}
                    onTaskClick={(t) => { setSelectedTask(t); setIsViewOpen(true); }}
                    onEditColumn={handleEditColumn}       // <--- TRUYỀN HÀM XUỐNG
                    onDeleteColumn={handleDeleteColumn}   // <--- TRUYỀN HÀM XUỐNG
                  />
                ))}
                {provided.placeholder}

                {/* --- NÚT THÊM CỘT MỚI VẪN GIỮ NGUYÊN --- */}
                <Button 
                  variant="outline" 
                  onClick={handleAddColumn}
                  className="w-80 h-14 flex-shrink-0 border-dashed border-2 border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600 font-bold bg-transparent"
                >
                  <Plus className="mr-2 h-5 w-5" /> Thêm cột trạng thái
                </Button>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </main>

      {/* Dialogs */}
      <TaskCreateDialog 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        projectId={Number(projectId)} 
        onSuccess={fetchData} 
      />
      <TaskViewDialog 
        isOpen={isViewOpen} 
        onClose={() => setIsViewOpen(false)} 
        task={selectedTask} 
        projectId={Number(projectId)} 
        onSuccess={fetchData} 
      />
    </div>
  );
}