import type { Game } from "@/types/supabase"
import { getHomepageConfig } from "./game-utils"

export type SeoProps = {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: string
  robots?: string
  keywords?: string
  jsonLd?: Record<string, any>
}

export const DEFAULT_SEO: SeoProps = {
  title: "Modern Web Game Portal",
  description: "Play the best online games for free on our modern web game portal.",
  image: "/images/og-image.jpg",
  url: typeof window !== "undefined" ? window.location.origin : "",
  type: "website",
  robots: "index, follow",
  keywords: "web games, online games, free games, browser games",
}

async function getBaseUrl(): Promise<string> {
  // Client-side: use window.location.origin
  if (typeof window !== "undefined") {
    return window.location.origin
  }

  // Server-side: get from config
  const homepageConfig = await getHomepageConfig("site_url")
  return homepageConfig || ""
}

export async function generateGameSeo(game: Game): Promise<SeoProps> {
  const baseUrl = await getBaseUrl()

  return {
    title: game.meta_title || game.title,
    description: game.meta_description || game.description || `Play ${game.title} online for free`,
    image: game.thumbnail,
    url: `${baseUrl}/game/${game.slug}`,
    type: "article",
    robots: game.robots || DEFAULT_SEO.robots,
    keywords: game.keywords || DEFAULT_SEO.keywords,
    jsonLd: generateGameJsonLd(game, baseUrl),
  }
}

export function generateGameJsonLd(game: Game, baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: game.title,
    description: game.description || `Play ${game.title} online for free`,
    image: game.thumbnail,
    url: `${baseUrl}/game/${game.slug}`,
    ...(game.category && { genre: game.category }),
  }
}
