import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { Header } from "../components/Header";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ChevronLeft, Trash2, Users, Save } from "lucide-react";

export default function ProjectSettings() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [projectTitle, setProjectTitle] = useState("");
  const [members, setMembers] = useState<any[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("Member");

  const fetchProjectData = async () => {
    try {
      const projRes = await api.get("/projects/");
      const currentProj = projRes.data.find((p: any) => p.projectId === Number(projectId));
      
      if (!currentProj) {
        alert("🛑 Bạn không có quyền truy cập cài đặt của dự án này!");
        navigate("/dashboard");
        return;
      }
      
      setProjectTitle(currentProj.projectTitle);
      setIsCompleted(currentProj.isCompleted || false);
      
      const memRes = await api.get(`/projects/${projectId}/members`);
      setMembers(memRes.data);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu dự án", error);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const handleUpdateTitle = async () => {
    if (!projectTitle.trim()) return;
    try {
      await api.put(`/projects/${projectId}`, { projectTitle });
      alert("Đã cập nhật tên dự án thành công!");
    } catch (error: any) {
      alert("Lỗi: " + error.response?.data?.detail);
    }
  };

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) return;
    try {
      await api.post(`/projects/${projectId}/members`, {
        email: newMemberEmail,
        role: newMemberRole
      });
      setNewMemberEmail("");
      fetchProjectData();
      alert("Đã mời thành viên thành công!");
    } catch (error: any) {
      alert("Lỗi: " + error.response?.data?.detail);
    }
  };

  const handleRemoveMember = async (participantId: number) => {
    if (window.confirm("Bạn có chắc muốn xóa thành viên này khỏi dự án?")) {
      try {
        await api.delete(`/projects/${projectId}/members/${participantId}`);
        fetchProjectData();
      } catch (error: any) {
        alert("Lỗi: " + error.response?.data?.detail);
      }
    }
  };

  const handleToggleComplete = async () => {
    if (window.confirm(isCompleted ? "Bạn muốn mở lại dự án này?" : "Xác nhận đóng và đánh dấu hoàn thành dự án này?")) {
      try {
        const res = await api.put(`/projects/${projectId}/toggle-complete`);
        setIsCompleted(res.data.isCompleted);
        alert(res.data.isCompleted ? "Đã đánh dấu hoàn thành!" : "Đã mở lại dự án!");
      } catch (error: any) {
        alert("Lỗi: " + error.response?.data?.detail);
      }
    }
  };

  const handleDeleteProject = async () => {
    if (window.confirm("CẢNH BÁO: Bạn có chắc chắn muốn xóa vĩnh viễn dự án này không?")) {
      try {
        await api.delete(`/projects/${projectId}`);
        navigate("/dashboard");
      } catch (error: any) {
        alert("Lỗi xóa dự án: " + error.response?.data?.detail);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="p-8 max-w-4xl mx-auto w-full flex-1">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => navigate(`/project/${projectId}`)}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Quay lại
          </Button>
          <h2 className="text-3xl font-black tracking-tight text-gray-900">Cài đặt Dự án</h2>
        </div>

        <div className="space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          {/* Cập nhật tên */}
          <div>
            <h3 className="text-lg font-bold mb-4">Thông tin cơ bản</h3>
            <div className="flex gap-4">
              <Input 
                value={projectTitle} 
                onChange={e => setProjectTitle(e.target.value)} 
                className="max-w-md font-semibold text-lg"
              />
              <Button onClick={handleUpdateTitle} className="bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2" /> Lưu tên
              </Button>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Quản lý thành viên */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center"><Users className="h-5 w-5 mr-2" /> Quản lý thành viên</h3>
            
            <div className="flex gap-4 mb-6">
              <Input 
                placeholder="Nhập email thành viên cần mời..." 
                value={newMemberEmail} 
                onChange={e => setNewMemberEmail(e.target.value)} 
                className="max-w-xs"
              />
              <select 
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={newMemberRole}
                onChange={e => setNewMemberRole(e.target.value)}
              >
                <option value="Member">Thành viên (Member)</option>
                <option value="Leader">Quản lý (Leader)</option>
              </select>
              <Button onClick={handleAddMember} variant="outline">Mời vào dự án</Button>
            </div>

            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
              {members.map(member => (
                <div key={member.participantId} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                  <div>
                    <div className="font-bold">{member.fullName} <span className="text-sm font-normal text-gray-500">({member.email})</span></div>
                    <div className={`text-xs font-bold mt-1 ${member.role === 'Leader' ? 'text-blue-600' : 'text-gray-500'}`}>
                      Vai trò: {member.role}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => handleRemoveMember(member.participantId)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KHU VỰC NGUY HIỂM (DANGER ZONE) */}
        <div className="mt-12 border-t border-gray-200 pt-8 max-w-4xl">
          <h3 className="text-xl font-bold text-red-600 mb-6">Khu vực quản trị (Danger Zone)</h3>
          
          <div className="space-y-4">
            {/* Nút Hoàn thành dự án */}
            <div className="flex items-center justify-between bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div>
                <h4 className="font-bold text-gray-900 text-base mb-1">Trạng thái dự án</h4>
                <p className="text-sm text-gray-600">
                  {isCompleted 
                    ? "Dự án đang bị đóng. Việc này làm mờ dự án ở trang chủ." 
                    : "Đánh dấu hoàn thành sẽ đóng băng dự án và làm mờ nó ngoài Dashboard."}
                </p>
              </div>
              <Button 
                variant={isCompleted ? "outline" : "default"} 
                onClick={handleToggleComplete}
                className={!isCompleted ? "bg-green-600 hover:bg-green-700 font-bold" : "font-bold"}
              >
                {isCompleted ? "Mở lại dự án" : "Hoàn thành dự án"}
              </Button>
            </div>

            {/* Nút Xóa vĩnh viễn dự án */}
            <div className="flex items-center justify-between bg-red-50/50 p-5 rounded-xl border border-red-100">
              <div>
                <h4 className="font-bold text-red-900 text-base mb-1">Xóa dự án</h4>
                <p className="text-sm text-red-600/80">
                  Xóa toàn bộ công việc, tài liệu và cài đặt của dự án này. Hành động này không thể hoàn tác.
                </p>
              </div>
              <Button 
                variant="destructive" 
                onClick={handleDeleteProject}
                className="font-bold whitespace-nowrap"
              >
                Xóa vĩnh viễn dự án
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}