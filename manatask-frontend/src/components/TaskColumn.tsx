import { Droppable, Draggable } from "@hello-pangea/dnd";
import { TaskCard } from "./TaskCard";
import { Edit2, Trash2 } from "lucide-react";
import { Button } from "./ui/button";

interface TaskColumnProps {
  statusId: number;
  title: string;
  tasks: any[];
  index: number; // Thêm index để xác định vị trí cột
  onTaskClick: (task: any) => void;
  onEditColumn: (id: number, currentTitle: string) => void;
  onDeleteColumn: (id: number) => void;
}

export function TaskColumn({ statusId, title, tasks, index, onTaskClick, onEditColumn, onDeleteColumn }: TaskColumnProps) {
  return (
    <Draggable draggableId={`col-${statusId}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`bg-gray-100/80 border border-gray-200 rounded-xl p-4 w-80 flex-shrink-0 flex flex-col h-full max-h-[calc(100vh-140px)] transition-all ${
            snapshot.isDragging ? 'shadow-2xl scale-105 rotate-2 z-50 opacity-90' : ''
          }`}
        >
          {/* Khu vực cầm nắm để kéo cột (...provided.dragHandleProps) */}
          <div 
            {...provided.dragHandleProps}
            className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200 hover:bg-gray-200/50 rounded-t-lg transition-colors p-1 -mx-1 px-1 cursor-grab active:cursor-grabbing"
          >
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-800 tracking-tight">{title}</h3>
              <span className="bg-white border border-gray-200 text-gray-700 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                {tasks.length}
              </span>
            </div>
            
            {/* 2 Nút Sửa / Xóa */}
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-blue-600 hover:bg-blue-50" onClick={(e: any) => { e.stopPropagation(); onEditColumn(statusId, title); }}>
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-600 hover:bg-red-50" onClick={(e: any) => { e.stopPropagation(); onDeleteColumn(statusId); }}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Vùng thả thẻ công việc (Type="TASK" để không bị lẫn với cột) */}
          <Droppable droppableId={statusId.toString()} type="TASK">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex-1 overflow-y-auto min-h-[150px] transition-colors rounded-lg p-1 -mx-1 ${
                  snapshot.isDraggingOver ? 'bg-blue-100/50 outline-dashed outline-2 outline-blue-300' : ''
                }`}
              >
                {tasks.map((task: any, index: number) => (
                  <TaskCard key={task.taskId} task={task} index={index} onClick={onTaskClick} />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      )}
    </Draggable>
  );
}