"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getSupabaseBrowser } from "@/lib/supabase";
import type { Game } from "@/types/supabase";
import Link from "next/link";

export default function SearchNav() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query.trim()) {
        setSuggestions([]);
        return;
      }

      try {
        setIsLoading(true);
        const supabase = getSupabaseBrowser();
        const { data } = await supabase
          .from("games")
          .select("id, title, slug, thumbnail")
          .ilike("title", `%${query}%`)
          .limit(5);

        setSuggestions(data || []);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (slug: string) => {
    router.push(`/games/${slug}`);
    setShowSuggestions(false);
    setQuery("");
  };

  return (
    <div className="relative" ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative">
        <Input
          type="search"
          placeholder="Search games..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          className="w-[200px] md:w-[300px] bg-[#16213e] border-slate-700 text-white placeholder:text-slate-400 focus:border-[#7c3aed] focus:ring-[#7c3aed] pr-10"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
        >
          <Search className="h-4 w-4" />
        </button>
      </form>

      {showSuggestions && (query.trim() || isLoading) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#16213e] border border-slate-700 rounded-lg shadow-lg z-50">
          {isLoading ? (
            <div className="p-4 text-center text-slate-400">Searching...</div>
          ) : suggestions.length > 0 ? (
            <div className="py-2">
              {suggestions.map((game) => (
                <button
                  key={game.id}
                  onClick={() => handleSuggestionClick(game.slug)}
                  className="w-full px-4 py-2 text-left hover:bg-[#1e2a4a] flex items-center gap-3 group"
                >
                  <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={game.thumbnail || "/placeholder.svg"}
                      alt={game.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <span className="text-white group-hover:text-[#7c3aed] truncate">
                    {game.title}
                  </span>
                </button>
              ))}
              <div className="px-4 py-2 border-t border-slate-700">
                <Link
                  href={`/search?q=${encodeURIComponent(query.trim())}`}
                  className="text-[#7c3aed] hover:text-[#6d28d9] text-sm font-medium"
                >
                  View all results
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-slate-400">No games found</div>
          )}
        </div>
      )}
    </div>
  );
}
