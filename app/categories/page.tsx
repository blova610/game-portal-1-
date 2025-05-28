"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import GameSidebar from "@/components/game-sidebar";
import Pagination from "@/components/pagination";

interface Category {
  name: string;
  count: number;
}

interface GameCategory {
  category: string;
}

const CATEGORIES_PER_PAGE = 12; // 6 categories per row * 2 rows

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalCategories, setTotalCategories] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const supabase = getSupabaseBrowser();

        // Get all games with categories
        const { data: games, error } = await supabase
          .from("games")
          .select("category")
          .not("category", "is", null);

        if (error) {
          console.error("Error fetching categories:", error);
          return;
        }

        // Count games per category
        const categoryCount = games.reduce(
          (acc: Record<string, number>, game: GameCategory) => {
            const category = game.category;
            acc[category] = (acc[category] || 0) + 1;
            return acc;
          },
          {}
        );

        // Convert to array and sort by count
        const categoriesArray = Object.entries(categoryCount)
          .map(([name, count]) => ({
            name,
            count: count as number,
          }))
          .sort((a, b) => b.count - a.count);

        setTotalCategories(categoriesArray.length);

        // Get paginated categories
        const start = (currentPage - 1) * CATEGORIES_PER_PAGE;
        const end = start + CATEGORIES_PER_PAGE;
        setCategories(categoriesArray.slice(start, end));
      } catch (error) {
        console.error("Error in fetchCategories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [currentPage]);

  const totalPages = Math.ceil(totalCategories / CATEGORIES_PER_PAGE);

  return (
    <div className="flex min-h-screen bg-[#0f0f23]">
      <GameSidebar />
      <div className="flex-1 ml-14">
        <div className="px-4 py-6 md:px-6 md:py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl mb-3 text-white">
              Game Categories
            </h1>
            <p className="text-slate-400">
              Explore {totalCategories} categories and find your favorite type
              of entertainment.
            </p>
          </div>

          {isLoading ? (
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              {Array(CATEGORIES_PER_PAGE)
                .fill(null)
                .map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-lg" />
                ))}
            </div>
          ) : (
            <>
              <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                {categories.map((category) => (
                  <Link
                    key={category.name}
                    href={`/categories/${encodeURIComponent(category.name)}`}
                  >
                    <Card className="group transition-all hover:scale-105 hover:shadow-md cursor-pointer bg-[#16213e] border-slate-700 h-full">
                      <CardHeader>
                        <CardTitle className="text-lg text-white">
                          {category.name}
                        </CardTitle>
                        <CardDescription>
                          <Badge
                            variant="secondary"
                            className="bg-slate-700 text-slate-300"
                          >
                            {category.count} games
                          </Badge>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-400">
                          Discover {category.count} amazing{" "}
                          {category.name.toLowerCase()} games
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}

          {categories.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2 text-white">
                No categories found
              </h3>
              <p className="text-slate-400">
                Games will be categorized as they are added.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
