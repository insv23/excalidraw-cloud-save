import { Save, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SaveStatusProps {
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  onSave: () => void;
}

export function SaveStatus({ isSaving, hasUnsavedChanges, onSave }: SaveStatusProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onSave}
      disabled={isSaving || !hasUnsavedChanges}
      className={cn(
        "gap-2 transition-all",
        !hasUnsavedChanges && "text-muted-foreground"
      )}
    >
      {isSaving ? (
        <>
          <Save className="h-4 w-4 animate-pulse" />
          <span>Saving...</span>
        </>
      ) : hasUnsavedChanges ? (
        <>
          <Save className="h-4 w-4" />
          <span>Save</span>
        </>
      ) : (
        <>
          <Check className="h-4 w-4" />
          <span>Saved</span>
        </>
      )}
    </Button>
  );
}