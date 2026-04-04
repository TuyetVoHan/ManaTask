import { useState, useEffect } from "react";
import api from "../services/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

interface TaskCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  onSuccess: () => void;
}

export function TaskCreateDialog({ isOpen, onClose, projectId, onSuccess }: TaskCreateDialogProps) {
  const [formData, setFormData] = useState({
    taskTitle: "", description: "", deadline: "", storyPoint: 0, assigneeId: ""
  });
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // STATE MỚI: Lưu ID của cột đầu tiên trong dự án
  const [firstColumnId, setFirstColumnId] = useState<number>(1);

  // Lấy dữ liệu mỗi khi mở popup
  useEffect(() => {
    if (isOpen && projectId) {
      // 1. Lấy danh sách thành viên dự án để giao việc
      api.get(`/projects/${projectId}/members`)
         .then(res => setMembers(res.data))
         .catch(err => console.error(err));
         
      // 2. Lấy danh sách cột trạng thái của dự án này để biết cột đầu tiên ID là bao nhiêu
      api.get(`/statuses/project/${projectId}`)
         .then(res => {
           if (res.data && res.data.length > 0) {
             setFirstColumnId(res.data[0].statusId); // Lấy cột đầu tiên (VD: To Do)
           }
         })
         .catch(err => console.error(err));
    }
  }, [isOpen, projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.taskTitle.trim()) return;
    
    setIsLoading(true);
    try {
      const payload = {
        taskTitle: formData.taskTitle,
        description: formData.description || null,
        storyPoint: Number(formData.storyPoint) || 0,
        deadline: formData.deadline || null,
        projectId: projectId,
        assigneeId: formData.assigneeId ? Number(formData.assigneeId) : null,
        statusId: firstColumnId // <--- THAY SỐ 1 BẰNG BIẾN ĐỘNG NÀY
      };
      
      await api.post("/tasks/", payload);
      setFormData({ taskTitle: "", description: "", deadline: "", storyPoint: 0, assigneeId: "" });
      onSuccess();
      onClose();
    } catch (error: any) {
      alert("Lỗi: " + (error.response?.data?.detail || "Không thể tạo Task"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader><DialogTitle className="text-xl font-bold">✨ Thêm công việc mới</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Tên công việc <span className="text-red-500">*</span></Label>
            <Input required value={formData.taskTitle} onChange={e => setFormData({...formData, taskTitle: e.target.value})} placeholder="VD: Thiết kế Database" />
          </div>
          <div className="space-y-2">
            <Label>Mô tả chi tiết</Label>
            <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Mô tả công việc cần làm..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Hạn chót</Label>
              <Input type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Story Point</Label>
              <Input type="number" min="0" value={formData.storyPoint} onChange={e => setFormData({...formData, storyPoint: Number(e.target.value)})} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Giao cho ai?</Label>
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={formData.assigneeId} 
              onChange={e => setFormData({...formData, assigneeId: e.target.value})}
            >
              <option value="">-- Chưa giao việc --</option>
              {members.map(m => (
                <option key={m.participantId} value={m.participantId}>{m.fullName} ({m.email})</option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">Tạo công việc</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}