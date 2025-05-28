"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import type { Advertisement } from "@/types/supabase";
import { AD_POSITIONS } from "@/constants/advertisement-constants";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  image_url: z.string().min(1, "Image URL is required"),
  link_url: z.string().min(1, "Link URL is required"),
  position: z.string().min(1, "Position is required"),
  code: z.string().optional(),
  is_active: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

export interface AddAdvertisementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdAdded: () => void;
}

export function AddAdvertisementDialog({
  open,
  onOpenChange,
  onAdAdded,
}: AddAdvertisementDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = getSupabaseBrowser();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      image_url: "",
      link_url: "",
      position: "",
      code: "",
      is_active: true,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("advertisements").insert([values]);

      if (error) throw error;

      toast.success("Advertisement added successfully");
      form.reset();
      onOpenChange(false);
      onAdAdded();
    } catch (error) {
      console.error("Error adding advertisement:", error);
      toast.error("Failed to add advertisement");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background text-foreground">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Add Advertisement
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter advertisement title"
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
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Image URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter image URL"
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
              name="link_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Link URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter link URL"
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
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Position</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter ad position (e.g. sidebar, header, ...)"
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
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">
                    Ad Code (HTML/JS)
                  </FormLabel>
                  <FormControl>
                    <textarea
                      placeholder="Paste ad code here (optional)"
                      {...field}
                      className="bg-background text-foreground border-input rounded w-full min-h-[80px] p-2 font-mono text-xs"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-input p-4 bg-background">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base text-foreground">
                      Active
                    </FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Set whether this advertisement is active or not.
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
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Advertisement"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default AddAdvertisementDialog;
