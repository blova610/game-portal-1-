"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { getSupabaseBrowser, hasSupabaseConfig } from "@/lib/supabase";

interface BaseCrudProps<T> {
  tableName: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export function useBaseCrud<T extends { id?: string | number }>({
  tableName,
  onSuccess,
  onError,
}: BaseCrudProps<T>) {
  const { toast } = useToast();
  const { user, isAdmin, profile } = useAuth();
  const supabase = getSupabaseBrowser();
  const [isLoading, setIsLoading] = useState(false);

  const verifyAdminAccess = async () => {
    // Check Supabase client
    if (!supabase) {
      throw new Error("Database connection not available");
    }

    // Check if user is authenticated and is admin
    if (!user) {
      throw new Error(`You must be logged in to manage ${tableName}`);
    }

    // Debug logging
    console.log("Current user:", user.id);
    console.log("Is admin:", isAdmin);
    console.log("Profile:", profile);
    console.log("Supabase client available:", !!supabase);
    console.log("Supabase config valid:", hasSupabaseConfig);

    if (!isAdmin) {
      throw new Error(`You must be an admin to manage ${tableName}`);
    }

    // First verify the user's admin status directly
    const { data: adminCheck, error: adminError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    console.log("Admin status check:", { adminCheck, adminError });

    if (adminError) {
      console.error("Error checking admin status:", adminError);
      throw new Error("Failed to verify admin status");
    }

    if (!adminCheck?.is_admin) {
      throw new Error("Admin status verification failed");
    }
  };

  const create = async (data: Omit<T, "id">) => {
    setIsLoading(true);
    try {
      await verifyAdminAccess();

      console.log(`Attempting to create ${tableName}:`, data);

      const { data: result, error } = await supabase
        .from(tableName)
        .insert(data)
        .select()
        .single();

      console.log("Create response:", { result, error });

      if (error) {
        console.error("Database error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          status: error.status,
        });

        if (error.code === "42501") {
          throw new Error(
            `You don't have permission to create ${tableName}. Please verify your admin status.`
          );
        }
        throw error;
      }

      toast({
        title: "Success",
        description: `${tableName} created successfully`,
      });

      onSuccess?.();
      return result;
    } catch (error: any) {
      console.error(`Error creating ${tableName}:`, {
        error,
        message: error.message,
        stack: error.stack,
        code: error.code,
      });
      toast({
        title: "Error",
        description: error.message || `Failed to create ${tableName}`,
        variant: "destructive",
      });
      onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const update = async (id: string | number, data: Partial<T>) => {
    setIsLoading(true);
    try {
      await verifyAdminAccess();

      console.log(`Attempting to update ${tableName}:`, { id, data });

      const { data: result, error } = await supabase
        .from(tableName)
        .update(data)
        .eq("id", id)
        .select()
        .single();

      console.log("Update response:", { result, error });

      if (error) {
        console.error("Database error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          status: error.status,
        });

        if (error.code === "42501") {
          throw new Error(
            `You don't have permission to update ${tableName}. Please verify your admin status.`
          );
        }
        throw error;
      }

      toast({
        title: "Success",
        description: `${tableName} updated successfully`,
      });

      onSuccess?.();
      return result;
    } catch (error: any) {
      console.error(`Error updating ${tableName}:`, {
        error,
        message: error.message,
        stack: error.stack,
        code: error.code,
      });
      toast({
        title: "Error",
        description: error.message || `Failed to update ${tableName}`,
        variant: "destructive",
      });
      onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const remove = async (id: string | number) => {
    setIsLoading(true);
    try {
      await verifyAdminAccess();

      console.log(`Attempting to delete ${tableName}:`, id);

      const { error } = await supabase.from(tableName).delete().eq("id", id);

      console.log("Delete response:", { error });

      if (error) {
        console.error("Database error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          status: error.status,
        });

        if (error.code === "42501") {
          throw new Error(
            `You don't have permission to delete ${tableName}. Please verify your admin status.`
          );
        }
        throw error;
      }

      toast({
        title: "Success",
        description: `${tableName} deleted successfully`,
      });

      onSuccess?.();
    } catch (error: any) {
      console.error(`Error deleting ${tableName}:`, {
        error,
        message: error.message,
        stack: error.stack,
        code: error.code,
      });
      toast({
        title: "Error",
        description: error.message || `Failed to delete ${tableName}`,
        variant: "destructive",
      });
      onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    create,
    update,
    remove,
  };
}

export default useBaseCrud;
