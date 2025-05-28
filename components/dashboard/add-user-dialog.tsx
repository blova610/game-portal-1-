"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getSupabaseBrowser } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  userFormSchema,
  type UserFormValues,
} from "@/components/dashboard/user-schema";

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserAdded: () => void;
}

export function AddUserDialog({
  open,
  onOpenChange,
  onUserAdded,
}: AddUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = getSupabaseBrowser();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      is_admin: false,
    },
  });

  const onSubmit = async (values: UserFormValues) => {
    setIsSubmitting(true);
    try {
      // 1. Tạo user mới trong auth
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email: values.email,
          password: values.password || undefined,
          email_confirm: true,
        });
      if (authError) throw authError;

      // 2. Cập nhật profile (nếu cần) - tận dụng trigger đã tạo profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          username: values.username,
          is_admin: values.is_admin,
          updated_at: new Date().toISOString(),
        })
        .eq("id", authData.user.id);
      if (profileError) throw profileError;

      toast.success("User added successfully");
      form.reset();
      onOpenChange(false);
      onUserAdded();
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error("Failed to add user");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background text-foreground">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add User</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter user email"
                      {...field}
                      className="bg-background text-foreground border-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter username"
                      {...field}
                      className="bg-background text-foreground border-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter password"
                      {...field}
                      className="bg-background text-foreground border-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_admin"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Admin Access</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Grant this user admin privileges
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
                    Adding...
                  </>
                ) : (
                  "Add User"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
