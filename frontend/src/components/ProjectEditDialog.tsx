import { useState, useEffect } from "react";
import api from "../services/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface ProjectEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  onSuccess: () => void;
}

export function ProjectEditDialog({ isOpen, onClose, project, onSuccess }: ProjectEditDialogProps) {
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Khi mở hộp thoại, điền sẵn tên dự án cũ vào ô input
  useEffect(() => {
    if (project) {
      setTitle(project.projectTitle);
    }
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !project) return;
    
    setIsLoading(true);
    try {
      await api.put(`/projects/${project.projectId}`, { projectTitle: title });
      onSuccess(); // Tải lại danh sách
      onClose();   // Đóng popup
    } catch (error: any) {
      alert("Lỗi: " + (error.response?.data?.detail || "Chỉ Leader mới có quyền sửa dự án này."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">✏️ Đổi tên dự án</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title" className="font-semibold text-gray-700">Tên dự án mới</Label>
              <Input 
                id="edit-title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Hủy</Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">Lưu thay đổi</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}