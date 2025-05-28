"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import type { Game, NavigationItem, Advertisement } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  likeGame,
  hasUserLikedGame,
  getGames,
  getGameCategories,
  getNavigationItems,
  getAdvertisements,
} from "@/lib/game-utils";
import { getSupabaseBrowser } from "@/lib/supabase";
import { DynamicIcon } from "@/components/dynamic-icon";
import {
  AD_POSITION_1,
  AD_POSITION_2,
  AD_POSITION_3,
  AD_POSITION_4,
} from "@/constants/advertisement-constants";

interface FeaturedGamePlayerProps {
  game: Game;
}

export default function FeaturedGamePlayer({ game }: FeaturedGamePlayerProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [relatedGames, setRelatedGames] = useState<Game[]>([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [showSidebarScrollbar, setShowSidebarScrollbar] = useState(false);
  const [navItems, setNavItems] = useState<NavigationItem[]>([]);
  const [categoryNavItems, setCategoryNavItems] = useState<NavigationItem[]>(
    []
  );
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [isLoadingNav, setIsLoadingNav] = useState(true);
  const [user, setUser] = useState<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const supabase = getSupabaseBrowser();

  // Check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        setUser(data.session?.user || null);
      }
    };

    checkUser();
  }, [supabase]);

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Fetch navigation items
        setIsLoadingNav(true);
        const [fixedNavItems, categoryItems] = await Promise.all([
          getNavigationItems(true),
          getNavigationItems(false),
        ]);

        setNavItems(fixedNavItems);
        setCategoryNavItems(categoryItems);
        setIsLoadingNav(false);

        // Check like status
        if (user && supabase) {
          const liked = await hasUserLikedGame(game.id, user.id);
          setIsLiked(liked);
        }

        // Get real like count
        if (supabase) {
          const { data: likesData } = await supabase
            .from("likes")
            .select("id")
            .eq("game_id", game.id);
          setLikes(likesData?.length || 0);
          setDislikes(Math.floor((likesData?.length || 0) * 0.1));
        }

        // Fetch categories
        const categoriesData = await getGameCategories();
        setCategories(categoriesData as string[]);

        // Fetch advertisements
        const ads = await getAdvertisements();
        setAdvertisements(ads);
        console.log("Advertisements fetched:", ads);

        // Fetch related games
        setIsLoadingRelated(true);
        let relatedGamesData: Game[] = [];

        if (game.category) {
          relatedGamesData = await getGames(20, 0, game.category);
          relatedGamesData = relatedGamesData.filter((g) => g.id !== game.id);
        }

        if (relatedGamesData.length < 20) {
          const additionalGames = await getGames(20 - relatedGamesData.length);
          const filteredAdditional = additionalGames.filter(
            (g: Game) =>
              g.id !== game.id && !relatedGamesData.some((rg) => rg.id === g.id)
          );
          relatedGamesData = [...relatedGamesData, ...filteredAdditional];
        }

        setRelatedGames(relatedGamesData.slice(0, 20));
        setIsLoadingRelated(false);
      } catch (error) {
        console.error("Error initializing data:", error);
        setIsLoadingNav(false);
        setIsLoadingRelated(false);
      }
    };

    initializeData();
  }, [game.id, game.category, user, supabase]);

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like games",
        variant: "destructive",
      });
      return;
    }

    let success = false;
    if (supabase) {
      success = await likeGame(game.id, user.id);
    }

    if (success) {
      const newLikedState = !isLiked;
      setIsLiked(newLikedState);
      setLikes((prev) => (newLikedState ? prev + 1 : prev - 1));
    }
  };

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      window.location.href
    )}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      window.location.href
    )}&text=${encodeURIComponent(`Play ${game.title} for free!`)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const copyLink = () => {
    const gameUrl = `${window.location.origin}/game/${game.slug}`;
    navigator.clipboard.writeText(gameUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    toast({
      title: "Link copied!",
      description: "Game link has been copied to clipboard.",
    });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const startPlaying = () => {
    setIsPlaying(true);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Fallback navigation items if database fails
  const fallbackFixedNavItems = [
    { id: "1", label: "Home", href: "/", icon: "Home", color: "text-blue-400" },
    {
      id: "2",
      label: "Categories",
      href: "/categories",
      icon: "Grid",
      color: "text-green-400",
    },
    {
      id: "3",
      label: "Popular",
      href: "/popular",
      icon: "TrendingUp",
      color: "text-orange-400",
    },
    {
      id: "4",
      label: "New",
      href: "/new",
      icon: "Clock",
      color: "text-purple-400",
    },
  ];

  const fallbackCategoryNavItems = [
    {
      id: "5",
      label: "Action",
      href: "/categories/action",
      icon: "Swords",
      color: "text-red-400",
    },
    {
      id: "6",
      label: "Adventure",
      href: "/categories/adventure",
      icon: "Map",
      color: "text-yellow-400",
    },
    {
      id: "7",
      label: "Puzzle",
      href: "/categories/puzzle",
      icon: "PuzzlePiece",
      color: "text-green-400",
    },
    {
      id: "8",
      label: "Racing",
      href: "/categories/racing",
      icon: "Car",
      color: "text-blue-400",
    },
    {
      id: "9",
      label: "Sports",
      href: "/categories/sports",
      icon: "Trophy",
      color: "text-purple-400",
    },
    {
      id: "10",
      label: "Strategy",
      href: "/categories/strategy",
      icon: "ChessKnight",
      color: "text-indigo-400",
    },
  ];

  // Use fallback if no items loaded
  const displayFixedNavItems =
    navItems.length > 0 ? navItems : fallbackFixedNavItems;
  const displayCategoryNavItems =
    categoryNavItems.length > 0 ? categoryNavItems : fallbackCategoryNavItems;

  // Lấy quảng cáo theo position
  const getAdByPosition = (position: string) => {
    return advertisements.find((ad) => ad.position === position);
  };

  const ad1 = getAdByPosition("position-1");
  const ad2 = getAdByPosition("position-2");
  const ad3 = getAdByPosition("position-3");
  const ad4 = getAdByPosition("position-4");

  return (
    <div className="flex min-h-screen bg-[#0f0f23] relative">
      {/* Left Sidebar - Fixed position with overlay behavior */}
      <div className="fixed left-0 top-16 bottom-0 z-40">
        <div
          ref={sidebarRef}
          className={cn(
            "bg-[#0f0f23] h-full flex flex-col transition-all duration-300 ease-in-out",
            sidebarExpanded ? "w-64" : "w-14"
          )}
          onMouseEnter={() => {
            setSidebarExpanded(true);
            setShowSidebarScrollbar(true);
          }}
          onMouseLeave={() => {
            setSidebarExpanded(false);
            setShowSidebarScrollbar(false);
          }}
        >
          <div
            className={cn(
              "py-3 space-y-1 overflow-y-auto max-h-full transition-all duration-300",
              showSidebarScrollbar ? "" : "hide-scrollbar"
            )}
          >
            {/* Fixed Navigation Items from Database */}
            {isLoadingNav
              ? // Loading skeleton
                Array(7)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="h-9 mx-3 bg-white/5 animate-pulse rounded-lg"
                    />
                  ))
              : displayFixedNavItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="flex items-center px-4 py-2.5 mx-2 rounded-lg hover:bg-white/10 transition-colors group"
                  >
                    <DynamicIcon
                      name={item.icon}
                      className="h-5 w-5 flex-shrink-0"
                      color={item.color}
                    />
                    {sidebarExpanded && (
                      <span className="ml-3 text-white text-sm font-medium whitespace-nowrap">
                        {item.label}
                      </span>
                    )}
                  </Link>
                ))}

            {/* Separator */}
            <div className="h-px bg-slate-600/50 mx-4 my-3"></div>

            {/* Category Navigation Items from Database */}
            {isLoadingNav
              ? // Loading skeleton
                Array(10)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="h-9 mx-3 bg-white/5 animate-pulse rounded-lg"
                    />
                  ))
              : displayCategoryNavItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="flex items-center px-4 py-2.5 mx-2 rounded-lg hover:bg-white/10 transition-colors group"
                  >
                    <DynamicIcon
                      name={item.icon}
                      className="h-5 w-5 flex-shrink-0"
                      color={item.color}
                    />
                    {sidebarExpanded && (
                      <span className="ml-3 text-white text-sm font-medium whitespace-nowrap">
                        {item.label}
                      </span>
                    )}
                  </Link>
                ))}

            {/* All Categories Link */}
            <Link
              href="/categories"
              className="flex items-center px-4 py-2.5 mx-2 rounded-lg hover:bg-white/10 transition-colors group"
            >
              <LucideIcons.Grid3X3 className="h-5 w-5 flex-shrink-0 text-slate-400" />
              {sidebarExpanded && (
                <span className="ml-3 text-white text-sm font-medium whitespace-nowrap">
                  All Categories
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Area - Add margin-left to account for sidebar */}
      <div className="flex-1 flex ml-14">
        {/* Game Player Section */}
        <div className="flex-1 bg-[#0f0f23] p-6">
          <div className="max-w-5xl mx-auto">
            {/* Game Player Container */}
            <div className="bg-[#0f0f23] rounded-lg overflow-hidden shadow-2xl">
              <div
                ref={containerRef}
                className="relative aspect-video w-full bg-black"
              >
                {!isPlaying ? (
                  // Game Preview with Play Button - CrazyGames style
                  <div
                    className="relative w-full h-full group cursor-pointer"
                    onClick={startPlaying}
                  >
                    <Image
                      src={game.thumbnail || "/placeholder.svg"}
                      alt={game.title}
                      fill
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col items-center justify-center text-white">
                      {/* Game Title */}
                      <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 px-4 text-white drop-shadow-lg">
                        {game.title}
                      </h1>

                      {/* Play Button - CrazyGames purple style */}
                      <Button
                        size="lg"
                        className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-10 py-4 text-xl font-bold rounded-full transition-all transform hover:scale-105 shadow-lg"
                      >
                        <LucideIcons.Play
                          className="h-6 w-6 mr-3"
                          fill="currentColor"
                        />
                        Play Now
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Actual Game Player
                  <iframe
                    ref={iframeRef}
                    src={game.game_url}
                    title={game.title}
                    className="w-full h-full border-0"
                    allowFullScreen
                    allow="gamepad; microphone; camera"
                  />
                )}
              </div>

              {/* Game Controls Bar - Clean style */}
              <div className="bg-[#0f0f23] px-4 py-3">
                <div className="flex items-center justify-between">
                  {/* Left Side - Game Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#7c3aed] rounded-lg flex items-center justify-center">
                      <Image
                        src={game.thumbnail || "/placeholder.svg"}
                        alt={game.title}
                        width={32}
                        height={32}
                        className="rounded h-8 w-8 object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-sm">
                        {game.title}
                      </h3>
                      {game.category && (
                        <p className="text-slate-400 text-xs">
                          {game.category}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Side - Action Buttons */}
                  <div className="flex items-center gap-1">
                    {/* Like Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLike}
                      className="text-slate-300 hover:text-white hover:bg-slate-700/50 flex items-center gap-2 px-3 h-8 rounded-lg"
                    >
                      <LucideIcons.ThumbsUp
                        className={cn(
                          "h-4 w-4",
                          isLiked && "fill-green-500 text-green-500"
                        )}
                      />
                      <span className="text-xs font-medium">
                        {likes > 1000 ? `${(likes / 1000).toFixed(1)}K` : likes}
                      </span>
                    </Button>

                    {/* Dislike Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-300 hover:text-white hover:bg-slate-700/50 flex items-center gap-2 px-3 h-8 rounded-lg"
                    >
                      <LucideIcons.ThumbsDown className="h-4 w-4" />
                      <span className="text-xs font-medium">
                        {dislikes > 1000
                          ? `${(dislikes / 1000).toFixed(1)}K`
                          : dislikes}
                      </span>
                    </Button>

                    {/* Favorite Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLike}
                      className="text-slate-300 hover:text-white hover:bg-slate-700/50 px-3 h-8 rounded-lg"
                    >
                      <LucideIcons.Heart
                        className={cn(
                          "h-4 w-4",
                          isLiked && "fill-red-500 text-red-500"
                        )}
                      />
                    </Button>

                    {/* Share Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-300 hover:text-white hover:bg-slate-700/50 px-3 h-8 rounded-lg"
                        >
                          <LucideIcons.Share2 className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-[#0f0f23] border-slate-700"
                      >
                        <DropdownMenuItem
                          onClick={shareOnFacebook}
                          className="text-slate-300 hover:text-white"
                        >
                          <LucideIcons.Facebook className="mr-2 h-4 w-4" />
                          Facebook
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={shareOnTwitter}
                          className="text-slate-300 hover:text-white"
                        >
                          <LucideIcons.Twitter className="mr-2 h-4 w-4" />
                          Twitter
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={copyLink}
                          className="text-slate-300 hover:text-white"
                        >
                          {isCopied ? (
                            <LucideIcons.Check className="mr-2 h-4 w-4 text-green-500" />
                          ) : (
                            <LucideIcons.Copy className="mr-2 h-4 w-4" />
                          )}
                          {isCopied ? "Copied!" : "Copy Link"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Fullscreen Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleFullscreen}
                      className="text-slate-300 hover:text-white hover:bg-slate-700/50 px-3 h-8 rounded-lg"
                    >
                      <LucideIcons.Maximize className="h-4 w-4" />
                    </Button>

                    {/* Full Page Link */}
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="text-slate-300 hover:text-white hover:bg-slate-700/50 px-3 h-8 rounded-lg"
                    >
                      <Link href={`/game/${game.slug}`}>
                        <LucideIcons.ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Game Info and Ads Section - now outside max-w-5xl */}
          <div className="mt-6 flex flex-col md:flex-row gap-6">
            {/* Left column: Banner Ad ngang + Game Info */}
            <div className="flex-1 flex flex-col gap-4">
              {/* Banner Ad ngang - top left */}
              <div className="bg-[#222b45] rounded-lg p-4">
                <div className="relative">
                  <div className="absolute -top-2 left-4 bg-[#222b45] px-2 text-xs text-slate-400 font-semibold uppercase z-10">
                    Quảng cáo 2
                  </div>
                  <div className="w-full min-h-[90px] flex items-center justify-center border border-slate-700">
                    {ad2 && ad2.code ? (
                      <div
                        className="w-full"
                        dangerouslySetInnerHTML={{ __html: ad2.code }}
                      />
                    ) : ad2 ? (
                      <a
                        href={ad2.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full"
                      >
                        <Image
                          src={ad2.image_url || "/placeholder.svg"}
                          alt={ad2.title}
                          width={1200}
                          height={90}
                          className="w-full h-auto min-h-[90px] object-cover"
                        />
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
              {/* Game Info */}
              <div className="bg-[#16213e] rounded-lg p-6">
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <LucideIcons.Share2 className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-300">Share</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LucideIcons.Download className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-300">Embed</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-white">
                      About {game.title}
                    </h3>
                    <p className="text-slate-300 leading-relaxed mb-4">
                      {game.description ||
                        "Experience this amazing game with stunning graphics and engaging gameplay."}
                    </p>

                    {/* Game Stats */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">Rating:</span>
                        <div className="flex items-center gap-1 mt-1">
                          {Array(5)
                            .fill(null)
                            .map((_, i) => (
                              <LucideIcons.Star
                                key={i}
                                className="h-4 w-4 fill-yellow-400 text-yellow-400"
                              />
                            ))}
                          <span className="text-slate-300 ml-1">4.8</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400">Released:</span>
                        <p className="text-slate-300 mt-1">
                          {new Date(
                            game.created_at || new Date().toISOString()
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400">Last Updated:</span>
                        <p className="text-slate-300 mt-1">
                          {new Date(
                            game.updated_at ||
                              game.created_at ||
                              new Date().toISOString()
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400">Technology:</span>
                        <p className="text-slate-300 mt-1">HTML5</p>
                      </div>
                    </div>

                    {/* Game Instructions */}
                    {game.instructions && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-3 text-white">
                          Controls
                        </h3>
                        <p className="text-slate-300 text-sm leading-relaxed">
                          {game.instructions}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>{/* Empty div to maintain grid layout */}</div>
                </div>
              </div>
            </div>

            {/* Right: Ads Section */}
            <div className="w-full md:w-80 flex-shrink-0 flex flex-col gap-6">
              {/* Quảng cáo dọc trên cùng */}
              <div className="bg-[#222b45] rounded-lg p-4">
                <div className="relative">
                  <div className="absolute -top-2 left-4 bg-[#222b45] px-2 text-xs text-slate-400 font-semibold uppercase z-10">
                    Quảng cáo 1
                  </div>
                  <div className="w-full min-h-[250px] flex items-center justify-center border border-slate-700">
                    {ad1 && ad1.code ? (
                      <div
                        className="w-full"
                        dangerouslySetInnerHTML={{ __html: ad1.code }}
                      />
                    ) : ad1 ? (
                      <a
                        href={ad1.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-lg overflow-hidden w-full"
                      >
                        <Image
                          src={ad1.image_url || "/placeholder.svg"}
                          alt={ad1.title}
                          width={300}
                          height={250}
                          className="w-full h-auto min-h-[250px] object-cover"
                        />
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Quảng cáo dài, cao phía dưới */}
              <div className="bg-[#222b45] rounded-lg p-4">
                <div className="relative">
                  <div className="absolute -top-2 left-4 bg-[#222b45] px-2 text-xs text-slate-400 font-semibold uppercase z-10">
                    Quảng cáo 3
                  </div>
                  <div className="w-full min-h-[600px] flex items-center justify-center border border-slate-700">
                    {ad3 && ad3.code ? (
                      <div
                        className="w-full"
                        dangerouslySetInnerHTML={{ __html: ad3.code }}
                      />
                    ) : ad3 ? (
                      <a
                        href={ad3.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-lg overflow-hidden w-full"
                      >
                        <Image
                          src={ad3.image_url || "/placeholder.svg"}
                          alt={ad3.title}
                          width={300}
                          height={600}
                          className="w-full h-auto min-h-[600px] object-cover"
                        />
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - CrazyGames grid style */}
        <div className="w-80 bg-[#0f0f23] p-4 overflow-y-auto max-h-screen hide-scrollbar">
          <div className="space-y-6">
            {/* Related Games Grid */}
            <div>
              {/* Quảng cáo phía trên More Games */}
              <div className="bg-[#222b45] rounded-lg p-4">
                <div className="relative">
                  <div className="absolute -top-2 left-4 bg-[#222b45] px-2 text-xs text-slate-400 font-semibold uppercase z-10">
                    Quảng cáo 4
                  </div>
                  <div className="w-full min-h-[250px] flex items-center justify-center border border-slate-700">
                    {advertisements.length > 4 ? (
                      <a
                        href={advertisements[4].link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full"
                      >
                        <Image
                          src={
                            advertisements[4].image_url || "/placeholder.svg"
                          }
                          alt={advertisements[4].title}
                          width={300}
                          height={250}
                          className="w-full h-auto min-h-[250px] object-cover"
                        />
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
              <h3 className="font-semibold mb-4 text-white text-lg">
                {game.category ? `More ${game.category} Games` : "More Games"}
              </h3>

              {isLoadingRelated ? (
                <div className="grid grid-cols-2 gap-3">
                  {Array(20)
                    .fill(null)
                    .map((_, i) => (
                      <div
                        key={i}
                        className="aspect-video bg-slate-700/50 rounded-lg animate-pulse"
                      ></div>
                    ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {relatedGames.map((relatedGame) => (
                    <Link
                      key={relatedGame.id}
                      href={`/game/${relatedGame.slug}`}
                      className="group relative aspect-video overflow-hidden rounded-lg bg-slate-800 hover:ring-2 hover:ring-[#7c3aed] transition-all"
                    >
                      <Image
                        src={relatedGame.thumbnail || "/placeholder.svg"}
                        alt={relatedGame.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                        sizes="160px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-2 left-2 right-2">
                          <h4 className="text-white text-xs font-medium truncate">
                            {relatedGame.title}
                          </h4>
                        </div>
                      </div>
                    </Link>
                  ))}

                  {relatedGames.length === 0 && (
                    <div className="col-span-2 text-center py-8">
                      <p className="text-slate-400 text-sm">
                        No related games found
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
