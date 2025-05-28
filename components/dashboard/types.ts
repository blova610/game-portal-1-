export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => React.ReactNode;
}

export interface TableFilters {
  searchQuery: string;
  selectedFilter?: string;
  status?: string;
}

export interface TableStats {
  total: number;
  filtered: number;
  [key: string]: number;
}

export interface BaseCrudProps<T> {
  tableName: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface BaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
} 