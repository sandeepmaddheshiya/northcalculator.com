import { formatNumber, formatSignificant } from '@/engine/format';
import { minorDigits } from '@/engine/money';
import { parseISODate } from '@/engine/dates';
import type { Fmt } from './types';

/** Currency-aware number locale: INR uses Indian grouping (lakh/crore) inside English (ADR-006). */
export function moneyLocale(locale: string, currency: string): string {
  if (locale === 'en' && currency === 'INR') return 'en-IN';
  return locale;
}

export function makeFmt(locale: string, currency = 'USD'): Fmt {
  const ml = moneyLocale(locale, currency);
  const digits = minorDigits(currency);
  return {
    locale,
    currency,
    money: (n, decimals = digits) => formatNumber(n, ml, { kind: 'currency', currency, decimals }),
    num: (n, maxDecimals = 4) => formatNumber(n, ml, { maxDecimals }),
    int: (n) => formatNumber(n, ml, { kind: 'integer' }),
    sig: (n, digits = 10) => formatSignificant(n, ml, digits),
    pct: (n, maxDecimals = 2) => formatNumber(n, ml, { kind: 'percent', maxDecimals }),
    date: (iso, style = 'long') => {
      const c = parseISODate(iso);
      if (!c) return iso;
      // Format a calendar date without time-zone shifts: build it at UTC noon, format in UTC.
      const d = new Date(Date.UTC(c.y, c.m - 1, c.d, 12));
      const opts: Intl.DateTimeFormatOptions =
        style === 'month'
          ? { month: 'long', year: 'numeric', timeZone: 'UTC' }
          : { dateStyle: style, timeZone: 'UTC' };
      return new Intl.DateTimeFormat(locale, opts).format(d);
    },
  };
}
