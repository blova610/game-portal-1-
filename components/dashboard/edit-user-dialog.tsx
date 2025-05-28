"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { Profile } from "@/types/supabase";
import { z } from "zod";
import { getSupabaseBrowser } from "@/lib/supabase";

const editUserFormSchema = z.object({
  is_admin: z.boolean(),
});
type EditUserFormValues = z.infer<typeof editUserFormSchema>;

interface EditUserDialogProps {
  user: Profile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated: () => void;
}

export function EditUserDialog({
  user,
  open,
  onOpenChange,
  onUserUpdated,
}: EditUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = getSupabaseBrowser();
  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserFormSchema),
    defaultValues: {
      is_admin: user.is_admin,
    },
  });

  const onSubmit = async (values: EditUserFormValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_admin: values.is_admin,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("User updated successfully");
      onOpenChange(false);
      onUserUpdated();
    } catch (error: any) {
      toast.error(error.message || "Failed to update user");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background text-foreground max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Edit Admin Status
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="is_admin"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Admin Access</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Grant or revoke admin privileges for this user
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
