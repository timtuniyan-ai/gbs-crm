import { useState } from "react";
import { GlobalNote } from "../types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";
import { X, Plus, Edit2, Trash2, StickyNote, Check } from "lucide-react";
import { toast } from "sonner";

interface GlobalNotesPanelProps {
  notes: GlobalNote[];
  onAddNote: (title: string, content: string) => Promise<void>;
  onUpdateNote: (id: string, title: string, content: string) => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;
  onClose: () => void;
}

export function GlobalNotesPanel({
  notes,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onClose,
}: GlobalNotesPanelProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in both title and content");
      return;
    }

    try {
      if (editingId) {
        await onUpdateNote(editingId, title, content);
        toast.success("Note updated");
      } else {
        await onAddNote(title, content);
        toast.success("Note added");
      }
      resetForm();
    } catch (error) {
      toast.error("Error saving note");
    }
  };

  const handleEdit = (note: GlobalNote) => {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await onDeleteNote(id);
      toast.success("Note deleted");
    } catch (error) {
      toast.error("Error deleting note");
    }
  };

  const handleCopyContent = async (note: GlobalNote) => {
    try {
      await navigator.clipboard.writeText(note.content);
      toast.success("Content copied to clipboard");
      onClose();
    } catch (error) {
      toast.error("Error copying content");
    }
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setTitle("");
    setContent("");
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <StickyNote className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-gray-900">Global Notes</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Add Note Button */}
      {!isAdding && (
        <div className="p-4 border-b border-gray-200">
          <Button
            onClick={() => setIsAdding(true)}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Note
          </Button>
        </div>
      )}

      {/* Add/Edit Form */}
      {isAdding && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Note Title
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title..."
                className="h-9"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Note Content
              </label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter content..."
                rows={4}
                className="resize-none"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                size="sm"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Check className="w-4 h-4 mr-2" />
                {editingId ? "Save" : "Add"}
              </Button>
              <Button
                onClick={resetForm}
                size="sm"
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Notes List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {notes.length === 0 ? (
            <div className="text-center py-8">
              <StickyNote className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No notes yet</p>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleCopyContent(note)}
                    className="flex-1 text-left font-medium text-gray-900 hover:text-blue-600 transition-colors text-sm"
                  >
                    {note.title}
                  </button>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(note)}
                      className="h-7 w-7 p-0 hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(note.id)}
                      className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

