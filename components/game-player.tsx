"use client"

import { useState, useEffect, useRef } from "react"
import { Heart, Share2, Facebook, Twitter, Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Game } from "@/types/supabase"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { likeGame, hasUserLikedGame } from "@/lib/game-utils"

interface GamePlayerProps {
  game: Game
  userId?: string
  initialLiked?: boolean
  likesCount?: number
}

export default function GamePlayer({ game, userId, initialLiked = false, likesCount = 0 }: GamePlayerProps) {
  const [isLiked, setIsLiked] = useState(initialLiked)
  const [likes, setLikes] = useState(likesCount)
  const [isCopied, setIsCopied] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    const checkLikeStatus = async () => {
      if (userId) {
        const liked = await hasUserLikedGame(game.id, userId)
        setIsLiked(liked)
      }
    }

    checkLikeStatus()
  }, [game.id, userId])

  const handleLike = async () => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like games",
        variant: "destructive",
      })
      return
    }

    const success = await likeGame(game.id, userId)

    if (success) {
      const newLikedState = !isLiked
      setIsLiked(newLikedState)
      setLikes((prev) => (newLikedState ? prev + 1 : prev - 1))
    }
  }

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`
    window.open(url, "_blank", "width=600,height=400")
  }

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      window.location.href,
    )}&text=${encodeURIComponent(`Play ${game.title} on Web Game Portal`)}`
    window.open(url, "_blank", "width=600,height=400")
  }

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      iframeRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  return (
    <div className="flex flex-col">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
        <iframe
          ref={iframeRef}
          src={game.game_url}
          title={game.title}
          className="h-full w-full border-0"
          allowFullScreen
        />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1" onClick={handleLike}>
            <Heart className={cn("h-4 w-4", isLiked ? "fill-red-500 text-red-500" : "")} />
            <span>{likes}</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={shareOnFacebook}>
                <Facebook className="mr-2 h-4 w-4" />
                <span>Facebook</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={shareOnTwitter}>
                <Twitter className="mr-2 h-4 w-4" />
                <span>Twitter</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={copyLink}>
                {isCopied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
                <span>{isCopied ? "Copied!" : "Copy Link"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button variant="outline" size="sm" onClick={toggleFullscreen}>
          {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        </Button>
      </div>

      <div className="mt-6">
        <h1 className="text-2xl font-bold">{game.title}</h1>
        {game.category && <p className="mt-1 text-sm text-muted-foreground">{game.category}</p>}

        {game.description && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold">Description</h2>
            <p className="mt-2 text-muted-foreground">{game.description}</p>
          </div>
        )}

        {game.instructions && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold">How to Play</h2>
            <p className="mt-2 text-muted-foreground">{game.instructions}</p>
          </div>
        )}
      </div>
    </div>
  )
}
