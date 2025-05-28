export const ADVERTISEMENT_TABLE = 'advertisements';

export const AD_TABS = {
  ALL: 'all',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

export const AD_TAB_LABELS = {
  [AD_TABS.ALL]: 'All Advertisements',
  [AD_TABS.ACTIVE]: 'Active',
  [AD_TABS.INACTIVE]: 'Inactive',
} as const;

export const AD_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
} as const;

export const AD_STATUS_STYLES = {
  [AD_STATUS.ACTIVE]: 'bg-green-100 text-green-700',
  [AD_STATUS.INACTIVE]: 'bg-gray-100 text-gray-700',
} as const;

export const DEFAULT_AD_FORM = {
  title: '',
  image_url: '',
  link_url: '',
  position: '',
  code: '',
  is_active: true,
} as const;

export const AD_POSITIONS = [
  'header',
  'sidebar',
  'content-top',
  'content-bottom',
  'footer',
] as const;

export const AD_POSITION_1 = "position-1";
export const AD_POSITION_2 = "position-2";
export const AD_POSITION_3 = "position-3";
export const AD_POSITION_4 = "position-4"; 