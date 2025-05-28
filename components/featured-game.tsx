"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Play, Heart, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Game } from "@/types/supabase"

interface FeaturedGameProps {
  game: Game
}

export default function FeaturedGame({ game }: FeaturedGameProps) {
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <Card className="overflow-hidden bg-white/10 backdrop-blur-sm border-white/20">
      <CardContent className="p-0">
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={game.thumbnail || "/placeholder.svg"}
            alt={game.title}
            fill
            className={`object-cover transition-all duration-300 ${
              imageLoaded ? "scale-100 opacity-100" : "scale-110 opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity hover:opacity-100">
            <Button size="lg" className="rounded-full w-16 h-16 p-0">
              <Play className="h-6 w-6 ml-1" fill="currentColor" />
            </Button>
          </div>

          {/* Featured Badge */}
          <div className="absolute top-4 left-4">
            <Badge className="bg-yellow-500 text-yellow-900 font-semibold">Featured</Badge>
          </div>

          {/* Game Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h3 className="text-xl font-bold mb-1">{game.title}</h3>
            {game.category && (
              <Badge variant="secondary" className="mb-2">
                {game.category}
              </Badge>
            )}
            {game.description && <p className="text-sm text-white/80 line-clamp-2 mb-3">{game.description}</p>}

            <div className="flex items-center gap-2">
              <Button asChild className="flex-1">
                <Link href={`/games/${game.slug}`}>
                  <Play className="mr-2 h-4 w-4" />
                  Play Now
                </Link>
              </Button>
              <Button variant="outline" size="icon" className="text-white border-white/20 hover:bg-white/10">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="text-white border-white/20 hover:bg-white/10">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
