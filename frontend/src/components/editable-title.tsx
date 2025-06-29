import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface EditableTitleProps {
  value: string;
  onSave: (newValue: string) => void;
  className?: string;
  placeholder?: string;
}

export function EditableTitle({ value, onSave, className, placeholder = "Untitled" }: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmedValue = editValue.trim();
    if (trimmedValue !== value) {
      onSave(trimmedValue || placeholder);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={cn(
          "bg-transparent outline-none border-0 focus:outline-none focus:ring-0",
          "px-2 py-0.5 rounded",
          className
        )}
        style={{ 
          minWidth: "200px", 
          width: "100%",
          maxWidth: "400px" 
        }}
      />
    );
  }

  return (
    <div
      onDoubleClick={() => setIsEditing(true)}
      className={cn(
        "cursor-text select-none rounded px-2 py-0.5 hover:bg-accent/50 transition-colors",
        "truncate max-w-[400px]",
        className
      )}
      title={value || placeholder}
    >
      {value || placeholder}
    </div>
  );
}