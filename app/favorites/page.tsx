"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { redirect } from "next/navigation";
import { getUserLikedGames } from "@/lib/game-utils";
import { getCurrentUser } from "@/lib/session";
import GameCard from "@/components/game-card";
import { Gamepad2, Heart, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Game } from "@/types/supabase";
import GameSidebar from "@/components/game-sidebar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";

export default function FavoritesPage() {
  const router = useRouter();
  const { user: clientUser, session: clientSession } = useAuth();
  const [likedGames, setLikedGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const initializeData = async () => {
      if (!clientUser) {
        router.push("/login?callbackUrl=/favorites");
        return;
      }
      setUser(clientUser);
      setIsLoading(true);
      try {
        const games = await getUserLikedGames(clientUser.id);
        setLikedGames(games);
      } catch (error) {
        console.error("Error loading favorites:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [clientUser]);

  return (
    <div className="flex min-h-screen bg-[#0f0f23]">
      <GameSidebar />
      <div className="flex-1 ml-14">
        <div className="px-4 py-6 md:px-6 md:py-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#7c3aed] rounded-lg flex items-center justify-center">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Your Favorite Games
              </h1>
              <p className="text-slate-400">
                {isLoading
                  ? "Loading your favorites..."
                  : likedGames.length === 0
                  ? "No favorites yet"
                  : `${likedGames.length} game${
                      likedGames.length === 1 ? "" : "s"
                    } in your collection`}
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              {Array(12)
                .fill(null)
                .map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-video h-auto w-full rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
            </div>
          ) : likedGames.length > 0 ? (
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              {likedGames.map((game) => (
                <Link
                  key={game.id}
                  href={`/games/${game.slug}`}
                  className="block"
                >
                  <GameCard game={game} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-[#16213e] rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-[#0f0f23] rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-[#7c3aed]" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                No Favorites Yet
              </h2>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                You haven't added any games to your favorites yet. Browse our
                collection and click the heart icon to add games to your
                favorites.
              </p>
              <Link href="/">
                <Button className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-6">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go Back Home
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
