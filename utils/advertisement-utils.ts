import type { AdvertisementStats, AdvertisementStatus } from '@/types/advertisement';
import type { Advertisement } from '@/types/supabase';
import { AD_TABS, AD_STATUS, AD_STATUS_STYLES } from '@/constants/advertisement-constants';

export function calculateAdStats(advertisements: Advertisement[]): AdvertisementStats {
  const positions = Array.from(
    new Set(advertisements.map((ad) => ad.position))
  ).sort();
  
  return {
    totalAds: advertisements.length,
    activeAds: advertisements.filter((ad) => ad.is_active).length,
    positions,
  };
}

export function filterAdvertisements(
  advertisements: Advertisement[],
  searchQuery: string,
  selectedPosition: string,
  status: typeof AD_TABS[keyof typeof AD_TABS]
) {
  return advertisements.filter((ad) => {
    const matchesSearch = ad.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPosition = !selectedPosition || ad.position === selectedPosition;
    const matchesStatus =
      status === AD_TABS.ALL ||
      (status === AD_TABS.ACTIVE && ad.is_active) ||
      (status === AD_TABS.INACTIVE && !ad.is_active);

    return matchesSearch && matchesPosition && matchesStatus;
  });
}

export function getUniquePositions(advertisements: Advertisement[]): string[] {
  return Array.from(
    new Set(advertisements.map((ad) => ad.position))
  ).sort();
}

export function formatAdDate(date: string | undefined): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
}

export function getAdStatus(ad: Advertisement): AdvertisementStatus {
  return ad.is_active ? AD_STATUS.ACTIVE : AD_STATUS.INACTIVE;
}

export function getAdStatusStyle(status: AdvertisementStatus): string {
  return AD_STATUS_STYLES[status];
}

export function validateAdData(ad: Partial<Advertisement>): string[] {
  const errors: string[] = [];

  if (!ad.title?.trim()) {
    errors.push('Title is required');
  }

  if (!ad.image_url?.trim()) {
    errors.push('Image URL is required');
  }

  if (!ad.link_url?.trim()) {
    errors.push('Link URL is required');
  }

  if (!ad.position?.trim()) {
    errors.push('Position is required');
  }

  return errors;
} 