"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { BaseDialog } from "@/components/dashboard/base/dialog";
import { toast } from "sonner";
import type { NavigationItem } from "@/types/supabase";

interface DeleteNavigationItemDialogProps {
  item: NavigationItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onItemDeleted: () => void;
}

export function DeleteNavigationItemDialog({
  item,
  open,
  onOpenChange,
  onItemDeleted,
}: DeleteNavigationItemDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const supabase = getSupabaseBrowser();

  const handleDelete = async () => {
    if (!item) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("navigation_items")
        .delete()
        .eq("id", item.id);

      if (error) throw error;

      toast.success("Navigation item deleted successfully");
      onOpenChange(false);
      onItemDeleted();
    } catch (error) {
      console.error("Error deleting navigation item:", error);
      toast.error("Failed to delete navigation item");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!item) {
    return null;
  }

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Navigation Item"
      description="Are you sure you want to delete this navigation item? This action cannot be undone."
      footer={
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Navigation Item"
            )}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <h4 className="font-medium text-destructive mb-2">Warning</h4>
          <p className="text-sm text-destructive/90">
            You are about to delete the navigation item "{item.label}". This
            will remove it from the menu and cannot be undone.
          </p>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">Label:</span>
            <span className="text-muted-foreground">{item.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">Link:</span>
            <span className="text-muted-foreground">{item.href}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">Icon:</span>
            <span className="text-muted-foreground">{item.icon}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">Status:</span>
            <span className="text-muted-foreground">
              {item.is_active ? "Active" : "Inactive"}
              {item.is_fixed ? " (Fixed Position)" : ""}
            </span>
          </div>
        </div>
      </div>
    </BaseDialog>
  );
}
