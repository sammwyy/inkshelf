
import { useSettingsStore } from '../stores/settingsStore';
import { translations } from '../lib/i18n/translations';

export const useTranslation = () => {
  const language = useSettingsStore(state => state.language);
  const setLanguage = useSettingsStore(state => state.setLanguage);

  const t = (path: string) => {
    const keys = path.split('.');
    let current: any = translations[language];
    
    for (const key of keys) {
      if (current[key] === undefined) return path;
      current = current[key];
    }
    
    return current;
  };

  return { t, language, setLanguage };
};
