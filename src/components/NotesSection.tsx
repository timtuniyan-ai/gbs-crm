import { useState, useMemo } from "react";
import { Note } from "../types";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card, CardContent } from "./ui/card";
import { Pencil, Trash2, Check, X, StickyNote } from "lucide-react";
import { formatDateTimeCompact } from "../utils/dateUtils";

interface NotesSectionProps {
  notes: Note[];
  onAddNote: (content: string) => void;
  onUpdateNote: (noteId: string, content: string) => void;
  onDeleteNote: (noteId: string) => void;
}

export function NotesSection({ notes, onAddNote, onUpdateNote, onDeleteNote }: NotesSectionProps) {
  const [newNoteContent, setNewNoteContent] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  // Sort notes: newest first
  const sortedNotes = useMemo(() => {
    return [...notes].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [notes]);

  const handleAddNote = () => {
    if (newNoteContent.trim()) {
      onAddNote(newNoteContent);
      setNewNoteContent("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddNote();
    }
  };

  const startEditing = (note: Note) => {
    setEditingNoteId(note.id);
    setEditContent(note.content);
  };

  const saveEdit = (noteId: string) => {
    if (editContent.trim()) {
      onUpdateNote(noteId, editContent);
      setEditingNoteId(null);
      setEditContent("");
    }
  };

  const cancelEdit = () => {
    setEditingNoteId(null);
    setEditContent("");
  };

  // Используем утилиты для правильного форматирования дат

  return (
    <div className="space-y-4">
      <div className="space-y-3 bg-white p-4 rounded-lg border border-gray-200">
        <Textarea
          placeholder="Add a new note..."
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
          className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        />
        <Button 
          onClick={handleAddNote} 
          disabled={!newNoteContent.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <StickyNote className="w-4 h-4 mr-2" />
          Add Note
        </Button>
      </div>

      <div className="space-y-3">
        {notes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <StickyNote className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">No notes yet</p>
            <p className="text-sm text-gray-400 mt-1">Start by adding your first note</p>
          </div>
        ) : (
          sortedNotes.map((note) => (
            <Card key={note.id} className="border border-gray-200 hover:border-gray-300 transition-colors">
              <CardContent className="p-4">
                {editingNoteId === note.id ? (
                  <div className="space-y-3">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                      className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => saveEdit(note.id)}
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
                ) : (
                  <>
                    <p className="text-gray-700 mb-3 whitespace-pre-wrap leading-relaxed">{note.content}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <div className="text-xs space-y-1">
                        <div className="text-gray-500">
                          Created: {formatDateTimeCompact(note.createdAt)}
                        </div>
                        {note.updatedAt && (
                          <div className="text-orange-600 flex items-center gap-1">
                            <span className="inline-block w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                            Updated: {formatDateTimeCompact(note.updatedAt)}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditing(note)}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDeleteNote(note.id)}
                          className="hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
