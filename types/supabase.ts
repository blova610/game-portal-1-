/**
 * Database Types
 * These types represent the structure of our Supabase database tables
 */

export interface Advertisement {
  id: number
  title: string
  image_url: string
  link_url: string
  position: string
  code: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface Game {
  id: number
  title: string
  slug: string
  thumbnail: string
  game_url: string
  description: string | null
  instructions: string | null
  category: string | null
  meta_title: string | null
  meta_description: string | null
  keywords: string | null
  robots: string | null
  created_at?: string
  updated_at?: string
}

export interface HomepageConfig {
  id: number
  key: string
  value: any
  created_at: string
  updated_at: string
}

export interface NavigationItem {
  id: number
  label: string
  href: string
  icon: string
  color: string
  order_index: number
  is_fixed: boolean
  is_active: boolean
  created_at: string
  updated_at: string | null
}

export interface Profile {
  id: string
  username: string | null
  avatar_url: string | null
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface UserWithEmail extends Profile {
  email?: string;
}

export interface User {
  id: string
  email: string
  role: "admin" | "user"
  created_at?: string
  updated_at?: string
}

export interface Database {
  public: {
    Tables: {
      advertisements: {
        Row: Advertisement
        Insert: Omit<Advertisement, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<Advertisement, "id" | "created_at" | "updated_at">>
      }
      games: {
        Row: Game
        Insert: Omit<Game, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<Game, "id" | "created_at" | "updated_at">>
      }
      users: {
        Row: User
        Insert: Omit<User, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<User, "id" | "created_at" | "updated_at">>
      }
    }
  }
}
