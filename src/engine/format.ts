/**
 * Locale-aware formatting. `formatLocale` may differ from the content locale (ADR-006):
 * English content can be formatted as en-US, en-GB or en-IN (lakh/crore) per user preference.
 */
export type NumberFormatKind = 'number' | 'currency' | 'percent' | 'integer';

export interface FormatOptions {
  kind?: NumberFormatKind;
  currency?: string;
  /** Fixed decimals; overrides min/max. */
  decimals?: number;
  maxDecimals?: number;
  /** Number of significant digits (for very large/small physics results). */
  significant?: number;
  /** 'native' renders the locale's own digits (e.g. Arabic-Indic); default Latin. */
  digits?: 'latn' | 'native';
  signDisplay?: Intl.NumberFormatOptions['signDisplay'];
}

const cache = new Map<string, Intl.NumberFormat>();

function formatter(locale: string, o: FormatOptions): Intl.NumberFormat {
  const key = `${locale}|${JSON.stringify(o)}`;
  let f = cache.get(key);
  if (!f) {
    const opts: Intl.NumberFormatOptions = { signDisplay: o.signDisplay ?? 'auto' };
    if (o.kind === 'currency') {
      opts.style = 'currency';
      opts.currency = o.currency ?? 'USD';
    }
    if (o.kind === 'percent') opts.style = 'percent';
    if (o.significant !== undefined) {
      opts.maximumSignificantDigits = o.significant;
    } else if (o.decimals !== undefined) {
      opts.minimumFractionDigits = o.decimals;
      opts.maximumFractionDigits = o.decimals;
    } else if (o.kind === 'integer') {
      opts.maximumFractionDigits = 0;
    } else if (o.maxDecimals !== undefined) {
      opts.maximumFractionDigits = o.maxDecimals;
    }
    const tag = o.digits === 'native' ? locale : `${locale}-u-nu-latn`;
    f = new Intl.NumberFormat(tag, opts);
    cache.set(key, f);
  }
  return f;
}

export function formatNumber(value: number, locale: string, o: FormatOptions = {}): string {
  if (!Number.isFinite(value)) return value > 0 ? '∞' : value < 0 ? '−∞' : '—';
  // Avoid "-0".
  const v = Object.is(value, -0) ? 0 : value;
  // Intl's 'percent' style multiplies by 100; our percent values are already in percent units.
  const input = o.kind === 'percent' ? v / 100 : v;
  return formatter(locale, o).format(input).replace(/^-/, '−');
}

/** Region-aware locale for English content, e.g. ('en', 'IN') → 'en-IN'. */
export function formatLocaleFor(contentLocale: string, region?: string | null): string {
  if (!region) return contentLocale;
  return `${contentLocale.split('-')[0]}-${region.toUpperCase()}`;
}
