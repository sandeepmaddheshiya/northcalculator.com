import { defineRouting } from 'next-intl/routing';
import { DEFAULT_LOCALE, LIVE_LOCALE_CODES } from './locales';

export const routing = defineRouting({
  locales: LIVE_LOCALE_CODES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'always',
  // ADR-010 / BRIEF §8: never auto-redirect by Accept-Language or IP.
  localeDetection: false,
});
