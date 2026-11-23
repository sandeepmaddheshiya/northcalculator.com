import 'server-only';
import { getTranslations } from 'next-intl/server';
import type { Locale } from './locales';
import type { SearchLabels } from '@/components/search/SearchDialog';
import type { ThemeLabels } from '@/components/layout/ThemeToggle';
import type { ValidationMessages } from '@/components/ui/NumberField';

/** Pre-translated label bundles for client islands (keeps the ICU runtime off the client). */
export async function searchLabels(locale: Locale): Promise<SearchLabels> {
  const t = await getTranslations({ locale, namespace: 'search' });
  return {
    open: t('open'),
    placeholder: t('placeholder'),
    label: t('label'),
    noResults: t.raw('noResults') as string,
    hint: t('hint'),
    results: t.raw('results') as string,
  };
}

export async function themeLabels(locale: Locale): Promise<ThemeLabels> {
  const t = await getTranslations({ locale, namespace: 'theme' });
  return { label: t('label'), system: t('system'), light: t('light'), dark: t('dark') };
}

export async function localeLabels(locale: Locale) {
  const t = await getTranslations({ locale, namespace: 'locale' });
  return { label: t('label'), current: t.raw('current') as string };
}

export async function validationMessages(locale: Locale): Promise<ValidationMessages> {
  const t = await getTranslations({ locale, namespace: 'validation' });
  const raw = (k: keyof ValidationMessages) => t.raw(k) as string;
  return {
    invalid: raw('invalid'),
    empty: raw('empty'),
    min: raw('min'),
    max: raw('max'),
    integer: raw('integer'),
    negative: raw('negative'),
  };
}

export type CalcChrome = Record<
  | 'inputs'
  | 'result'
  | 'copyLink'
  | 'linkCopied'
  | 'copyResult'
  | 'resultCopied'
  | 'print'
  | 'reset'
  | 'downloadCsv'
  | 'showSteps'
  | 'stepsHeading'
  | 'moreOptions'
  | 'backToResult'
  | 'ymylDisclaimer'
  | 'cannotCompute'
  | 'chartHeading'
  | 'tableHeading'
  | 'onDevice'
  | 'swap',
  string
>;

export async function calcChrome(locale: Locale): Promise<CalcChrome> {
  const t = await getTranslations({ locale, namespace: 'calc' });
  const keys = [
    'inputs',
    'result',
    'copyLink',
    'linkCopied',
    'copyResult',
    'resultCopied',
    'print',
    'reset',
    'downloadCsv',
    'showSteps',
    'stepsHeading',
    'moreOptions',
    'backToResult',
    'ymylDisclaimer',
    'cannotCompute',
    'chartHeading',
    'tableHeading',
    'onDevice',
    'swap',
  ] as const;
  return Object.fromEntries(keys.map((k) => [k, t(k)])) as CalcChrome;
}
