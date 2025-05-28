import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import GameCard from "@/components/game-card";
import DatabaseSetup from "@/components/database-setup";
import FeaturedGamePlayer from "@/components/featured-game-player";
import { getSupabaseBrowser, hasSupabaseConfig } from "@/lib/supabase";
import { getHomepageConfig, getAllHomepageConfig } from "@/lib/game-utils";
import { generateGameSeo } from "@/lib/seo";
import type { Metadata } from "next";
import type { Game } from "@/types/supabase";

interface HeroButton {
  text: string;
  link: string;
  variant: string;
}

async function checkDatabaseConnection() {
  try {
    const supabase = getSupabaseBrowser();

    // If no Supabase config, return not connected
    if (!supabase || !hasSupabaseConfig) {
      return { connected: false, tablesExist: false };
    }

    // Try a simple query to check if tables exist
    const { data, error } = await supabase.from("games").select("id").limit(1);

    if (error && error.code === "42P01") {
      // Table doesn't exist
      return { connected: false, tablesExist: false };
    }

    return {
      connected: true,
      tablesExist: true,
      hasGames: (data?.length || 0) > 0,
    };
  } catch (error) {
    console.error("Database connection check failed:", error);
    return { connected: false, tablesExist: false };
  }
}

async function getGamesData() {
  try {
    const supabase = getSupabaseBrowser();

    if (!supabase || !hasSupabaseConfig) {
      return { games: [], categories: [] as string[] };
    }

    const [gamesResult, categoriesResult] = await Promise.all([
      supabase
        .from("games")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(16),
      supabase.from("games").select("category").not("category", "is", null),
    ]);

    const games = gamesResult.data || [];
    const categories = [
      ...new Set(
        (categoriesResult.data || [])
          .map((game: Game) => game.category)
          .filter(
            (category: unknown): category is string =>
              typeof category === "string"
          )
      ),
    ] as string[];

    return { games, categories };
  } catch (error) {
    console.error("Error fetching games data:", error);
    return { games: [], categories: [] as string[] };
  }
}

async function getFeaturedGame() {
  try {
    const supabase = getSupabaseBrowser();

    if (!supabase || !hasSupabaseConfig) {
      return null;
    }

    // Get featured game ID from homepage_config
    const featuredGameIdConfig = await getHomepageConfig("featured_game_id");
    const featuredGameId = featuredGameIdConfig
      ? featuredGameIdConfig
      : process.env.NEXT_PUBLIC_FEATURED_GAME_ID || "1";

    const { data, error } = await supabase
      .from("games")
      .select("*")
      .eq("id", featuredGameId)
      .single();

    if (error || !data) {
      // Fallback to first game if featured game not found
      const { data: fallbackData } = await supabase
        .from("games")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      return fallbackData;
    }

    return data;
  } catch (error) {
    console.error("Error fetching featured game:", error);
    return null;
  }
}

// Generate metadata for the page based on featured game
export async function generateMetadata(): Promise<Metadata> {
  const [featuredGame, homepageConfig] = await Promise.all([
    getFeaturedGame(),
    getAllHomepageConfig(),
  ]);

  const siteTitle = homepageConfig.site_title || "Modern Web Game Portal";
  const siteDescription =
    homepageConfig.site_description ||
    "Play the best online games for free on our modern web game portal.";
  const siteKeywords =
    homepageConfig.site_keywords ||
    "web games, online games, free games, browser games";

  if (!featuredGame) {
    return {
      title: siteTitle,
      description: siteDescription,
      keywords: siteKeywords,
    };
  }

  const seo = await generateGameSeo(featuredGame);

  return {
    title: `${siteTitle} - ${seo.title}`,
    description: siteDescription,
    keywords: `${siteKeywords}, ${seo.keywords}`,
    openGraph: {
      title: siteTitle,
      description: siteDescription,
      images: seo.image ? [{ url: seo.image }] : [],
      type: "website",
      url: seo.url,
    },
    twitter: {
      card: "summary_large_image",
      title: siteTitle,
      description: siteDescription,
      images: seo.image ? [{ url: seo.image }] : [],
    },
    robots: seo.robots,
    alternates: {
      canonical: seo.url,
    },
  };
}

export default async function Home() {
  const { connected, tablesExist, hasGames } = await checkDatabaseConnection();
  const { games, categories } = await getGamesData();
  const featuredGame = await getFeaturedGame();

  if (!connected || !tablesExist) {
    return <DatabaseSetup />;
  }

  return (
    <main className="min-h-screen bg-[#0f0f23]">
      {featuredGame && <FeaturedGamePlayer game={featuredGame} />}
    </main>
  );
}
