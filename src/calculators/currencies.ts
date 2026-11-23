import type { SelectInput } from './types';

/**
 * Currencies offered by money calculators (amount formatting only; no conversion happens).
 * Minor-unit digits come from Intl (ADR-017), so JPY rounds to whole yen and BHD-style
 * three-digit currencies work if added.
 */
export const MONEY_CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'INR',
  'CAD',
  'AUD',
  'NZD',
  'JPY',
  'CNY',
  'CHF',
  'SGD',
  'HKD',
  'AED',
  'SAR',
  'ZAR',
  'NGN',
  'KES',
  'EGP',
  'PKR',
  'BDT',
  'LKR',
  'NPR',
  'IDR',
  'PHP',
  'MYR',
  'THB',
  'VND',
  'KRW',
  'BRL',
  'MXN',
  'ARS',
  'CLP',
  'COP',
  'TRY',
  'PLN',
  'SEK',
  'NOK',
  'DKK',
  'CZK',
  'HUF',
  'ILS',
] as const;

export function currencySelect(def = 'USD'): SelectInput {
  return {
    id: 'cur',
    param: 'cur',
    type: 'select',
    labelKey: 'currency',
    default: def,
    options: MONEY_CURRENCIES.map((c) => ({ value: c, labelKey: `cur.${c}` })),
    advanced: true,
  };
}

/** UI labels for the currency select, e.g. "USD · US Dollar" (built on the server per locale). */
export function currencyUi(locale: string): Record<string, string> {
  const names = new Intl.DisplayNames([locale], { type: 'currency' });
  return Object.fromEntries(
    MONEY_CURRENCIES.map((c) => [`cur.${c}`, `${c} · ${names.of(c) ?? c}`]),
  );
}
