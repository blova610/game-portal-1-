"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BaseDialog } from "@/components/dashboard/base/dialog";
import { useBaseCrud } from "@/components/dashboard/base/crud";
import type { Game } from "@/types/supabase";

interface DeleteGameDialogProps {
  game: Game | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGameDeleted: () => void;
}

export function DeleteGameDialog({
  game,
  open,
  onOpenChange,
  onGameDeleted,
}: DeleteGameDialogProps) {
  const { remove, isLoading } = useBaseCrud<Game>({
    tableName: "games",
    onSuccess: () => {
      onOpenChange(false);
      onGameDeleted();
    },
  });

  const handleDelete = async () => {
    if (!game) return;
    await remove(game.id);
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Game"
      description={`Are you sure you want to delete "${game?.title}"? This action cannot be undone.`}
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
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </div>
      }
    >
      <div className="py-4">
        <p className="text-sm text-muted-foreground">
          This will permanently delete the game and all its associated data.
          This action cannot be undone.
        </p>
      </div>
    </BaseDialog>
  );
}

export default DeleteGameDialog;
