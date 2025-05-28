export const GAME_TABLE = 'games';

export const DEFAULT_ROBOTS = 'index, follow';

export const GAME_TABS = {
  ALL: 'all',
  PUBLISHED: 'published',
  DRAFT: 'draft',
} as const;

export const GAME_TAB_LABELS = {
  [GAME_TABS.ALL]: 'All Games',
  [GAME_TABS.PUBLISHED]: 'Published',
  [GAME_TABS.DRAFT]: 'Draft',
} as const;

export const GAME_FORM_TABS = {
  BASIC: 'basic',
  DETAILS: 'details',
  SEO: 'seo',
} as const;

export const GAME_FORM_TAB_LABELS = {
  [GAME_FORM_TABS.BASIC]: 'Basic Info',
  [GAME_FORM_TABS.DETAILS]: 'Game Details',
  [GAME_FORM_TABS.SEO]: 'SEO',
} as const;

export const GAME_STATUS = {
  PUBLISHED: 'Published',
  DRAFT: 'Draft',
} as const;

export const GAME_STATUS_STYLES = {
  [GAME_STATUS.PUBLISHED]: 'bg-green-100 text-green-700',
  [GAME_STATUS.DRAFT]: 'bg-gray-100 text-gray-700',
} as const;

export const DEFAULT_GAME_FORM = {
  title: '',
  slug: '',
  thumbnail: '',
  game_url: '',
  description: '',
  instructions: '',
  category: '',
  meta_title: '',
  meta_description: '',
  keywords: '',
  robots: DEFAULT_ROBOTS,
} as const; 