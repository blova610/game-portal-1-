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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  homepageConfigFormSchema,
  type HomepageConfigFormValues,
} from "@/components/dashboard/homepage-config-schema";

interface AddHomepageConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfigAdded: () => void;
}

export function AddHomepageConfigDialog({
  open,
  onOpenChange,
  onConfigAdded,
}: AddHomepageConfigDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = getSupabaseBrowser();

  const form = useForm<HomepageConfigFormValues>({
    resolver: zodResolver(homepageConfigFormSchema),
    defaultValues: {
      key: "",
      value: "",
    },
  });

  const onSubmit = async (values: HomepageConfigFormValues) => {
    setIsSubmitting(true);
    try {
      let parsedValue = values.value;
      try {
        // Try to parse as JSON if it's not a simple string
        parsedValue = JSON.parse(values.value);
      } catch {
        // If parsing fails, use the value as is
        parsedValue = values.value;
      }

      const { error } = await supabase.from("homepage_config").insert({
        key: values.key.trim(),
        value: parsedValue,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast.success("Configuration added successfully");
      form.reset();
      onOpenChange(false);
      onConfigAdded();
    } catch (error) {
      console.error("Error adding configuration:", error);
      toast.error("Failed to add configuration");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background text-foreground">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Add Configuration
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Key</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter configuration key"
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
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Value</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter value (can be JSON or plain text)"
                      className="min-h-[200px] font-mono bg-background text-foreground border-input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
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
                  "Add Configuration"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
