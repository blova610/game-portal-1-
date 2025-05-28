"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { BaseDialog } from "@/components/dashboard/base/dialog";
import { toast } from "sonner";
import type { UserWithEmail } from "@/types/supabase";

interface DeleteUserDialogProps {
  user: UserWithEmail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserDeleted: () => void;
}

export function DeleteUserDialog({
  user,
  open,
  onOpenChange,
  onUserDeleted,
}: DeleteUserDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const supabase = getSupabaseBrowser();

  const handleDelete = async () => {
    if (!user) return;

    setIsDeleting(true);
    try {
      // Delete the auth user (this will cascade delete the profile)
      const { error: authError } = await supabase.auth.admin.deleteUser(
        user.id
      );

      if (authError) throw authError;

      toast.success("User deleted successfully");
      onOpenChange(false);
      onUserDeleted();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete User"
      description={`Are you sure you want to delete the user "${
        user?.username || user?.email
      }"? This action cannot be undone.`}
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
              "Delete User"
            )}
          </Button>
        </div>
      }
    >
      <div className="py-4">
        <p className="text-sm text-muted-foreground">
          This will permanently delete the user and all their associated data.
          This action cannot be undone.
        </p>
        {user && (
          <div className="mt-4 space-y-2">
            <div className="text-sm">
              <p className="font-medium">Username:</p>
              <p className="text-muted-foreground">
                {user.username || "No username"}
              </p>
            </div>
            <div className="text-sm">
              <p className="font-medium">Email:</p>
              <p className="text-muted-foreground">
                {user.email || "No email"}
              </p>
            </div>
            <div className="text-sm">
              <p className="font-medium">Role:</p>
              <p className="text-muted-foreground">
                {user.is_admin ? "Admin" : "Regular User"}
              </p>
            </div>
          </div>
        )}
      </div>
    </BaseDialog>
  );
}
