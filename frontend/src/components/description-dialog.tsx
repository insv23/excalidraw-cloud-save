import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DescriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  value?: string;
  onSave: (description: string) => void;
}

export function DescriptionDialog({
  open,
  onOpenChange,
  title,
  value = "",
  onSave,
}: DescriptionDialogProps) {
  const [description, setDescription] = useState(value || "");
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  useEffect(() => {
    setDescription(value || "");
  }, [value]);

  const handleSave = () => {
    onSave(description.trim());
    onOpenChange(false);
  };

  const handleCancel = () => {
    setDescription(value || "");
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]" aria-describedby="dialog-description">
        <DialogHeader>
          <DialogTitle>Edit Description for "{title}"</DialogTitle>
          <p id="dialog-description" className="sr-only">
            Edit the description for your drawing. Press Save to confirm changes or Cancel to discard.
          </p>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            value={description || ""}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a description for this drawing..."
            className="min-h-[200px] resize-none"
            autoFocus
            aria-label="Drawing description"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleSave}>Save</Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isMac ? '⌘ ' : 'Ctrl+'}Enter</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}