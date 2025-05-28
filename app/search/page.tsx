"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase";
import GameCard from "@/components/game-card";
import { Skeleton } from "@/components/ui/skeleton";
import GameSidebar from "@/components/game-sidebar";
import Pagination from "@/components/pagination";
import type { Game } from "@/types/supabase";
import Link from "next/link";

const GAMES_PER_PAGE = 12; // 6 games per row * 2 rows

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [games, setGames] = useState<Game[]>([]);
  const [totalGames, setTotalGames] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      setSearchQuery(query);
      setCurrentPage(1); // Reset to first page on new search
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchGames = async () => {
      if (!searchQuery.trim()) {
        setGames([]);
        setTotalGames(0);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const supabase = getSupabaseBrowser();

        // Get total count
        const { count } = await supabase
          .from("games")
          .select("*", { count: "exact", head: true })
          .ilike("title", `%${searchQuery}%`);

        setTotalGames(count || 0);

        // Get paginated games
        const { data: gamesData, error } = await supabase
          .from("games")
          .select("*")
          .ilike("title", `%${searchQuery}%`)
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
  }, [searchQuery, currentPage]);

  const totalPages = Math.ceil(totalGames / GAMES_PER_PAGE);

  return (
    <div className="flex min-h-screen bg-[#0f0f23]">
      <GameSidebar />
      <div className="flex-1 ml-14">
        <div className="px-4 py-6 md:px-6 md:py-8">
          {searchQuery && (
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl mb-3 text-white">
                Search results for "{searchQuery}"
              </h1>
              <p className="text-slate-400">
                {isLoading
                  ? "Searching..."
                  : totalGames === 0
                  ? "No games found"
                  : `Found ${totalGames} game${totalGames === 1 ? "" : "s"}`}
              </p>
            </div>
          )}

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
                  {games.map((game) => (
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

          {!isLoading && searchQuery && games.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2 text-white">
                No games found
              </h3>
              <p className="text-slate-400">
                Try different keywords or browse our categories
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
