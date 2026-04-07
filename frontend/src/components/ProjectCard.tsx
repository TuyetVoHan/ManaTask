import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Folder, CheckCircle, Calendar, Clock } from "lucide-react";

export function ProjectCard({ project, onClick }: any) {
  const isCompleted = project.isCompleted;

  return (
    <Card 
      // Logic màu sắc: NẾU HOÀN THÀNH thì mờ đi, NẾU CHƯA XONG thì nền trắng sáng
      className={`cursor-pointer transition-all duration-300 hover:shadow-xl border-gray-200 ${
        isCompleted 
          ? "opacity-60 bg-gray-50/80 grayscale-[0.5] hover:grayscale-0 hover:opacity-100" 
          : "bg-white"
      }`} 
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold truncate pr-2 text-gray-800">
            {project.projectTitle}
          </CardTitle>
          
          {/* Đổi nhãn Icon dựa vào trạng thái */}
          {isCompleted ? (
            <span className="flex items-center gap-1 text-[11px] font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-full whitespace-nowrap shadow-sm">
              <CheckCircle className="h-3.5 w-3.5" /> Đã xong
            </span>
          ) : (
            <div className="p-2 bg-blue-50 rounded-xl shadow-sm border border-blue-100">
              <Folder className="h-5 w-5 text-blue-600" />
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col gap-2 mt-2">
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="mr-2 h-4 w-4" />
            <span>Tạo ngày: {new Date(project.CreatedAt).toLocaleDateString('vi-VN')}</span>
          </div>
          {isCompleted && (
            <div className="flex items-center text-sm text-green-600 font-medium">
              <Clock className="mr-2 h-4 w-4" />
              <span>Dự án đã đóng</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}