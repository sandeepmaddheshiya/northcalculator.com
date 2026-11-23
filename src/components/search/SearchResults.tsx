'use client';

import MiniSearch from 'minisearch';
import { useEffect, useState } from 'react';
import { fill } from '@/lib/fill';
import type { SearchLabels } from './SearchDialog';
import type { SearchDoc } from '@/lib/search-index';

/** Results page for /{locale}/search?q=… (target of the WebSite SearchAction). */
export function SearchResults({ labels, locale }: { labels: SearchLabels; locale: string }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchDoc[] | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q') ?? '';
    fetch(`/${locale}/search-index.json`)
      .then((r) => r.json() as Promise<SearchDoc[]>)
      .then((docs) => {
        const ms = new MiniSearch<SearchDoc>({
          fields: ['title', 'synonyms', 'description'],
          storeFields: ['title', 'description', 'url', 'category'],
          searchOptions: { fuzzy: 0.2, prefix: true, boost: { title: 3 } },
        });
        ms.addAll(docs);
        setQuery(q);
        setResults(q ? (ms.search(q) as unknown as SearchDoc[]) : docs);
      })
      .catch(() => setResults([]));
  }, [locale]);

  if (!results) return null;
  return (
    <div className="mt-6">
      <p className="text-sm text-muted" aria-live="polite">
        {fill(labels.results, { count: results.length })}
      </p>
      {results.length === 0 && query && <p className="mt-4">{fill(labels.noResults, { query })}</p>}
      <ul className="mt-4 divide-y divide-line border-y border-line">
        {results.map((r) => (
          <li key={r.url} className="py-3">
            <a href={r.url} className="font-medium text-brand hover:underline">
              {r.title}
            </a>
            {r.description && <p className="text-sm text-muted">{r.description}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
