"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import GameSidebar from "@/components/game-sidebar";
import GameCard from "@/components/game-card";
import { getSupabaseBrowser } from "@/lib/supabase";
import type { Game } from "@/types/supabase";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  const [popularGames, setPopularGames] = useState<Game[]>([]);

  useEffect(() => {
    const fetchPopularGames = async () => {
      try {
        const supabase = getSupabaseBrowser();
        const { data } = await supabase
          .from("games")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(12);

        setPopularGames(data || []);
      } catch (error) {
        console.error("Error fetching popular games:", error);
      }
    };

    fetchPopularGames();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0f0f23]">
      <GameSidebar />
      <div className="flex-1 ml-14">
        <div className="px-4 py-6 md:px-6 md:py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-6xl font-bold tracking-tight md:text-7xl mb-4 text-white font-mono">
                GAME
                <br />
                OVER
              </h1>
              <p className="text-xl text-slate-400 mb-8">
                Oops, you've reached a dead end!
                <br />
                The page you're looking for doesn't exist.
              </p>
              <div className="flex justify-center mb-12">
                <Button
                  asChild
                  className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-8 py-6 text-lg"
                >
                  <Link href="/">
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Go Back Home
                  </Link>
                </Button>
              </div>
            </div>

            {popularGames.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold tracking-tight md:text-3xl mb-6 text-white text-center">
                  ...or try some of our most popular games:
                </h2>
                <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                  {popularGames.map((game) => (
                    <Link
                      key={game.id}
                      href={`/games/${game.slug}`}
                      className="block"
                    >
                      <GameCard game={game} />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
