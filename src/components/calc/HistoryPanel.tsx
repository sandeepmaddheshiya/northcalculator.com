'use client';

import type { CalcChrome } from '@/i18n/labels';
import { Icon } from '@/components/ui/Icon';
import type { HistoryEntry } from './history';

/** Recent and saved calculations for one calculator; each entry restores its inputs. */
export function HistoryPanel({
  recent,
  saved,
  chrome,
  onOpen,
  onRemoveSaved,
  onClearRecent,
  sensitive,
}: {
  recent: HistoryEntry[];
  saved: HistoryEntry[];
  chrome: CalcChrome;
  onOpen: (q: string) => void;
  onRemoveSaved: (q: string) => void;
  onClearRecent: () => void;
  sensitive: boolean;
}) {
  if (recent.length === 0 && saved.length === 0) return null;
  const item = (e: HistoryEntry, remove?: () => void) => (
    <li key={e.q} className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onOpen(e.q)}
        className="min-w-0 flex-1 truncate rounded-sm px-2 py-1.5 text-start text-sm hover:bg-sunken"
      >
        <span className="num font-medium">{e.label}</span>
        <span className="ms-2 text-xs text-subtle">{new Date(e.at).toLocaleDateString()}</span>
      </button>
      {remove && (
        <button
          type="button"
          onClick={remove}
          className="flex size-9 items-center justify-center rounded-sm text-subtle hover:text-danger"
          aria-label={`${chrome.remove} ${e.label}`}
        >
          <Icon name="close" size={16} />
        </button>
      )}
    </li>
  );
  return (
    <details className="no-print border-t border-line pt-3">
      <summary className="cursor-pointer text-sm font-medium text-brand">
        {chrome.history} ({saved.length + recent.length})
      </summary>
      <div className="mt-2 space-y-3">
        {saved.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold tracking-wider text-subtle uppercase">
              {chrome.saved}
            </h3>
            <ul className="mt-1">{saved.map((e) => item(e, () => onRemoveSaved(e.q)))}</ul>
          </div>
        )}
        {recent.length > 0 && (
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold tracking-wider text-subtle uppercase">
                {chrome.recent}
              </h3>
              <button
                type="button"
                onClick={onClearRecent}
                className="text-xs text-muted underline underline-offset-2 hover:text-text"
              >
                {chrome.clearHistory}
              </button>
            </div>
            <ul className="mt-1">{recent.map((e) => item(e))}</ul>
          </div>
        )}
        <p className="flex gap-1.5 text-xs text-subtle">
          <Icon name="lock" size={14} className="mt-0.5 shrink-0" />
          {sensitive ? chrome.historyNoteSensitive : chrome.historyNote}
        </p>
      </div>
    </details>
  );
}
