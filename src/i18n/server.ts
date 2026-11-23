import { notFound } from 'next/navigation';
import { isLiveLocale, type Locale } from './locales';

/** Narrow a route param to a live Locale or render the 404 page. */
export function resolveLocale(value: string): Locale {
  if (!isLiveLocale(value)) notFound();
  return value;
}
