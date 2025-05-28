import { Suspense } from "react"
import { getSupabaseBrowser } from "@/lib/supabase"
import GameCard from "@/components/game-card"
import { Skeleton } from "@/components/ui/skeleton"
import type { Game } from "@/types/supabase"

async function getPopularGames() {
  try {
    const supabase = getSupabaseBrowser()

    // Get games with like counts (simplified - in real app you'd have proper analytics)
    const { data: games, error } = await supabase
      .from("games")
      .select(`
        *,
        likes(count)
      `)
      .order("created_at", { ascending: false })
      .limit(24)

    if (error) {
      console.error("Error fetching popular games:", error)
      return []
    }

    return games || []
  } catch (error) {
    console.error("Error in getPopularGames:", error)
    return []
  }
}

export default async function PopularPage() {
  const games = await getPopularGames()

  return (
    <div className="container py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">Popular Games</h1>
        <p className="text-muted-foreground md:text-lg">The most loved games by our community. Play the favorites!</p>
      </div>

      <Suspense
        fallback={
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array(12)
              .fill(null)
              .map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-video h-auto w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
          </div>
        }
      >
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {games.map((game: Game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </Suspense>

      {games.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No games found</h3>
          <p className="text-muted-foreground">Popular games will appear here as users interact with them.</p>
        </div>
      )}
    </div>
  )
}
