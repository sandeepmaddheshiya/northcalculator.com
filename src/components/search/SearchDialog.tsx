'use client';

import * as Dialog from '@radix-ui/react-dialog';
import MiniSearch from 'minisearch';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { fill } from '@/lib/fill';
import { Icon } from '@/components/ui/Icon';
import type { SearchDoc } from '@/lib/search-index';

export interface SearchLabels {
  open: string;
  placeholder: string;
  label: string;
  noResults: string;
  hint: string;
  results: string;
}

export default function SearchDialog({
  open,
  onOpenChange,
  labels,
  locale,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labels: SearchLabels;
  locale: string;
}) {
  const t = (k: keyof SearchLabels) => labels[k];
  const [docs, setDocs] = useState<SearchDoc[] | null>(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/${locale}/search-index.json`)
      .then((r) => r.json() as Promise<SearchDoc[]>)
      .then((d) => !cancelled && setDocs(d))
      .catch(() => !cancelled && setDocs([]));
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const engine = useMemo(() => {
    if (!docs) return null;
    const ms = new MiniSearch<SearchDoc>({
      fields: ['title', 'synonyms', 'description', 'category'],
      storeFields: ['title', 'description', 'url', 'category'],
      searchOptions: { boost: { title: 3, synonyms: 2 }, fuzzy: 0.2, prefix: true },
    });
    ms.addAll(docs);
    return ms;
  }, [docs]);

  const results = useMemo(() => {
    if (!engine || !query.trim()) return docs?.slice(0, 8) ?? [];
    return engine.search(query).slice(0, 12) as unknown as SearchDoc[];
  }, [engine, docs, query]);

  const go = (url: string) => {
    onOpenChange(false);
    window.location.assign(url);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-[#08101c]/40" />
        <Dialog.Content
          className="border-line bg-surface fixed inset-x-0 top-0 z-50 mx-auto w-full max-w-2xl shadow-2xl sm:top-[10vh] sm:rounded-lg sm:border"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            inputRef.current?.focus();
          }}
        >
          <Dialog.Title className="sr-only">{t('label')}</Dialog.Title>
          <Dialog.Description className="sr-only">{t('hint')}</Dialog.Description>
          <div className="border-line flex items-center gap-3 border-b px-4">
            <Icon name="search" size={20} className="text-subtle" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setActive((a) => Math.min(a + 1, results.length - 1));
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setActive((a) => Math.max(a - 1, 0));
                } else if (e.key === 'Enter' && results[active]) {
                  e.preventDefault();
                  go(results[active].url);
                }
              }}
              placeholder={t('placeholder')}
              aria-label={t('label')}
              role="combobox"
              aria-expanded="true"
              aria-controls={listId}
              aria-activedescendant={results[active] ? `${listId}-${active}` : undefined}
              autoComplete="off"
              spellCheck={false}
              className="placeholder:text-subtle h-14 flex-1 bg-transparent text-base outline-none"
            />
            <Dialog.Close className="text-subtle ring-line hover:text-text rounded-sm px-1.5 py-0.5 font-mono text-xs ring-1">
              Esc
            </Dialog.Close>
          </div>
          <ul
            id={listId}
            role="listbox"
            aria-label={t('label')}
            className="max-h-[60vh] overflow-y-auto p-2"
          >
            {results.map((r, i) => (
              <li
                key={r.url}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseMove={() => setActive(i)}
                onClick={() => go(r.url)}
                className="aria-selected:bg-brand-wash flex cursor-pointer items-baseline justify-between gap-4 rounded-md px-3 py-2.5"
              >
                <span>
                  <span className="block font-medium">{r.title}</span>
                  <span className="text-muted block text-sm">{r.description}</span>
                </span>
                <span className="text-subtle shrink-0 text-xs">{r.category}</span>
              </li>
            ))}
            {docs && query.trim() !== '' && results.length === 0 && (
              <li className="text-muted px-3 py-6 text-center text-sm">
                {fill(t('noResults'), { query })}
                <br />
                {t('hint')}
              </li>
            )}
          </ul>
          <p className="sr-only" aria-live="polite">
            {docs ? fill(t('results'), { count: results.length }) : ''}
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
