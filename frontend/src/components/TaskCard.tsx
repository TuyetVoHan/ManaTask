import { Draggable } from "@hello-pangea/dnd";
import { Card, CardContent } from "./ui/card";
import { Clock } from "lucide-react";

interface TaskCardProps {
  task: any;
  index: number;
  onClick: (task: any) => void;
}

export function TaskCard({ task, index, onClick }: TaskCardProps) {
  return (
    <Draggable draggableId={task.taskId.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task)}
          className="mb-3 outline-none"
        >
          <Card 
            className={`cursor-pointer transition-all border-gray-200 hover:border-blue-400 ${
              snapshot.isDragging ? 'bg-blue-50 border-blue-500 shadow-lg scale-105 rotate-2' : 'bg-white shadow-sm'
            }`}
          >
            <CardContent className="p-3">
              <p className="font-semibold text-sm text-gray-800 mb-3 leading-tight">
                {task.taskTitle}
              </p>
              
              <div className="flex justify-between items-center text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  {task.deadline && (
                    <span className="flex items-center text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(task.deadline).toLocaleDateString('vi-VN')}
                    </span>
                  )}
                </div>
                
                {task.storyPoint > 0 && (
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold shadow-sm">
                    {task.storyPoint}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
}