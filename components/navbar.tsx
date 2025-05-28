"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn, User, LogOut, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import SearchNav from "@/components/search-nav";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const pathname = usePathname();
  const isAdmin = profile?.is_admin;

  // Don't show navbar on login/register pages
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#16213e] shadow-lg">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex h-16 items-center justify-between px-4">
          {/* Logo - Far Left */}
          <Link href="/" className="flex items-center">
            <div className="w-10 h-10 bg-[#7c3aed] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <div className="hidden sm:block ml-3">
              <span className="text-xl font-bold text-white">GamePortal</span>
            </div>
          </Link>

          {/* Search Bar - Center */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <SearchNav />
          </div>

          {/* User Menu - Far Right */}
          <div className="flex items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10"
                  >
                    <User className="h-5 w-5" />
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-[#0f172a] border-slate-700"
                >
                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile"
                      className="text-slate-300 hover:text-white"
                    >
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/favorites"
                      className="text-slate-300 hover:text-white"
                    >
                      Favorites
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator className="bg-slate-700" />
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard"
                          className="text-[#7c3aed] hover:text-white"
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="text-red-400 hover:text-red-300 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign in
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
