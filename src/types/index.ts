export type ToolCategory =
  | 'image'
  | 'pdf'
  | 'text'
  | 'qr'
  | 'calculators'
  | 'converters'
  | 'security';

export interface CategoryMeta {
  id: ToolCategory;
  name: string;
  description: string;
  badgeColor: string;
  iconBg: string;
  iconColor: string;
  borderAccent: string;
  cardBg: string;
}

export interface ToolDefinition {
  id: string;
  name: string;
  category: ToolCategory;
  description: string;
  icon: string; // Lucide icon name
  route: string;
  keywords: string[];
}

export type ThemeMode = 'light' | 'dark' | 'system';
export type Language = 'en' | 'hi' | 'bn';

// Core Domain Contracts (Phase 3.2)
export * from '../core/types/asset';
export * from '../core/types/dna';
export * from '../core/types/workflow';
export * from '../core/memory/objectUrlManager';
