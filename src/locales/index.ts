import { Language } from '../types';
import { LocaleData } from './types';
import { en } from './en';
import { hi } from './hi';
import { bn } from './bn';

export const LOCALES: Record<Language, LocaleData> = {
  en,
  hi,
  bn,
};

export const LANGUAGE_OPTIONS: { id: Language; label: string; nativeName: string }[] = [
  { id: 'en', label: 'English', nativeName: 'English' },
  { id: 'hi', label: 'Hindi', nativeName: 'हिंदी' },
  { id: 'bn', label: 'Bengali', nativeName: 'বাংলা' },
];

export * from './types';
