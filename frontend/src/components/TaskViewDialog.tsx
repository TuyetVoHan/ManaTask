import { useState, useEffect } from "react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Textarea } from "./ui/textarea";
import { Avatar } from "./ui/avatar";
import { 
  MessageSquare, 
  Info, 
  Send, 
  Clock, 
  Trash2,
  User
} from "lucide-react";
import api from "../services/api";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface TaskViewDialogProps {
  task: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  members: any[];
}

export function TaskViewDialog({ 
  task, 
  isOpen, 
  onClose, 
  onUpdate, 
  members
} : TaskViewDialogProps) {
  const [formData, setFormData] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (task && isOpen) {
      setFormData({ ...task });
      fetchComments();
    }
  }, [task, isOpen]);

  const fetchComments = async () => {
    try {
      const response = await api.get(`/tasks/${task.taskId}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy bình luận:", error);
    }
  };

  const handleUpdate = async () => {
    try {
      setIsLoading(true);
      // Gửi toàn bộ formData, bao gồm cả assigneeId có thể là null
      await api.put(`/tasks/${task.taskId}`, formData);
      onUpdate();
      onClose();
    } catch (error) {
      alert("Lỗi khi cập nhật công việc");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa công việc này không?")) return;
    try {
      setIsLoading(true);
      await api.delete(`/tasks/${task.taskId}`);
      onUpdate();
      onClose();
    } catch (error) {
      alert("Lỗi khi xóa công việc");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      await api.post(`/tasks/${task.taskId}/comments`, { 
        commentContent: newComment 
      });
      setNewComment("");
      fetchComments();
    } catch (error) {
      console.error("Lỗi gửi bình luận:", error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "";
    const utcString = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
    return format(new Date(utcString), "HH:mm - dd/MM", { locale: vi });
  };

  if (!formData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden gap-0">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
              TASK-{task.taskId}
            </span>
          </div>
          <DialogTitle className="text-xl font-bold text-gray-800">
            {formData.taskTitle}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="w-full justify-start px-6 bg-transparent border-b rounded-none h-12">
            <TabsTrigger value="details" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none bg-transparent">
              <Info className="w-4 h-4 mr-2" /> Chi tiết
            </TabsTrigger>
            <TabsTrigger value="comments" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none bg-transparent">
              <MessageSquare className="w-4 h-4 mr-2" /> Thảo luận ({comments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                {/* Ô NGƯỜI THỰC HIỆN - ĐÃ FIX LỖI LƯU NULL */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-gray-500">Người thực hiện</Label>
                  <select 
                    className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-blue-500"
                    value={formData.assigneeId || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      // Nếu chọn "", giá trị sẽ là null để gửi lên API xóa assignee
                      setFormData({...formData, assigneeId: val === "" ? null : parseInt(val)});
                    }}
                  >
                    <option value="">Chưa giao việc</option>
                    {members?.map(m => (
                      <option key={m.participantId} value={m.participantId}>{m.fullName}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-gray-500">Story Point</Label>
                  <Input 
                    type="number" 
                    min="0"
                    max="100"
                    value={formData.storyPoint || 0} 
                    onChange={e => {
                      let val = parseInt(e.target.value) || 0;
                      if (val < 0) val = 0;
                      if (val > 100) val = 100;
                      setFormData({...formData, storyPoint: val});
                    }}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-gray-500">Hạn chót</Label>
                  <Input 
                    type="date" 
                    value={formData.deadline || ""} 
                    onChange={e => setFormData({...formData, deadline: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-gray-500">Mô tả công việc</Label>
              <Textarea 
                className="min-h-[120px] resize-none"
                value={formData.description || ""}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Nhập chi tiết yêu cầu công việc..."
              />
            </div>

            <div className="pt-4 border-t flex justify-between items-center w-full mt-4">
              <Button 
                variant="outline" 
                onClick={handleDelete}
                disabled={isLoading}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Xóa Task
              </Button>

              <div className="flex gap-2">
                <Button variant="ghost" onClick={onClose}>Hủy</Button>
                <Button 
                  onClick={handleUpdate} 
                  className="bg-blue-600 hover:bg-blue-700 min-w-[100px]"
                  disabled={isLoading}
                >
                  {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comments" className="p-0 m-0 flex flex-col">
            <div className="h-[380px] overflow-y-auto p-4 space-y-4 bg-gray-50/50">
              {comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
                  <MessageSquare className="w-8 h-8 opacity-20" />
                  <p className="text-sm">Chưa có thảo luận nào cho task này</p>
                </div>
              ) : (
                comments.map((c, index) => (
                  <div key={index} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2">
                    <Avatar name={c.authorName} className="h-8 w-8 text-[10px] font-bold bg-blue-100 text-blue-700 flex items-center justify-center" />
                    <div className="flex-1">
                      <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-none shadow-sm">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-xs text-gray-900">{c.authorName}</span>
                          <span className="text-[10px] text-gray-400 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTime(c.createdAt)} 
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {c.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t bg-white flex gap-2">
              <Input 
                placeholder={isSubmittingComment ? "Đang gửi..." : "Viết bình luận..."}
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handlePostComment();
                  }
                }}
                disabled={isSubmittingComment}
                className="flex-1"
              />
              <Button 
                size="icon" 
                onClick={handlePostComment}
                disabled={!newComment.trim() || isSubmittingComment}
                className="bg-blue-600 hover:bg-blue-700 shrink-0"
              >
                <Send className="w-4 h-4 text-white" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}