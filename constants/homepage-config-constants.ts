export const HOMEPAGE_CONFIG_TABS = {
  ALL: "all",
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;

export const HOMEPAGE_CONFIG_TAB_LABELS = {
  [HOMEPAGE_CONFIG_TABS.ALL]: "All Configs",
  [HOMEPAGE_CONFIG_TABS.ACTIVE]: "Active",
  [HOMEPAGE_CONFIG_TABS.INACTIVE]: "Inactive",
} as const;

export const HOMEPAGE_CONFIG_STATUS = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
} as const;

export const HOMEPAGE_CONFIG_STATUS_STYLES = {
  [HOMEPAGE_CONFIG_STATUS.ACTIVE]: "bg-green-100 text-green-700",
  [HOMEPAGE_CONFIG_STATUS.INACTIVE]: "bg-gray-100 text-gray-700",
} as const; 