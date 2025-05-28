"use client";

import type React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/components/ui/use-toast";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { ThemeProvider } from "@/components/theme-provider";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, profile, isLoading, signOut } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }

    if (!isLoading && profile && !profile.is_admin) {
      router.push("/");
      toast({
        title: "Access Denied",
        description: "You do not have permission to access the dashboard.",
        variant: "destructive",
      });
    }
  }, [user, profile, isLoading, router, toast]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || (profile && !profile.is_admin)) {
    return null;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="flex h-screen bg-[#0f0f23] text-white">
        {/* Sidebar */}
        <div className="relative z-10">
          <DashboardSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto relative z-0">
          <div className="container mx-auto px-4 py-6 md:px-6 lg:px-8">
            <div className="relative">{children}</div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
