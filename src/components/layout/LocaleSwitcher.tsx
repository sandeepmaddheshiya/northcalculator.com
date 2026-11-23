'use client';

import { fill } from '@/lib/fill';
import { usePathname } from 'next/navigation';
import { liveLocales } from '@/i18n/locales';
import { Icon } from '@/components/ui/Icon';

/**
 * Lists only live locales (BRIEF §8). Hidden while a single locale is live.
 * Uses <details> so it works before hydration. Calculator pages with translated slugs
 * will pass explicit alternates in Phase 4.
 */
export function LocaleSwitcher({
  labels,
  locale,
}: {
  labels: { label: string; current: string };
  locale: string;
}) {
  // Strip the current locale prefix; the same path is offered in each live locale.
  const pathname = usePathname().replace(/^\/[^/]+/, '') || '/';
  if (liveLocales.length < 2) return null;
  const current = liveLocales.find((l) => l.code === locale);
  return (
    <details className="relative">
      <summary
        className="inline-flex h-10 cursor-pointer list-none items-center gap-1.5 rounded-md px-2 text-sm text-muted hover:bg-sunken hover:text-text"
        aria-label={fill(labels.current, { name: current?.name ?? locale })}
      >
        <Icon name="globe" size={18} />
        <span className="font-mono text-xs uppercase">{locale}</span>
      </summary>
      <ul
        className="absolute end-0 top-11 min-w-44 rounded-md border border-line bg-surface p-1 shadow-lg"
        aria-label={labels.label}
      >
        {liveLocales.map((l) => (
          <li key={l.code}>
            <a
              href={`/${l.code}${pathname === '/' ? '' : pathname}`}
              hrefLang={l.code}
              lang={l.code}
              aria-current={l.code === locale ? 'true' : undefined}
              className="block rounded-sm px-3 py-2 text-sm hover:bg-sunken aria-[current]:font-semibold"
            >
              {l.name}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
