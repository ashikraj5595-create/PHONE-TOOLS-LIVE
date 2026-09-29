import { ToolCategory } from '../types';

export interface ToolTranslation {
  name: string;
  description: string;
}

export interface CategoryTranslation {
  name: string;
  description: string;
}

export interface LocaleData {
  tools: Record<string, ToolTranslation>;
  categories: Record<ToolCategory, CategoryTranslation>;
  strings: Record<string, string>;
}
