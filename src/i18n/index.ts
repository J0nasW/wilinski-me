import en from './translations/en.json';
import de from './translations/de.json';

export const languages = {
  en: 'English',
  de: 'Deutsch',
} as const;

export const defaultLang = 'en' as const;

export type Lang = keyof typeof languages;

export const translations = {
  en,
  de,
} as const;

type TranslationKey = keyof typeof en;

export function useTranslations(lang: Lang) {
  return function t(key: TranslationKey): string {
    return translations[lang][key] || translations[defaultLang][key] || key;
  };
}

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split('/');
  if (lang in languages) return lang as Lang;
  return defaultLang;
}

export function getRouteFromUrl(url: URL): string {
  const pathname = url.pathname;
  const segments = pathname.split('/').filter(Boolean);

  // Remove language prefix if present
  if (segments.length > 0 && segments[0] in languages) {
    segments.shift();
  }

  return '/' + segments.join('/');
}
