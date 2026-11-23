/**
 * Locale registry. Adding a locale = add an entry here + a messages/<code>.json file
 * + translated calculator content. A locale is only routed when `status: 'live'`
 * (BRIEF §8: no untranslated pages may exist under a locale).
 */
export type LocaleStatus = 'live' | 'planned';
export type Script =
  | 'latin'
  | 'cyrillic'
  | 'greek'
  | 'devanagari'
  | 'bengali'
  | 'arabic'
  | 'thai'
  | 'japanese'
  | 'korean'
  | 'chinese';

export interface LocaleConfig {
  /** URL segment and BCP-47 tag used for hreflang. */
  code: string;
  /** Native name for the locale switcher. */
  name: string;
  dir: 'ltr' | 'rtl';
  script: Script;
  status: LocaleStatus;
}

export const LOCALES = [
  { code: 'en', name: 'English', dir: 'ltr', script: 'latin', status: 'live' },
  { code: 'es', name: 'Español', dir: 'ltr', script: 'latin', status: 'planned' },
  { code: 'hi', name: 'हिन्दी', dir: 'ltr', script: 'devanagari', status: 'planned' },
  { code: 'pt-BR', name: 'Português (Brasil)', dir: 'ltr', script: 'latin', status: 'planned' },
  { code: 'fr', name: 'Français', dir: 'ltr', script: 'latin', status: 'planned' },
  { code: 'de', name: 'Deutsch', dir: 'ltr', script: 'latin', status: 'planned' },
  { code: 'id', name: 'Bahasa Indonesia', dir: 'ltr', script: 'latin', status: 'planned' },
  { code: 'ar', name: 'العربية', dir: 'rtl', script: 'arabic', status: 'planned' },
  { code: 'ru', name: 'Русский', dir: 'ltr', script: 'cyrillic', status: 'planned' },
  { code: 'tr', name: 'Türkçe', dir: 'ltr', script: 'latin', status: 'planned' },
  { code: 'ja', name: '日本語', dir: 'ltr', script: 'japanese', status: 'planned' },
  { code: 'it', name: 'Italiano', dir: 'ltr', script: 'latin', status: 'planned' },
  { code: 'nl', name: 'Nederlands', dir: 'ltr', script: 'latin', status: 'planned' },
  { code: 'pl', name: 'Polski', dir: 'ltr', script: 'latin', status: 'planned' },
  { code: 'vi', name: 'Tiếng Việt', dir: 'ltr', script: 'latin', status: 'planned' },
  { code: 'th', name: 'ไทย', dir: 'ltr', script: 'thai', status: 'planned' },
  { code: 'ko', name: '한국어', dir: 'ltr', script: 'korean', status: 'planned' },
  { code: 'zh-CN', name: '简体中文', dir: 'ltr', script: 'chinese', status: 'planned' },
  { code: 'bn', name: 'বাংলা', dir: 'ltr', script: 'bengali', status: 'planned' },
  { code: 'ur', name: 'اردو', dir: 'rtl', script: 'arabic', status: 'planned' },
] as const satisfies readonly LocaleConfig[];

export type AnyLocale = (typeof LOCALES)[number]['code'];
type LiveEntry = Extract<(typeof LOCALES)[number], { status: 'live' }>;
export type Locale = LiveEntry['code'];

export const liveLocales = LOCALES.filter((l): l is LiveEntry => l.status === 'live');
export const LIVE_LOCALE_CODES = liveLocales.map((l) => l.code) as Locale[];
export const DEFAULT_LOCALE: Locale = 'en';

export function getLocaleConfig(code: string): LocaleConfig | undefined {
  return LOCALES.find((l) => l.code === code);
}

export function isLiveLocale(code: string): code is Locale {
  return (LIVE_LOCALE_CODES as string[]).includes(code);
}
