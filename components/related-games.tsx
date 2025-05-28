import Link from "next/link"
import Image from "next/image"
import type { Game } from "@/types/supabase"

interface RelatedGamesProps {
  games: Game[]
}

export default function RelatedGames({ games }: RelatedGamesProps) {
  if (!games.length) {
    return <p className="text-sm text-muted-foreground">No related games found.</p>
  }

  return (
    <div className="space-y-4">
      {games.map((game) => (
        <Link
          key={game.id}
          href={`/games/${game.slug}`}
          className="flex gap-3 rounded-md p-2 transition-colors hover:bg-muted"
        >
          <div className="relative aspect-video h-16 w-28 overflow-hidden rounded-md">
            <Image
              src={game.thumbnail || "/placeholder.svg"}
              alt={game.title}
              fill
              className="object-cover"
              sizes="112px"
            />
          </div>
          <div className="flex flex-1 flex-col justify-center">
            <h3 className="line-clamp-1 font-medium">{game.title}</h3>
            {game.category && <p className="text-xs text-muted-foreground">{game.category}</p>}
          </div>
        </Link>
      ))}
    </div>
  )
}
