import { LucideIcon } from 'lucide-react';

/**
 * Pixely Partners - Shared Types
 */

export interface NavItem {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  badge?: number;
}