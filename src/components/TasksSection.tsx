import { useState } from "react";
import { Task } from "../types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { Pencil, Trash2, Check, X, Calendar, Flag, ListTodo, CheckCircle2 } from "lucide-react";
import { formatDate, formatDateForInput, formatDateTimeCompact } from "../utils/dateUtils";
import { formatDateForInputNY, parseDateFromInputNY } from "../utils/timezoneUtils";

interface TasksSectionProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, "id" | "clientId" | "createdAt">) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
}

export function TasksSection({ tasks, onAddTask, onUpdateTask, onDeleteTask }: TasksSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskData, setNewTaskData] = useState({
    title: "",
    description: "",
    status: "in-progress" as Task["status"],
    priority: "medium" as Task["priority"],
    dueDate: "",
  });
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Task>>({});

  const handleAddTask = () => {
    if (newTaskData.title.trim()) {
      onAddTask({
        title: newTaskData.title,
        description: newTaskData.description || undefined,
        status: newTaskData.status,
        priority: newTaskData.priority,
        dueDate: newTaskData.dueDate ? parseDateFromInputNY(newTaskData.dueDate) : undefined,
      });
      setNewTaskData({
        title: "",
        description: "",
        status: "in-progress",
        priority: "medium",
        dueDate: "",
      });
      setIsAdding(false);
    }
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditData({
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
    });
  };

  const saveEdit = (taskId: string) => {
    if (editData.title?.trim()) {
      const updatedData = {
        ...editData,
        dueDate: editData.dueDate && typeof editData.dueDate === 'string' 
          ? parseDateFromInputNY(editData.dueDate) 
          : editData.dueDate
      };
      onUpdateTask(taskId, updatedData);
      setEditingTaskId(null);
      setEditData({});
    }
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditData({});
  };

  // Используем утилиты для правильного форматирования дат

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "in-progress": return "bg-blue-100 text-blue-700";
      case "completed": return "bg-green-100 text-green-700";
    }
  };

  const handleCompleteTask = (taskId: string) => {
    onUpdateTask(taskId, { status: "completed" });
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "low": return "text-gray-500";
      case "medium": return "text-amber-500";
      case "high": return "text-red-500";
    }
  };

  return (
    <div className="space-y-4">
      {!isAdding ? (
        <Button 
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          <ListTodo className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      ) : (
        <Card className="border border-gray-200 bg-white">
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">Title</Label>
              <Input
                id="task-title"
                placeholder="Task title..."
                value={newTaskData.title}
                onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                placeholder="Task description..."
                value={newTaskData.description}
                onChange={(e) => setNewTaskData({ ...newTaskData, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="task-status">Status</Label>
                <Select
                  value={newTaskData.status}
                  onValueChange={(value) => setNewTaskData({ ...newTaskData, status: value as Task["status"] })}
                >
                  <SelectTrigger id="task-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-priority">Priority</Label>
                <Select
                  value={newTaskData.priority}
                  onValueChange={(value) => setNewTaskData({ ...newTaskData, priority: value as Task["priority"] })}
                >
                  <SelectTrigger id="task-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-due-date">Due Date</Label>
              <Input
                id="task-due-date"
                type="date"
                value={newTaskData.dueDate}
                onChange={(e) => setNewTaskData({ ...newTaskData, dueDate: e.target.value })}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                onClick={handleAddTask} 
                disabled={!newTaskData.title.trim()}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <Check className="w-4 h-4 mr-2" />
                Add Task
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAdding(false);
                  setNewTaskData({
                    title: "",
                    description: "",
                    status: "in-progress",
                    priority: "medium",
                    dueDate: "",
                  });
                }}
                className="border-gray-300"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <ListTodo className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">No tasks yet</p>
            <p className="text-sm text-gray-400 mt-1">Start by adding your first task</p>
          </div>
        ) : (
          // Sort tasks: in-progress first, completed last
          [...tasks].sort((a, b) => {
            if (a.status === "completed" && b.status !== "completed") return 1;
            if (a.status !== "completed" && b.status === "completed") return -1;
            return 0;
          }).map((task) => (
            <Card 
              key={task.id}
              className={`${
                task.status === "completed" 
                  ? "bg-gray-50 border-gray-200" 
                  : "border border-gray-200 hover:border-gray-300"
              } transition-all duration-200`}
            >
              <CardContent className="p-4">
                {editingTaskId === task.id ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={editData.title || ""}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={editData.description || ""}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select
                          value={editData.status}
                          onValueChange={(value) => setEditData({ ...editData, status: value as Task["status"] })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Priority</Label>
                        <Select
                          value={editData.priority}
                          onValueChange={(value) => setEditData({ ...editData, priority: value as Task["priority"] })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Due Date</Label>
                      <Input
                        type="date"
                        value={editData.dueDate ? formatDateForInputNY(editData.dueDate) : ""}
                        onChange={(e) => setEditData({ ...editData, dueDate: e.target.value || undefined })}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => saveEdit(task.id)}
                        className="bg-green-600 hover:bg-green-700 transition-colors"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit} className="border-gray-300">
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : task.status === "completed" ? (
                  // Compact view for completed tasks
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="w-4 h-4 text-gray-400 shrink-0" />
                        <h4 className="text-gray-500 truncate">{task.title}</h4>
                        <Badge className="bg-gray-200 text-gray-600 hover:bg-gray-200 border-0">Completed</Badge>
                      </div>
                      <div className="flex flex-wrap gap-3 items-center text-xs text-gray-400 ml-6">
                        <div className="flex items-center gap-1">
                          <Flag className="w-3 h-3" />
                          <span className="capitalize">{task.priority}</span>
                        </div>
                        {task.dueDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(task.dueDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEditing(task)}
                        className="text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDeleteTask(task.id)}
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Full view for in-progress tasks
                  <>
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="text-gray-900 mb-2">{task.title}</h4>
                          {task.description && (
                            <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{task.description}</p>
                          )}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          {task.status === "in-progress" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCompleteTask(task.id)}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              title="Complete task"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEditing(task)}
                            className="hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDeleteTask(task.id)}
                            className="hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 items-center">
                        <Badge className="bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-100">
                          In Progress
                        </Badge>
                        <div className={`flex items-center gap-1.5 text-sm px-2.5 py-1 rounded-md ${
                          task.priority === "high" ? "bg-red-50 text-red-700" : 
                          task.priority === "medium" ? "bg-amber-50 text-amber-700" : 
                          "bg-gray-50 text-gray-600"
                        }`}>
                          <Flag className="w-3.5 h-3.5" />
                          <span className="capitalize">{task.priority}</span>
                        </div>
                        {task.dueDate && (
                          <div className="flex items-center gap-1.5 text-sm text-gray-700 bg-gray-50 px-2.5 py-1 rounded-md">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{formatDate(task.dueDate)}</span>
                          </div>
                        )}
                      </div>

                      <div className="text-xs space-y-1 pt-3 border-t border-gray-200">
                        <div className="text-gray-500">Created: {formatDateTimeCompact(task.createdAt)}</div>
                        {task.updatedAt && (
                          <div className="text-orange-600 flex items-center gap-1">
                            <span className="inline-block w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                            Updated: {formatDateTimeCompact(task.updatedAt)}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
