import { Game } from './supabase'
import { GAME_TABS, GAME_STATUS, GAME_FORM_TABS } from '@/constants/game-constants'

/**
 * Types for Game management UI
 */

export interface GameStats {
  totalGames: number
  categories: number
  seoOptimized: number
  addedThisWeek: number
}

export interface GameFilters {
  searchQuery: string
  selectedCategory: string
  status: typeof GAME_TABS[keyof typeof GAME_TABS]
}

export type GameStatus = typeof GAME_STATUS[keyof typeof GAME_STATUS]
export type GameFormTab = typeof GAME_FORM_TABS[keyof typeof GAME_FORM_TABS]

export interface GameDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export interface EditGameDialogProps extends GameDialogProps {
  game: Game
}

export interface DeleteGameDialogProps extends GameDialogProps {
  game: Game | null
} 