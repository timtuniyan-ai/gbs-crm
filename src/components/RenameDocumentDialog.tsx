import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface RenameDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRename: (newName: string) => void;
  currentName: string;
}

export function RenameDocumentDialog({
  open,
  onOpenChange,
  onRename,
  currentName,
}: RenameDocumentDialogProps) {
  const [newName, setNewName] = useState(currentName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setNewName(currentName);
      // Выделяем весь текст после открытия
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.select();
        }
      }, 100);
    }
  }, [open, currentName]);

  const handleRename = () => {
    if (newName.trim() && newName !== currentName) {
      onRename(newName.trim());
      onOpenChange(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>Rename Document</DialogTitle>
          <DialogDescription>
            Enter a new name for the document
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Document Name</Label>
            <Input
              ref={inputRef}
              id="name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter document name"
              autoFocus
              className="selection:bg-blue-500 selection:text-white"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleRename}
            disabled={!newName.trim() || newName === currentName}
          >
            Rename
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

