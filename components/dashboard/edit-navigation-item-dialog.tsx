"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getSupabaseBrowser } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { BaseDialog } from "@/components/dashboard/base/dialog";
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
import type { NavigationItem } from "@/types/supabase";
import { DynamicIcon } from "@/components/dynamic-icon";

const navigationItemFormSchema = z.object({
  label: z.string().min(1, "Label is required"),
  href: z.string().min(1, "Link is required").url("Must be a valid URL"),
  icon: z.string().min(1, "Icon is required"),
  color: z.string().min(1, "Color is required"),
  order_index: z.coerce
    .number()
    .int()
    .min(0, "Order must be a positive number"),
  is_fixed: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

type NavigationItemFormValues = z.infer<typeof navigationItemFormSchema>;

interface EditNavigationItemDialogProps {
  item: NavigationItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onItemUpdated: () => void;
}

export function EditNavigationItemDialog({
  item,
  open,
  onOpenChange,
  onItemUpdated,
}: EditNavigationItemDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = getSupabaseBrowser();

  const form = useForm<NavigationItemFormValues>({
    resolver: zodResolver(navigationItemFormSchema),
    defaultValues: {
      label: item.label,
      href: item.href,
      icon: item.icon,
      color: item.color,
      order_index: item.order_index,
      is_fixed: item.is_fixed,
      is_active: item.is_active,
    },
  });

  const onSubmit = async (values: NavigationItemFormValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("navigation_items")
        .update({
          ...values,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id);

      if (error) throw error;

      toast.success("Navigation item updated successfully");
      onOpenChange(false);
      onItemUpdated();
    } catch (error) {
      console.error("Error updating navigation item:", error);
      toast.error("Failed to update navigation item");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Navigation Item"
      description={`Edit the navigation item "${item.label}"`}
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
            type="submit"
            form="edit-navigation-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Navigation Item"
            )}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form
          id="edit-navigation-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="icon"
            render={({ field: iconField }) => (
              <FormItem>
                <FormLabel className="text-foreground">Icon</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <Input
                      placeholder="Enter icon name (e.g. House)"
                      {...iconField}
                      className="bg-background text-foreground border-input"
                    />
                    {(iconField.value || form.watch("label")) && (
                      <div className="p-3 rounded-lg border border-input bg-background">
                        <div className="text-sm font-medium mb-2">
                          Icon Preview:
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded bg-[#16213e]">
                          {iconField.value && (
                            <DynamicIcon
                              name={iconField.value}
                              className="h-5 w-5"
                              color={form.watch("color")}
                            />
                          )}
                          <span className="text-sm text-white">
                            {form.watch("label") || "Menu Item"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="label"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Label</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter menu label"
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
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Color</FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        {...field}
                        className="w-12 h-10 p-1 bg-background border-input"
                        onChange={(e) => {
                          if (!e.target.value.startsWith("text-")) {
                            field.onChange(e.target.value);
                          }
                        }}
                      />
                      <Input
                        placeholder="#000000 or text-blue-400"
                        {...field}
                        className="bg-background text-foreground border-input"
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Enter a hex color (e.g. #000000) or a Tailwind class (e.g.
                      text-blue-400)
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="href"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Link</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter menu link (e.g. /games)"
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
            name="order_index"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Order</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    placeholder="Enter display order"
                    {...field}
                    className="bg-background text-foreground border-input"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="is_fixed"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-foreground">
                    Fixed Position
                  </FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-foreground">Active</FormLabel>
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </BaseDialog>
  );
}
