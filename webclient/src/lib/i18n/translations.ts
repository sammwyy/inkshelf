import { en } from './locales/en';
import { es } from './locales/es';

export const translations = {
  en,
  es,
};

export type Language = keyof typeof translations;
