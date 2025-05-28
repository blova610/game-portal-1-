"use client";

import { useState, useEffect, use } from "react";
import { notFound } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase";
import GameCard from "@/components/game-card";
import { Skeleton } from "@/components/ui/skeleton";
import GameSidebar from "@/components/game-sidebar";
import Pagination from "@/components/pagination";
import type { Game } from "@/types/supabase";
import Link from "next/link";

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

const GAMES_PER_PAGE = 12; // 6 games per row * 2 rows

export default function CategoryPage({ params }: CategoryPageProps) {
  const { category } = use(params);
  const [games, setGames] = useState<Game[]>([]);
  const [totalGames, setTotalGames] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const categoryName = decodeURIComponent(category);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setIsLoading(true);
        const supabase = getSupabaseBrowser();

        // Get total count
        const { count } = await supabase
          .from("games")
          .select("*", { count: "exact", head: true })
          .eq("category", categoryName);

        setTotalGames(count || 0);

        // Get paginated games
        const { data: gamesData, error } = await supabase
          .from("games")
          .select("*")
          .eq("category", categoryName)
          .order("created_at", { ascending: false })
          .range(
            (currentPage - 1) * GAMES_PER_PAGE,
            currentPage * GAMES_PER_PAGE - 1
          );

        if (error) {
          console.error("Error fetching games:", error);
          return;
        }

        setGames(gamesData || []);
      } catch (error) {
        console.error("Error in fetchGames:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGames();
  }, [categoryName, currentPage]);

  if (totalGames === 0 && !isLoading) {
    notFound();
  }

  const totalPages = Math.ceil(totalGames / GAMES_PER_PAGE);

  return (
    <div className="flex min-h-screen bg-[#0f0f23]">
      <GameSidebar />
      <div className="flex-1 ml-14">
        <div className="px-4 py-6 md:px-6 md:py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl mb-3 text-white">
              {categoryName}
            </h1>
            <p className="text-slate-400">
              {isLoading
                ? "Loading games..."
                : `Found ${totalGames} game${totalGames === 1 ? "" : "s"}`}
            </p>
          </div>

          {isLoading ? (
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              {Array(GAMES_PER_PAGE)
                .fill(null)
                .map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-video h-auto w-full rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
            </div>
          ) : (
            <>
              {games.length > 0 && (
                <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                  {games.map((game: Game) => (
                    <Link
                      key={game.id}
                      href={`/games/${game.slug}`}
                      className="block"
                    >
                      <GameCard game={game} />
                    </Link>
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
