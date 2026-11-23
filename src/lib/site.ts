/** Single source of truth for site identity. Never hardcode the domain elsewhere. */
export const SITE = {
  name: 'NorthCalculator',
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://northcalculator.com').replace(/\/$/, ''),
  operator: {
    name: 'Sandeep Maddheshiya',
    url: 'https://sandeepmaddheshiya.me',
  },
  /** Date the site's policies were last materially changed (ISO). */
  policiesUpdated: '2026-11-23',
} as const;

export function absoluteUrl(path: string): string {
  return `${SITE.url}${path.startsWith('/') ? path : `/${path}`}`;
}
