import { useState } from "react";
import api from "../services/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface ProjectCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Hàm gọi ngược ra ngoài để load lại danh sách sau khi tạo xong
}

export function ProjectCreateDialog({ isOpen, onClose, onSuccess }: ProjectCreateDialogProps) {
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    setIsLoading(true);
    try {
      // Bắn API tạo Project
      await api.post("/projects/", { projectTitle: title });
      
      setTitle("");       // Reset ô nhập
      onSuccess();        // Load lại danh sách ngoài trang chủ
      onClose();          // Đóng popup
    } catch (error: any) {
      alert("Lỗi: " + (error.response?.data?.detail || "Không thể tạo dự án"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">✨ Tạo dự án mới</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="font-semibold text-gray-700">
                Tên dự án <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="VD: Đồ án tốt nghiệp môn Quản lý dự án..." 
                required
                autoFocus
                className="focus-visible:ring-blue-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 font-bold">
              {isLoading ? "Đang tạo..." : "Tạo dự án"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}