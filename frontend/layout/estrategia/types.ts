import { LucideIcon } from 'lucide-react';

export type NodeType = 'main' | 'secondary' | 'post';

export interface NodeData {
  id: string;
  type: NodeType;
  label: string;
  description?: string; // New field for long text
  parentId: string | null;
  x: number;
  y: number;
  color?: string;
  icon?: LucideIcon;
}

export interface NavItem {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  badge?: number;
}

export interface NewCourse {
  title: string;
  lessons: string | number;
  icon: LucideIcon;
  iconBg: string;
  rating: number;
  type: string;
}

export interface ScheduleItem {
  id: string;
  title: string;
  type: string;
  icon: LucideIcon;
  color: string;
  bg: string;
}

export interface Assignment {
  id: string;
  title: string;
  date: string;
  status: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}

export interface ActiveCourse {
  id: string;
  title: string;
  instructor: string;
  thumbnail: string;
  progress: number;
  remaining: string;
}