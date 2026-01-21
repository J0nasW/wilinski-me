import type { Lang } from './index';
import { languages, defaultLang } from './index';

/**
 * Format a date according to locale
 */
export function formatDate(date: Date, lang: Lang, options?: Intl.DateTimeFormatOptions): string {
  const localeMap: Record<Lang, string> = {
    en: 'en-US',
    de: 'de-DE',
  };

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  return date.toLocaleDateString(localeMap[lang], options || defaultOptions);
}

/**
 * Format a short date (e.g., "Jan 15, 2024" or "15. Jan. 2024")
 */
export function formatShortDate(date: Date, lang: Lang): string {
  const localeMap: Record<Lang, string> = {
    en: 'en-US',
    de: 'de-DE',
  };

  return date.toLocaleDateString(localeMap[lang], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get localized path for a given route
 */
export function getLocalizedPath(path: string, lang: Lang): string {
  // Remove leading slash and any existing language prefix
  let cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // Check if path already starts with a language prefix
  for (const l of Object.keys(languages)) {
    if (cleanPath.startsWith(`${l}/`) || cleanPath === l) {
      cleanPath = cleanPath.slice(l.length);
      if (cleanPath.startsWith('/')) {
        cleanPath = cleanPath.slice(1);
      }
      break;
    }
  }

  // Build new path with language prefix
  return `/${lang}${cleanPath ? `/${cleanPath}` : ''}`;
}

/**
 * Get the alternate language path (for language switcher)
 */
export function getAlternateLanguagePath(currentPath: string, currentLang: Lang, targetLang: Lang): string {
  // Remove current language prefix
  let path = currentPath;
  if (path.startsWith(`/${currentLang}/`)) {
    path = path.slice(currentLang.length + 1);
  } else if (path === `/${currentLang}`) {
    path = '/';
  }

  // Add target language prefix
  if (path === '/') {
    return `/${targetLang}`;
  }
  return `/${targetLang}${path}`;
}

/**
 * Get all supported languages
 */
export function getSupportedLanguages(): Lang[] {
  return Object.keys(languages) as Lang[];
}

/**
 * Check if a language is supported
 */
export function isValidLang(lang: string): lang is Lang {
  return lang in languages;
}
