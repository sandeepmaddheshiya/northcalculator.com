'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import type { SearchLabels } from './SearchDialog';
import { Icon } from '@/components/ui/Icon';

// The dialog, its index and MiniSearch load only on first open (BRIEF §2, §10).
// Only the header instance (variant 'compact') owns the dialog and the keyboard shortcuts;
// other triggers ask it to open via the OPEN_EVENT window event.
const OPEN_EVENT = 'nc:open-search';
const SearchDialog = dynamic(() => import('./SearchDialog'), { ssr: false });

export function SearchTrigger({
  variant = 'compact',
  labels,
  locale,
}: {
  variant?: 'compact' | 'hero';
  labels: SearchLabels;
  locale: string;
}) {
  const t = (k: keyof SearchLabels) => labels[k];
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (variant !== 'compact') return;
    const onOpen = () => {
      setLoaded(true);
      setOpen(true);
    };
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target?.closest('input, textarea, select, [contenteditable="true"]');
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault();
        setLoaded(true);
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, [variant]);

  const openDialog = () => {
    if (variant !== 'compact') {
      window.dispatchEvent(new Event(OPEN_EVENT));
      return;
    }
    setLoaded(true);
    setOpen(true);
  };

  return (
    <>
      {variant === 'hero' ? (
        <button
          type="button"
          onClick={openDialog}
          className="group border-line-strong bg-surface text-muted hover:border-brand focus-visible:border-brand flex h-14 w-full items-center gap-3 rounded-md border px-4 text-start shadow-[0_1px_0_var(--tok-border)] transition-colors"
          aria-haspopup="dialog"
        >
          <Icon name="search" size={22} className="text-subtle group-hover:text-brand" />
          <span className="min-w-0 flex-1 truncate text-base">{t('placeholder')}</span>
          <kbd
            aria-hidden="true"
            className="border-line text-subtle hidden rounded-xs border px-1.5 py-0.5 font-mono text-xs sm:inline"
          >
            /
          </kbd>
        </button>
      ) : (
        <button
          type="button"
          onClick={openDialog}
          aria-haspopup="dialog"
          className="text-muted hover:bg-sunken hover:text-text md:border-line md:bg-surface md:hover:border-line-strong inline-flex size-10 items-center justify-center gap-2 rounded-md md:h-10 md:w-64 md:justify-start md:border md:px-3"
        >
          <Icon name="search" size={18} />
          <span className="sr-only flex-1 text-start text-sm md:not-sr-only">{t('open')}</span>
          <kbd
            aria-hidden="true"
            className="border-line text-subtle hidden rounded-xs border px-1.5 font-mono text-[11px] md:inline"
          >
            Ctrl K
          </kbd>
        </button>
      )}
      {variant === 'compact' && loaded && (
        <SearchDialog open={open} onOpenChange={setOpen} labels={labels} locale={locale} />
      )}
    </>
  );
}
