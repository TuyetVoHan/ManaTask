import { useState, useEffect } from "react";
import api from "../services/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Trash2, Send, Clock } from "lucide-react";
import { Avatar } from "./ui/avatar";

interface TaskViewDialogProps {
  task: any | null;
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  onSuccess: () => void;
}

export function TaskViewDialog({ task, isOpen, onClose, projectId, onSuccess }: TaskViewDialogProps) {
  const [formData, setFormData] = useState<any>({
    taskTitle: "", description: "", deadline: "", storyPoint: 0, assigneeId: ""
  });
  const [members, setMembers] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (task && isOpen) {
      setFormData({
        taskTitle: task.taskTitle, description: task.description || "",
        deadline: task.deadline || "", storyPoint: task.storyPoint || 0,
        assigneeId: task.assigneeId || ""
      });
      // Tải danh sách thành viên và bình luận
      api.get(`/projects/${projectId}/members`).then(res => setMembers(res.data)).catch(console.error);
      fetchComments();
    }
  }, [task, isOpen]);

  const fetchComments = async () => {
    try {
      if (task?.taskId) {
        const res = await api.get(`/tasks/${task.taskId}/comments`);
        setComments(res.data);
      }
    } catch (error) { console.error(error); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/tasks/${task.taskId}`, {
        ...formData,
        storyPoint: Number(formData.storyPoint),
        assigneeId: formData.assigneeId ? Number(formData.assigneeId) : null,
        deadline: formData.deadline || null
      });
      onSuccess();
      onClose();
    } catch (error: any) { alert("Lỗi: " + error.response?.data?.detail); }
  };

  const handleDelete = async () => {
    if (window.confirm("Bạn có chắc muốn xóa công việc này?")) {
      try {
        await api.delete(`/tasks/${task.taskId}`);
        onSuccess();
        onClose();
      } catch (error: any) { alert("Lỗi xóa: " + error.response?.data?.detail); }
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    try {
      await api.post(`/tasks/${task.taskId}/comments`, { commentContent: newComment });
      setNewComment("");
      fetchComments(); // Tải lại danh sách bình luận
    } catch (error: any) { alert("Lỗi gửi bình luận"); }
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        {/* HEADER GỌN GÀNG HƠN (Đã bỏ nút Xóa) */}
        <div className="bg-gray-50 border-b p-4">
          <DialogTitle className="text-xl font-bold">Mã #{task.taskId}: {task.taskTitle}</DialogTitle>
        </div>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-4">
            <TabsTrigger value="details" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none">📝 Chi tiết</TabsTrigger>
            <TabsTrigger value="comments" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none">💬 Bình luận ({comments.length})</TabsTrigger>
          </TabsList>
          
          {/* TAB CHI TIẾT */}
          <TabsContent value="details" className="p-6 pt-2 m-0">
            <form onSubmit={handleUpdate} className="grid gap-4 mt-4">
              <div className="space-y-2">
                <Label>Tên công việc</Label>
                <Input required value={formData.taskTitle} onChange={e => setFormData({...formData, taskTitle: e.target.value})} className="font-bold" />
              </div>
              <div className="space-y-2">
                <Label>Mô tả chi tiết</Label>
                <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="h-24" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Hạn chót</Label>
                  <Input type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Story Point</Label>
                  <Input 
                    type="number" 
                    min="0" 
                    max="100"
                    value={formData.storyPoint} 
                    onChange={e => {
                      let val = Number(e.target.value);
                      if (val < 0) val = 0;
                      if (val > 100) val = 100; // Khóa cứng ở 100
                      setFormData({...formData, storyPoint: val});
                    }} 
                  />
                  <p className="text-[11px] text-gray-500">Tối đa: 100 SP</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Người thực hiện</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" value={formData.assigneeId} onChange={e => setFormData({...formData, assigneeId: e.target.value})}>
                  <option value="">-- Chưa giao việc --</option>
                  {members.map(m => (
                    <option key={m.participantId} value={m.participantId}>{m.fullName}</option>
                  ))}
                </select>
              </div>
              
              {/* KHU VỰC NÚT BẤM DƯỚI CÙNG (Đã gộp nút Xóa và Lưu) */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                <Button 
                  type="button" // Rất quan trọng để không kích hoạt Submit Form
                  variant="outline" 
                  onClick={handleDelete}
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 font-medium"
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Xóa công việc
                </Button>
                
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 font-bold px-8">
                  💾 Lưu thay đổi
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* TAB BÌNH LUẬN (Giữ nguyên) */}
          <TabsContent value="comments" className="p-0 m-0 flex flex-col h-[400px]">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
              {comments.length === 0 ? (
                <div className="text-center text-gray-500 mt-10">Chưa có bình luận nào. Hãy bắt đầu thảo luận!</div>
              ) : (
                comments.map(c => (
                  <div key={c.commentId} className="flex gap-3">
                    <Avatar name={c.authorName} className="h-8 w-8 text-xs font-bold" />
                    <div className="bg-gray-100 p-3 rounded-lg rounded-tl-none text-sm max-w-[85%]">
                      <div className="flex justify-between items-end mb-1">
                        <span className="font-bold text-gray-800 mr-4">{c.authorName}</span>
                        <span className="text-[10px] text-gray-500 flex items-center"><Clock className="w-3 h-3 mr-1"/>{new Date(c.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{c.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t bg-white flex gap-2">
              <Input 
                value={newComment} 
                onChange={e => setNewComment(e.target.value)} 
                placeholder="Nhập bình luận của bạn..." 
                onKeyPress={e => e.key === 'Enter' && handlePostComment()}
              />
              <Button onClick={handlePostComment} className="bg-blue-600 hover:bg-blue-700"><Send className="h-4 w-4"/></Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}