import type { GameStats, GameStatus } from '@/types/game';
import type { Game } from '@/types/supabase';
import { GAME_TABS, GAME_STATUS, GAME_STATUS_STYLES, DEFAULT_ROBOTS } from '@/constants/game-constants';

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function calculateGameStats(games: Game[]): GameStats {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return {
    totalGames: games.length,
    categories: new Set(games.map((game) => game.category).filter(Boolean)).size,
    seoOptimized: games.filter((game) => game.meta_title && game.meta_description).length,
    addedThisWeek: games.filter((game) => new Date(game.created_at || '') > weekAgo).length,
  };
}

export function filterGames(
  games: Game[],
  searchQuery: string,
  selectedCategory: string,
  status: typeof GAME_TABS[keyof typeof GAME_TABS]
) {
  return games.filter((game) => {
    const matchesSearch =
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || game.category === selectedCategory;
    
    const matchesStatus =
      status === GAME_TABS.ALL ||
      (status === GAME_TABS.PUBLISHED && game.robots?.includes('index')) ||
      (status === GAME_TABS.DRAFT && !game.robots?.includes('index'));

    return matchesSearch && matchesCategory && matchesStatus;
  });
}

export function getUniqueCategories(games: Game[]): string[] {
  return Array.from(
    new Set(games.map((game) => game.category).filter(Boolean))
  ).sort() as string[];
}

export function formatGameDate(date: string | undefined): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
}

export function getGameStatus(game: Game): GameStatus {
  return game.robots?.includes('index') ? GAME_STATUS.PUBLISHED : GAME_STATUS.DRAFT;
}

export function getGameStatusStyle(status: GameStatus): string {
  return GAME_STATUS_STYLES[status];
} 