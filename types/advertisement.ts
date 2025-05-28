import { Advertisement } from './supabase'
import { AD_TABS, AD_STATUS } from '@/constants/advertisement-constants'

/**
 * Types for Advertisement management UI
 */

export interface AdvertisementStats {
  totalAds: number;
  activeAds: number;
  positions: string[];
}

export interface AdvertisementFilters {
  searchQuery: string;
  selectedPosition: string;
  status: typeof AD_TABS[keyof typeof AD_TABS];
}

export type AdvertisementStatus = typeof AD_STATUS[keyof typeof AD_STATUS];

export interface AdvertisementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export interface EditAdvertisementDialogProps extends AdvertisementDialogProps {
  advertisement: Advertisement;
}

export interface DeleteAdvertisementDialogProps extends AdvertisementDialogProps {
  advertisement: Advertisement | null;
} 