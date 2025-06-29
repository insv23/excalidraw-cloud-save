import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface EditableDescriptionProps {
  value?: string;
  onSave: (newValue: string) => void;
  className?: string;
  placeholder?: string;
}

export function EditableDescription({ 
  value = "", 
  onSave, 
  className, 
  placeholder = "Add a description..." 
}: EditableDescriptionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
      // Auto-resize textarea to fit content
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmedValue = editValue.trim();
    if (trimmedValue !== value) {
      onSave(trimmedValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    } else if (e.key === "Enter" && e.metaKey) {
      // Cmd/Ctrl + Enter to save
      e.preventDefault();
      handleSave();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditValue(e.target.value);
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  if (isEditing) {
    return (
      <div className="relative w-full">
        <textarea
          ref={textareaRef}
          value={editValue}
          onChange={handleInput}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className={cn(
            "bg-transparent outline-none border-0 focus:outline-none focus:ring-0",
            "resize-none w-full px-2 py-0.5 rounded",
            "min-h-[1.5rem] max-h-[4.5rem] overflow-y-auto",
            className
          )}
          rows={1}
        />
        <div className="absolute -bottom-5 left-0 text-[10px] text-muted-foreground">
          Press Cmd+Enter to save, Esc to cancel
        </div>
      </div>
    );
  }

  return (
    <div
      onDoubleClick={() => setIsEditing(true)}
      className={cn(
        "cursor-text select-none rounded px-2 py-0.5 hover:bg-accent/50 transition-colors",
        "line-clamp-2 min-h-[1.5rem]",
        !value && "text-muted-foreground/60 italic",
        className
      )}
      title={value || placeholder}
    >
      {value || placeholder}
    </div>
  );
}