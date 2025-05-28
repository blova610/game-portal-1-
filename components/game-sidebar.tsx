"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { NavigationItem } from "@/types/supabase";
import { DynamicIcon } from "@/components/dynamic-icon";
import { getNavigationItems } from "@/lib/game-utils";

export default function GameSidebar() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [showSidebarScrollbar, setShowSidebarScrollbar] = useState(false);
  const [navItems, setNavItems] = useState<NavigationItem[]>([]);
  const [categoryNavItems, setCategoryNavItems] = useState<NavigationItem[]>(
    []
  );
  const [isLoadingNav, setIsLoadingNav] = useState(true);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoadingNav(true);
        const [fixedNavItems, categoryItems] = await Promise.all([
          getNavigationItems(true),
          getNavigationItems(false),
        ]);

        setNavItems(fixedNavItems);
        setCategoryNavItems(categoryItems);
        setIsLoadingNav(false);
      } catch (error) {
        console.error("Error initializing navigation data:", error);
        setIsLoadingNav(false);
      }
    };

    initializeData();
  }, []);

  // Fallback navigation items if database fails
  const fallbackFixedNavItems = [
    { id: "1", label: "Home", href: "/", icon: "Home", color: "text-blue-400" },
    {
      id: "2",
      label: "Categories",
      href: "/categories",
      icon: "Grid",
      color: "text-green-400",
    },
    {
      id: "3",
      label: "Popular",
      href: "/popular",
      icon: "TrendingUp",
      color: "text-orange-400",
    },
    {
      id: "4",
      label: "New",
      href: "/new",
      icon: "Clock",
      color: "text-purple-400",
    },
  ];

  const fallbackCategoryNavItems = [
    {
      id: "5",
      label: "Action",
      href: "/categories/action",
      icon: "Swords",
      color: "text-red-400",
    },
    {
      id: "6",
      label: "Adventure",
      href: "/categories/adventure",
      icon: "Map",
      color: "text-yellow-400",
    },
    {
      id: "7",
      label: "Puzzle",
      href: "/categories/puzzle",
      icon: "PuzzlePiece",
      color: "text-green-400",
    },
    {
      id: "8",
      label: "Racing",
      href: "/categories/racing",
      icon: "Car",
      color: "text-blue-400",
    },
    {
      id: "9",
      label: "Sports",
      href: "/categories/sports",
      icon: "Trophy",
      color: "text-purple-400",
    },
    {
      id: "10",
      label: "Strategy",
      href: "/categories/strategy",
      icon: "ChessKnight",
      color: "text-indigo-400",
    },
  ];

  // Use fallback if no items loaded
  const displayFixedNavItems =
    navItems.length > 0 ? navItems : fallbackFixedNavItems;
  const displayCategoryNavItems =
    categoryNavItems.length > 0 ? categoryNavItems : fallbackCategoryNavItems;

  return (
    <div className="fixed left-0 top-16 bottom-0 z-40">
      <div
        ref={sidebarRef}
        className={cn(
          "bg-[#0f0f23] h-full flex flex-col transition-all duration-300 ease-in-out",
          sidebarExpanded ? "w-64" : "w-14"
        )}
        onMouseEnter={() => {
          setSidebarExpanded(true);
          setShowSidebarScrollbar(true);
        }}
        onMouseLeave={() => {
          setSidebarExpanded(false);
          setShowSidebarScrollbar(false);
        }}
      >
        <div
          className={cn(
            "py-3 space-y-1 overflow-y-auto max-h-full transition-all duration-300",
            showSidebarScrollbar ? "" : "hide-scrollbar"
          )}
        >
          {/* Fixed Navigation Items */}
          {isLoadingNav
            ? Array(7)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="h-9 mx-3 bg-white/5 animate-pulse rounded-lg"
                  />
                ))
            : displayFixedNavItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex items-center px-4 py-2.5 mx-2 rounded-lg hover:bg-white/10 transition-colors group"
                >
                  <DynamicIcon
                    name={item.icon}
                    className="h-5 w-5 flex-shrink-0"
                    color={item.color}
                  />
                  {sidebarExpanded && (
                    <span className="ml-3 text-white text-sm font-medium whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                </Link>
              ))}

          {/* Separator */}
          <div className="h-px bg-slate-600/50 mx-4 my-3"></div>

          {/* Category Navigation Items */}
          {isLoadingNav
            ? Array(10)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="h-9 mx-3 bg-white/5 animate-pulse rounded-lg"
                  />
                ))
            : displayCategoryNavItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex items-center px-4 py-2.5 mx-2 rounded-lg hover:bg-white/10 transition-colors group"
                >
                  <DynamicIcon
                    name={item.icon}
                    className="h-5 w-5 flex-shrink-0"
                    color={item.color}
                  />
                  {sidebarExpanded && (
                    <span className="ml-3 text-white text-sm font-medium whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                </Link>
              ))}

          {/* All Categories Link */}
          <Link
            href="/categories"
            className="flex items-center px-4 py-2.5 mx-2 rounded-lg hover:bg-white/10 transition-colors group"
          >
            <DynamicIcon
              name="Grid3X3"
              className="h-5 w-5 flex-shrink-0 text-slate-400"
            />
            {sidebarExpanded && (
              <span className="ml-3 text-white text-sm font-medium whitespace-nowrap">
                All Categories
              </span>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}
