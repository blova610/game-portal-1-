import Image from "next/image";
import type { Game } from "@/types/supabase";

interface GameCardProps {
  game: Game;
  className?: string;
}

export default function GameCard({ game, className = "" }: GameCardProps) {
  return (
    <div
      className={`group relative aspect-video overflow-hidden rounded-lg bg-slate-800 hover:ring-2 hover:ring-[#7c3aed] transition-all ${className}`}
    >
      <Image
        src={game.thumbnail || "/placeholder.svg"}
        alt={game.title}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-200"
        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute bottom-2 left-2 right-2">
          <h4 className="text-white text-xs font-medium truncate">
            {game.title}
          </h4>
        </div>
      </div>
    </div>
  );
}
