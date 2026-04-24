import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import api from "../services/api";

import { Header } from "../components/Header";
import { TaskColumn } from "../components/TaskColumn";
import { TaskCreateDialog } from "../components/TaskCreateDialog";
import { TaskViewDialog } from "../components/TaskViewDialog";
import { FilterBar } from "../components/FilterBar";
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

  // STATE CHO BỘ LỌC
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAssignees, setFilterAssignees] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      // 1. Kiểm tra quyền truy cập trước
      const projectRes = await api.get("/projects/");
      const current = projectRes.data.find((p: any) => p.projectId === Number(projectId));
      
      if (!current) {
        alert("🛑 Bạn không có quyền truy cập hoặc dự án không tồn tại!");
        navigate("/dashboard");
        return;
      }
      
      // 2. Tải Cột, Task và Thành viên (để làm Filter)
      setProject(current);
      const [statusRes, taskRes, memRes] = await Promise.all([
        api.get(`/statuses/project/${projectId}`),
        api.get(`/tasks/project/${projectId}`),
        api.get(`/projects/${projectId}/members`)
      ]);
      
      setColumns(statusRes.data);
      setTasks(taskRes.data);
      setMembers(memRes.data);

      // Mở Popup Task nếu click từ Calendar/Notification
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

  const handleDragEnd = async (result: any) => {
    const { destination, source, draggableId, type } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // Kéo thả CỘT
    if (type === "COLUMN") {
      const newColumns = Array.from(columns);
      const [movedColumn] = newColumns.splice(source.index, 1);
      newColumns.splice(destination.index, 0, movedColumn);
      setColumns(newColumns);

      try {
        await api.put(`/statuses/project/${projectId}/reorder`, {
          statusIds: newColumns.map((col: any) => col.statusId)
        });
      } catch (error) { fetchData(); }
      return;
    }

    // Kéo thả TASK
    const newStatusId = parseInt(destination.droppableId);
    const updatedTasks: any = tasks.map((t: any) => 
      t.taskId.toString() === draggableId ? { ...t, statusId: newStatusId } : t
    );
    setTasks(updatedTasks);
    
    try {
      await api.put(`/tasks/${draggableId}/status`, { statusId: newStatusId });
    } catch (error) { fetchData(); }
  };

  const handleAddColumn = async () => {
    const title = window.prompt("Nhập tên cột trạng thái mới:");
    if (!title || !title.trim()) return;
    try {
      await api.post("/statuses/", { statusName: title.trim(), projectId: Number(projectId) });
      fetchData();
    } catch (error: any) { alert("Lỗi: " + error.response?.data?.detail); }
  };

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

  if (!project) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col overflow-hidden">
      <Header />
      
      {/* Project Topbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")} className="hover:bg-gray-100">
            <ChevronLeft className="h-4 w-4 mr-1" /> Về trang chủ
          </Button>
          <div className="h-6 w-px bg-gray-300"></div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">{project.projectTitle}</h2>
          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-md">
            Mã Dự Án: {projectId}
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" className="text-gray-600 font-bold hover:bg-gray-100" onClick={() => navigate(`/project/${projectId}/reports`)}>
            <BarChart3 className="mr-2 h-4 w-4" /> Báo cáo
          </Button>
          <Button variant="ghost" className="text-gray-600 font-bold hover:bg-gray-100" onClick={() => navigate(`/project/${projectId}/settings`)}>
            <Settings className="mr-2 h-4 w-4" /> Cài đặt
          </Button>
          <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700 font-bold ml-2">
            <Plus className="mr-2 h-4 w-4" /> Thêm công việc
          </Button>
        </div>
      </div>

      {/* Board Area */}
      <main className="flex-1 overflow-x-auto p-6 bg-white flex flex-col">
        
{/* THANH LỌC (FILTER BAR) */}
        <FilterBar 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          filterAssignees={filterAssignees} 
          setFilterAssignees={setFilterAssignees} 
          members={members} 
        />

        {/* BẢNG KANBAN */}
        {(() => {
          // Logic Lọc Multi-select
          const filteredTasks = tasks.filter((task: any) => {
            // Lọc theo tên
            if (searchQuery && !task.taskTitle.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            
            // Lọc theo mảng thành viên (Nếu mảng lớn hơn 0 tức là đang có người bị chọn)
            if (filterAssignees.length > 0) {
              const wantsUnassigned = filterAssignees.includes("UNASSIGNED");
              const targetIds = filterAssignees
                                  .filter(id => id !== "UNASSIGNED")
                                  .map(id => parseInt(id));

              if (task.assigneeId === null) {
                // Nếu task trống người, mà mảng lọc KHÔNG có "UNASSIGNED" -> Ẩn đi
                if (!wantsUnassigned) return false;
              } else {
                // Nếu task có người, mà người đó KHÔNG nằm trong mảng targetIds -> Ẩn đi
                if (!targetIds.includes(task.assigneeId)) return false;
              }
            }
            return true;
          });

          return (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="all-columns" direction="horizontal" type="COLUMN">
                {(provided: any) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="flex gap-6 items-start flex-1 min-h-0">
                    {columns.map((col: any, index: number) => (
                      <TaskColumn 
                        key={col.statusId}
                        index={index}
                        statusId={col.statusId}
                        title={col.statusName}
                        // Đẩy Task ĐÃ LỌC vào Cột
                        tasks={filteredTasks.filter((t: any) => t.statusId === col.statusId)}
                        onTaskClick={(t) => { setSelectedTask(t); setIsViewOpen(true); }}
                        onEditColumn={handleEditColumn}
                        onDeleteColumn={handleDeleteColumn}
                      />
                    ))}
                    {provided.placeholder}

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
          );
        })()}
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