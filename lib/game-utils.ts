// lib/game-utils.ts

import type { Database } from "@/types/supabase"
type GameInsert = Database["public"]["Tables"]["games"]["Insert"];
import { supabaseServer, getSupabaseBrowser } from "./supabase"

// Existing code here

export async function getGames(limit = 12, offset = 0, category?: string) {
  try {
    // Use browser client as fallback if server client fails
    const supabase = supabaseServer || getSupabaseBrowser()

    // Return empty array if Supabase is not configured
    if (!supabase) {
      console.warn("Supabase is not configured, returning empty games array")
      return []
    }

    let query = supabase
      .from("games")
      .select("*, likes(count)")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (category) {
      query = query.eq("category", category)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching games:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getGames:", error)
    return []
  }
}

export async function getGameBySlug(slug: string, skipCache = false) {
  try {
    const supabase = supabaseServer || getSupabaseBrowser()

    // Return null if Supabase is not configured
    if (!supabase) {
      console.warn("Supabase is not configured, returning null for game")
      return null
    }

    let query = supabase.from("games").select("*, likes(count)").eq("slug", slug).single()

    // Add cache control if needed
    if (skipCache) {
      query = query.options({ head: false })
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching game:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getGameBySlug:", error)
    return null
  }
}

export async function getGameCategories() {
  try {
    const supabase = supabaseServer || getSupabaseBrowser()

    // Return empty array if Supabase is not configured
    if (!supabase) {
      console.warn("Supabase is not configured, returning empty categories array")
      return []
    }

    const { data, error } = await supabase.from("games").select("category").not("category", "is", null)

    if (error) {
      console.error("Error fetching categories:", error)
      return []
    }

    // Extract unique categories
    const categories = [...new Set(data?.map((game: any) => game.category).filter(Boolean))]
    return categories
  } catch (error) {
    console.error("Error in getGameCategories:", error)
    return []
  }
}

export async function getGamesByCategory(category: string, limit = 12, excludeGameId?: number) {
  try {
    const supabase = supabaseServer || getSupabaseBrowser()

    // Return empty array if Supabase is not configured
    if (!supabase) {
      console.warn("Supabase is not configured, returning empty games array")
      return []
    }

    let query = supabase
      .from("games")
      .select("*")
      .eq("category", category)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (excludeGameId) {
      query = query.neq("id", excludeGameId)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching games by category:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getGamesByCategory:", error)
    return []
  }
}

export async function getLikesCount(gameId: number) {
  try {
    const supabase = getSupabaseBrowser()

    // Return 0 if Supabase is not configured
    if (!supabase) {
      console.warn("Supabase is not configured, returning 0 likes")
      return 0
    }

    const { data, error } = await supabase.from("likes").select("id").eq("game_id", gameId)

    if (error) {
      console.error("Error fetching likes count:", error)
      return 0
    }

    return data?.length || 0
  } catch (error) {
    console.error("Error in getLikesCount:", error)
    return 0
  }
}

export async function likeGame(gameId: number, userId: string) {
  try {
    const supabase = getSupabaseBrowser()

    // Return false if Supabase is not configured
    if (!supabase) {
      console.warn("Supabase is not configured, cannot like game")
      return false
    }

    const { data, error } = await supabase.from("likes").insert({ game_id: gameId, user_id: userId }).select()

    if (error) {
      if (error.code === "23505") {
        // Unique violation - user already liked this game, so unlike it
        return unlikeGame(gameId, userId)
      }
      console.error("Error liking game:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in likeGame:", error)
    return false
  }
}

export async function unlikeGame(gameId: number, userId: string) {
  try {
    const supabase = getSupabaseBrowser()

    // Return false if Supabase is not configured
    if (!supabase) {
      console.warn("Supabase is not configured, cannot unlike game")
      return false
    }

    const { error } = await supabase.from("likes").delete().match({ game_id: gameId, user_id: userId })

    if (error) {
      console.error("Error unliking game:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in unlikeGame:", error)
    return false
  }
}

export async function hasUserLikedGame(gameId: number, userId: string) {
  try {
    const supabase = getSupabaseBrowser()

    // Return false if Supabase is not configured
    if (!supabase) {
      console.warn("Supabase is not configured, returning false for user liked game")
      return false
    }

    const { data, error } = await supabase
      .from("likes")
      .select("id")
      .match({ game_id: gameId, user_id: userId })
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return false
      }
      console.error("Error checking if user liked game:", error)
      return false
    }

    return !!data
  } catch (error) {
    console.error("Error in hasUserLikedGame:", error)
    return false
  }
}

export function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

export async function fetchGamesFromApi(apiUrl: string) {
  try {
    const response = await fetch(apiUrl)
    const data = await response.json()

    if (!data.success || !Array.isArray(data.data)) {
      throw new Error("Invalid API response format")
    }

    return data.data.map((game: any) => ({
      title: game.title,
      slug: generateSlug(game.title),
      thumbnail: game.thumbnail,
      game_url: game.game_url,
      description: game.description || null,
      instructions: game.instructions || null,
      category: game.category || null,
    }))
  } catch (error) {
    console.error("Error fetching games from API:", error)
    return []
  }
}

export async function addGameToDatabase(game: GameInsert) {
  try {
    const supabase = supabaseServer || getSupabaseBrowser()

    // Return null if Supabase is not configured
    if (!supabase) {
      console.warn("Supabase is not configured, cannot add game to database")
      return null
    }

    const { data, error } = await supabase.from("games").insert(game).select().single()

    if (error) {
      console.error("Error adding game to database:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in addGameToDatabase:", error)
    return null
  }
}

// New functions for homepage configuration
export async function getNavigationItems(isFixed?: boolean) {
  // Default navigation items to use as fallback
  const defaultNavItems = [
    { id: 1, label: "Home", href: "/", icon: "Home", color: "text-blue-400", order_index: 1, is_fixed: true },
    {
      id: 2,
      label: "Categories",
      href: "/categories",
      icon: "Grid",
      color: "text-green-400",
      order_index: 2,
      is_fixed: true,
    },
    {
      id: 3,
      label: "Popular",
      href: "/popular",
      icon: "Flame",
      color: "text-orange-400",
      order_index: 3,
      is_fixed: true,
    },
    {
      id: 4,
      label: "New Games",
      href: "/new",
      icon: "Sparkle",
      color: "text-yellow-400",
      order_index: 4,
      is_fixed: true,
    },
  ]

  try {
    // Try to get Supabase client, but don't throw if not available
    const supabase = supabaseServer || getSupabaseBrowser()

    // If Supabase is not available, return default navigation items
    if (!supabase) {
      console.warn("Supabase client not available, returning default navigation items")
      return defaultNavItems
    }

    // Add timeout to prevent hanging requests
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    let query = supabase
      .from("navigation_items")
      .select("*")
      .eq("is_active", true)
      .order("order_index", { ascending: true })

    if (isFixed !== undefined) {
      query = query.eq("is_fixed", isFixed)
    }

    const { data, error } = await query.abortSignal(controller.signal)

    // Clear the timeout
    clearTimeout(timeoutId)

    if (error) {
      console.error("Error fetching navigation items:", error)
      return defaultNavItems
    }

    return data && data.length > 0 ? data : defaultNavItems
  } catch (error) {
    console.error("Error in getNavigationItems:", error)
    return defaultNavItems
  }
}

export async function getHomepageConfig(key: string) {
  try {
    const supabase = supabaseServer || getSupabaseBrowser()

    // If Supabase is not available, return default values
    if (!supabase) {
      console.warn("Supabase client not available, returning default homepage config")
      const defaults: Record<string, any> = {
        featured_game_id: 1,
        games_per_sidebar: 20,
        show_advertisements: true,
        theme_colors: { primary: "#7c3aed", background: "#0f0f23", sidebar: "#16213e" },
      }
      return defaults[key] || null
    }

    const { data, error } = await supabase.from("homepage_config").select("value").eq("key", key).single()

    if (error) {
      console.error(`Error fetching homepage config for key ${key}:`, error)
      return null
    }

    return data?.value
  } catch (error) {
    console.error(`Error in getHomepageConfig for key ${key}:`, error)
    return null
  }
}

export async function getAllHomepageConfig() {
  try {
    const supabase = supabaseServer || getSupabaseBrowser()

    // If Supabase is not available, return default values
    if (!supabase) {
      console.warn("Supabase client not available, returning default homepage config")
      return {
        featured_game_id: 1,
        games_per_sidebar: 20,
        show_advertisements: true,
        theme_colors: { primary: "#7c3aed", background: "#0f0f23", sidebar: "#16213e" },
      }
    }

    const { data, error } = await supabase.from("homepage_config").select("key, value")

    if (error) {
      console.error("Error fetching all homepage config:", error)
      return {}
    }

    // Convert array to object
    return data.reduce(
      (acc: any, item: any) => {
        acc[item.key] = item.value
        return acc
      },
      {} as Record<string, any>,
    )
  } catch (error) {
    console.error("Error in getAllHomepageConfig:", error)
    return {}
  }
}

export async function getAdvertisements(position?: string) {
  try {
    const supabase = supabaseServer || getSupabaseBrowser();

    if (!supabase) {
      console.warn("Supabase client not available, returning empty advertisements array");
      return [];
    }

    let query = supabase.from("advertisements").select("*").eq("is_active", true);
    if (position) {
      query = query.eq("position", position);
    }

    const { data, error } = await query;

    if (error) {
      console.error(`Error fetching advertisements${position ? ` for position ${position}` : ""}:`, error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error(`Error in getAdvertisements${position ? ` for position ${position}` : ""}:`, error);
    return [];
  }
}

// Sample games data for seeding
export const SAMPLE_GAMES: GameInsert[] = [
  {
    title: "2048",
    slug: "2048",
    thumbnail: "/placeholder.svg?height=200&width=300&text=2048",
    game_url: "https://play2048.co/",
    description: "Join the numbers and get to the 2048 tile! A simple yet addictive puzzle game.",
    instructions: "Use arrow keys to move tiles. When two tiles with the same number touch, they merge into one!",
    category: "Puzzle",
    meta_title: "Play 2048 - Number Puzzle Game",
    meta_description: "Play the addictive 2048 puzzle game online for free. Join numbers to reach 2048!",
    robots: "index, follow",
    keywords: "2048, puzzle game, number game, brain teaser",
  },
  {
    title: "Snake Game",
    slug: "snake-game",
    thumbnail: "/placeholder.svg?height=200&width=300&text=Snake",
    game_url: "https://www.google.com/fbx?fbx=snake_arcade",
    description: "The classic Snake game! Eat food to grow longer while avoiding walls and your own tail.",
    instructions: "Use arrow keys to control the snake. Eat the food to grow and increase your score!",
    category: "Arcade",
    meta_title: "Play Snake Game - Classic Arcade Game",
    meta_description: "Play the classic Snake game online for free. Eat food, grow longer, and beat your high score!",
    robots: "index, follow",
    keywords: "snake game, arcade game, classic game, retro",
  },
  {
    title: "Tetris",
    slug: "tetris",
    thumbnail: "/placeholder.svg?height=200&width=300&text=Tetris",
    game_url: "https://tetris.com/play-tetris",
    description: "The legendary puzzle game! Arrange falling blocks to create complete lines.",
    instructions: "Use arrow keys to move and rotate blocks. Complete horizontal lines to clear them!",
    category: "Puzzle",
    meta_title: "Play Tetris - Classic Block Puzzle Game",
    meta_description: "Play the classic Tetris puzzle game online. Arrange blocks and clear lines!",
    robots: "index, follow",
    keywords: "tetris, puzzle game, block game, classic",
  },
  {
    title: "Pac-Man",
    slug: "pac-man",
    thumbnail: "/placeholder.svg?height=200&width=300&text=Pac-Man",
    game_url: "https://www.google.com/doodles/30th-anniversary-of-pac-man",
    description: "The iconic arcade game! Navigate mazes, eat dots, and avoid ghosts.",
    instructions: "Click on a piece to select it, then click where you want to move. Checkmate the king to win!",
    category: "Arcade",
    meta_title: "Play Pac-Man - Classic Arcade Game",
    meta_description: "Play the iconic Pac-Man arcade game online for free. Navigate mazes and eat dots!",
    robots: "index, follow",
    keywords: "pac-man, arcade game, maze game, classic",
  },
  {
    title: "Solitaire",
    slug: "solitaire",
    thumbnail: "/placeholder.svg?height=200&width=300&text=Solitaire",
    game_url: "https://www.solitr.com/",
    description: "The classic card game! Arrange cards in descending order to win.",
    instructions: "Click and drag cards to move them. Build sequences from King to Ace!",
    category: "Card",
    meta_title: "Play Solitaire - Classic Card Game",
    meta_description: "Play the classic Solitaire card game online for free. Arrange cards and win!",
    robots: "index, follow",
    keywords: "solitaire, card game, patience, classic",
  },
  {
    title: "Chess",
    slug: "chess",
    thumbnail: "/placeholder.svg?height=200&width=300&text=Chess",
    game_url: "https://www.chess.com/play/computer",
    description: "The ultimate strategy game! Play against the computer or challenge friends.",
    instructions: "Click on a piece to select it, then click where you want to move. Checkmate the king to win!",
    category: "Strategy",
    meta_title: "Play Chess Online - Strategy Board Game",
    meta_description: "Play chess online for free. Challenge the computer or play with friends!",
    robots: "index, follow",
    keywords: "chess, strategy game, board game, thinking game",
  },
]

export async function seedSampleGames() {
  try {
    // First check if games already exist
    const supabase = getSupabaseBrowser()

    // Return false if Supabase is not configured
    if (!supabase) {
      console.warn("Supabase is not configured, cannot seed sample games")
      return false
    }

    const { data: existingGames } = await supabase.from("games").select("id").limit(1)

    if (existingGames && existingGames.length > 0) {
      console.log("Games already exist, skipping seed")
      return false
    }

    // Try to use service role client first (bypasses RLS)
    let insertClient = supabaseServer

    // If no service role available, we need to temporarily disable RLS or use a different approach
    if (!insertClient || insertClient === getSupabaseBrowser()) {
      insertClient = getSupabaseBrowser()
    }

    if (!insertClient) {
      console.warn("Insert client is null, cannot seed sample games")
      return false;
    }

    // Insert sample games
    const { data, error } = await insertClient.from("games").insert(SAMPLE_GAMES).select()

    if (error) {
      console.error("Error seeding games:", error)

      // If RLS error, suggest manual insertion
      if (error.message.includes("row-level security policy")) {
        throw new Error("RLS policy prevents insertion. Please temporarily disable RLS or use service role key.")
      }

      return false
    }

    console.log(`Successfully seeded ${data?.length || 0} games`)
    return true
  } catch (error) {
    console.error("Error in seedSampleGames:", error)
    throw error
  }
}

// New function to get games liked by a user
export async function getUserLikedGames(userId: string) {
  try {
    const supabase = supabaseServer || getSupabaseBrowser()

    // Return empty array if Supabase is not configured
    if (!supabase) {
      console.warn("Supabase is not configured, returning empty liked games array")
      return []
    }

    // First get all the game IDs that the user has liked
    const { data: likes, error: likesError } = await supabase.from("likes").select("game_id").eq("user_id", userId)

    if (likesError) {
      console.error("Error fetching user likes:", likesError)
      return []
    }

    if (!likes || likes.length === 0) {
      return []
    }

    // Extract game IDs from likes
    const gameIds = likes.map((like: any) => like.game_id)

    // Fetch the actual games
    const { data: games, error: gamesError } = await supabase
      .from("games")
      .select("*")
      .in("id", gameIds)
      .order("title", { ascending: true })

    if (gamesError) {
      console.error("Error fetching liked games:", gamesError)
      return []
    }

    return games || []
  } catch (error) {
    console.error("Error in getUserLikedGames:", error)
    return []
  }
}

// New function to update homepage configuration
export async function updateHomepageConfig(key: string, value: any) {
  try {
    const supabase = getSupabaseBrowser()

    // Return false if Supabase is not configured
    if (!supabase) {
      console.warn("Supabase is not configured, cannot update homepage config")
      return false
    }

    // Convert value to string if it's an object
    const stringValue = typeof value === "object" ? JSON.stringify(value) : String(value)

    // Check if config exists
    const { data: existingConfig } = await supabase.from("homepage_config").select("id").eq("key", key).single()

    if (existingConfig) {
      // Update existing config
      const { error } = await supabase.from("homepage_config").update({ value: stringValue }).eq("key", key)

      if (error) {
        console.error(`Error updating homepage config for key ${key}:`, error)
        return false
      }
    } else {
      // Insert new config
      const { error } = await supabase.from("homepage_config").insert({ key, value: stringValue })

      if (error) {
        console.error(`Error inserting homepage config for key ${key}:`, error)
        return false
      }
    }

    return true
  } catch (error) {
    console.error(`Error in updateHomepageConfig for key ${key}:`, error)
    return false
  }
}
