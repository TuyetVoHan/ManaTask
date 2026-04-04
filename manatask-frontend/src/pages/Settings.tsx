import { useState } from "react";
import { Header } from "../components/Header";
import { Profile } from "../components/Profile";
import { ChangePasswordDialog } from "../components/ChangePasswordDialog";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Lock, UserCircle } from "lucide-react";

export default function Settings() {
  const [isPassOpen, setIsPassOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="p-8 max-w-4xl mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Cài đặt tài khoản</h2>
          <p className="text-gray-500 font-medium">Quản lý thông tin cá nhân và bảo mật của bạn</p>
        </div>

        <div className="space-y-8">
          <section>
            <div className="flex items-center gap-2 mb-4 text-blue-600 font-bold uppercase tracking-wider text-xs">
              <UserCircle className="h-4 w-4" /> Thông tin cơ bản
            </div>
            <Profile />
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4 text-red-600 font-bold uppercase tracking-wider text-xs">
              <Lock className="h-4 w-4" /> Bảo mật
            </div>
            <Card className="border-0 shadow-sm overflow-hidden">
              <CardHeader className="bg-red-50/50">
                <CardTitle className="text-lg font-bold text-gray-800">Đổi mật khẩu</CardTitle>
                <CardDescription>Bạn nên sử dụng mật khẩu mạnh để bảo vệ tài khoản</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Button 
                  variant="destructive" 
                  className="font-bold shadow-md shadow-red-100"
                  onClick={() => setIsPassOpen(true)}
                >
                  Thay đổi mật khẩu ngay
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>

      <ChangePasswordDialog isOpen={isPassOpen} onClose={() => setIsPassOpen(false)} />
    </div>
  );
}