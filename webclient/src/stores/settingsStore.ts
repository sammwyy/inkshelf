
import { create } from 'zustand';
import { Language } from '../lib/i18n/translations';

type Theme = 'light' | 'dark';

interface SettingsState {
  language: Language;
  theme: Theme;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  language: (localStorage.getItem('inkshelf_lang') as Language) || 'es',
  theme: (localStorage.getItem('inkshelf_theme') as Theme) || 'dark',
  setLanguage: (lang) => {
    localStorage.setItem('inkshelf_lang', lang);
    set({ language: lang });
  },
  setTheme: (theme) => {
    localStorage.setItem('inkshelf_theme', theme);
    set({ theme });
  },
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('inkshelf_theme', newTheme);
    return { theme: newTheme };
  }),
}));
