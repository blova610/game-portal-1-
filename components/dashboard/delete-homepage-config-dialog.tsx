"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { BaseDialog } from "@/components/dashboard/base/dialog";
import { toast } from "sonner";
import type { HomepageConfig } from "@/types/supabase";

interface DeleteHomepageConfigDialogProps {
  config: HomepageConfig | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfigDeleted: () => void;
}

export function DeleteHomepageConfigDialog({
  config,
  open,
  onOpenChange,
  onConfigDeleted,
}: DeleteHomepageConfigDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const supabase = getSupabaseBrowser();

  const handleDelete = async () => {
    if (!config) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("homepage_config")
        .delete()
        .eq("id", config.id);

      if (error) throw error;

      toast.success("Configuration deleted successfully");
      onOpenChange(false);
      onConfigDeleted();
    } catch (error) {
      console.error("Error deleting configuration:", error);
      toast.error("Failed to delete configuration");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Configuration"
      description={`Are you sure you want to delete the configuration with key "${config?.key}"? This action cannot be undone.`}
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
              "Delete Configuration"
            )}
          </Button>
        </div>
      }
    >
      <div className="py-4">
        <p className="text-sm text-muted-foreground">
          This will permanently delete the configuration and all its associated
          data. This action cannot be undone.
        </p>
        {config && (
          <div className="mt-4 space-y-2">
            <div className="text-sm">
              <p className="font-medium">Key:</p>
              <p className="text-muted-foreground">{config.key}</p>
            </div>
            <div className="text-sm">
              <p className="font-medium">Value:</p>
              <p className="text-muted-foreground break-all">
                {typeof config.value === "string"
                  ? config.value
                  : JSON.stringify(config.value, null, 2)}
              </p>
            </div>
          </div>
        )}
      </div>
    </BaseDialog>
  );
}
