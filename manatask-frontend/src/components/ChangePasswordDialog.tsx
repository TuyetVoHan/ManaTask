import { useState } from "react";
import api from "../services/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface ChangePasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordDialog({ isOpen, onClose }: ChangePasswordDialogProps) {
  const [passwords, setPasswords] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Kiểm tra khớp mật khẩu
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert("Mật khẩu mới và Nhập lại mật khẩu không khớp!");
      return;
    }

    setIsLoading(true);
    try {
      await api.put("/users/me/password", {
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword
      });
      alert("🎉 Đổi mật khẩu thành công!");
      
      // Reset form và đóng popup
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
      onClose();
    } catch (error: any) {
      alert("Lỗi: " + (error.response?.data?.detail || "Mật khẩu cũ không đúng"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">🔑 Đổi mật khẩu</DialogTitle>
          <DialogDescription>
            Vui lòng nhập mật khẩu cũ để xác thực trước khi đổi sang mật khẩu mới.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Mật khẩu cũ <span className="text-red-500">*</span></Label>
            <Input type="password" required value={passwords.oldPassword} onChange={e => setPasswords({...passwords, oldPassword: e.target.value})} />
          </div>
          
          <div className="space-y-2">
            <Label>Mật khẩu mới <span className="text-red-500">*</span></Label>
            <Input type="password" required value={passwords.newPassword} onChange={e => setPasswords({...passwords, newPassword: e.target.value})} />
          </div>

          <div className="space-y-2">
            <Label>Nhập lại mật khẩu mới <span className="text-red-500">*</span></Label>
            <Input type="password" required value={passwords.confirmPassword} onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})} />
          </div>

          <DialogFooter className="pt-4 border-t mt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Hủy</Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">Xác nhận đổi</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}