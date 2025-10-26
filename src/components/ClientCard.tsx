import { Card, CardContent } from "./ui/card";
import { Client, Task } from "../types";
import { Building2, User, CheckCircle2, AlertCircle, Mail, Phone, MoreVertical, Archive, ArchiveRestore, GripVertical } from "lucide-react";
import { Badge } from "./ui/badge";
import { formatDateTimeCompact } from "../utils/dateUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useDrag } from "react-dnd";

interface ClientCardProps {
  client: Client;
  onClick: () => void;
  onTaskBadgeClick?: () => void;
  onToggleArchive?: (clientId: string) => void;
  tasks?: Task[];
}

export function ClientCard({ client, onClick, onTaskBadgeClick, onToggleArchive, tasks = [] }: ClientCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'CLIENT_CARD',
    item: { clientId: client.id, isArchived: !!client.archived },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: () => true,
  }), [client.id, client.archived]);

  const handleClick = (e: React.MouseEvent) => {
    // Prevent click if dragging just finished
    if (isDragging) {
      e.preventDefault();
      return;
    }
    onClick();
  };
  // Filter tasks for this client
  const clientTasks = tasks.filter(task => task.clientId === client.id);
  const inProgressTasks = clientTasks.filter(task => task.status === "in-progress");
  
  // Check if any tasks are due today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tasksDueToday = inProgressTasks.filter(task => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime();
  });

  return (
    <div ref={drag} style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
      <Card 
        className={`group hover:shadow-md transition-all duration-200 border border-gray-200 bg-white overflow-hidden ${
          isDragging ? 'opacity-50 scale-95' : ''
        }`}
        onClick={handleClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="flex items-center gap-1.5">
                  <GripVertical className="w-4 h-4 text-gray-400 cursor-grab active:cursor-grabbing" />
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-gray-900 truncate">
                  {client.firstName} {client.lastName}
                </h3>
                <p className="text-gray-500 text-xs">
                  {formatDateTimeCompact(client.createdAt)}
                </p>
              </div>
              {onToggleArchive && (
                <DropdownMenu>
                  <DropdownMenuTrigger 
                    onClick={(e) => e.stopPropagation()}
                    className="h-8 w-8 p-0 hover:bg-gray-100 rounded-md inline-flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleArchive(client.id);
                      }}
                      className="cursor-pointer"
                    >
                      {client.archived ? (
                        <>
                          <ArchiveRestore className="w-4 h-4 mr-2" />
                          Unarchive
                        </>
                      ) : (
                        <>
                          <Archive className="w-4 h-4 mr-2" />
                          Archive
                        </>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            
            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2 text-gray-700 bg-gray-50 rounded-lg p-2 text-sm">
                <Building2 className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                <span className="truncate">{client.businessName}</span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-600 text-xs">
                <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="truncate">{client.email}</span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-600 text-xs">
                <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="truncate">{client.phone}</span>
              </div>
            </div>
            
            {/* Task information */}
            {clientTasks.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200 flex flex-wrap gap-1.5">
                {inProgressTasks.length > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 flex items-center gap-1 cursor-pointer transition-colors px-2 py-0.5 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTaskBadgeClick?.();
                    }}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{inProgressTasks.length} in progress</span>
                  </Badge>
                )}
                {tasksDueToday.length > 0 && (
                  <Badge 
                    className="bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 flex items-center gap-1 cursor-pointer transition-colors px-2 py-0.5 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTaskBadgeClick?.();
                    }}
                  >
                    <AlertCircle className="w-3 h-3" />
                    <span>{tasksDueToday.length} due today</span>
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}
