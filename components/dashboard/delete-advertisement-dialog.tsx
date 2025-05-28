"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { BaseDialog } from "@/components/dashboard/base/dialog";
import { toast } from "sonner";
import type { Advertisement } from "@/types/supabase";

export interface DeleteAdvertisementDialogProps {
  advertisement: Advertisement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdDeleted: () => void;
}

export function DeleteAdvertisementDialog({
  advertisement,
  open,
  onOpenChange,
  onAdDeleted,
}: DeleteAdvertisementDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const supabase = getSupabaseBrowser();

  const handleDelete = async () => {
    if (!advertisement) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("advertisements")
        .delete()
        .eq("id", advertisement.id);

      if (error) throw error;

      toast.success("Advertisement deleted successfully");
      onOpenChange(false);
      onAdDeleted();
    } catch (error) {
      console.error("Error deleting advertisement:", error);
      toast.error("Failed to delete advertisement");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Advertisement"
      description={`Are you sure you want to delete "${advertisement?.title}"? This action cannot be undone.`}
      footer={
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Advertisement"
            )}
          </Button>
        </div>
      }
    >
      <div className="py-4">
        <p className="text-sm text-muted-foreground">
          This will permanently delete the advertisement and all its associated
          data. This action cannot be undone.
        </p>
      </div>
    </BaseDialog>
  );
}

export default DeleteAdvertisementDialog;
