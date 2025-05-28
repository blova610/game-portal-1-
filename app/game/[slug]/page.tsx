import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGameBySlug } from "@/lib/game-utils";
import FeaturedGamePlayer from "@/components/featured-game-player";
import { generateGameSeo } from "@/lib/seo";
import type { Game } from "@/types/supabase";

interface GamePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: GamePageProps): Promise<Metadata> {
  const { slug } = await params;
  const game = await getGameBySlug(slug);

  if (!game) {
    return {
      title: "Game Not Found",
      description: "The requested game could not be found.",
    };
  }

  const seo = generateGameSeo(game);

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: {
      title: seo.title,
      description: seo.description,
      images: game.thumbnail ? [{ url: game.thumbnail }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [seo.image || ""],
    },
  };
}

export default async function GamePage({ params }: GamePageProps) {
  const { slug } = await params;
  const game = await getGameBySlug(slug);

  if (!game) {
    notFound();
  }

  return (
    <div className="pt-16 bg-[#0f0f23]">
      <FeaturedGamePlayer game={game} />
    </div>
  );
}
