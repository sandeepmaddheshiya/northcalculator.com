/**
 * Per-calculator history and saved scenarios in localStorage (BRIEF §6). Everything stays in
 * this browser. Storage can be unavailable (private mode, blocked site data), so every access is
 * guarded and the UI works without it.
 */
export interface HistoryEntry {
  /** URL query string of the inputs (without "?"). */
  q: string;
  /** Primary result as displayed when saved, e.g. "$2,022.62". */
  label: string;
  at: number;
}

const MAX = { history: 8, saved: 20 } as const;
const key = (kind: keyof typeof MAX, id: string) => `nc:${kind}:${id}`;

export function readEntries(kind: keyof typeof MAX, id: string): HistoryEntry[] {
  try {
    const raw = window.localStorage.getItem(key(kind, id));
    const v = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(v)
      ? v.filter((e): e is HistoryEntry => typeof e?.q === 'string' && typeof e?.label === 'string')
      : [];
  } catch {
    return [];
  }
}

export function addEntry(kind: keyof typeof MAX, id: string, entry: HistoryEntry): HistoryEntry[] {
  const next = [entry, ...readEntries(kind, id).filter((e) => e.q !== entry.q)].slice(0, MAX[kind]);
  try {
    window.localStorage.setItem(key(kind, id), JSON.stringify(next));
  } catch {
    /* storage unavailable: keep the in-memory list */
  }
  return next;
}

export function removeEntry(kind: keyof typeof MAX, id: string, q: string): HistoryEntry[] {
  const next = readEntries(kind, id).filter((e) => e.q !== q);
  try {
    window.localStorage.setItem(key(kind, id), JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}

export function clearEntries(kind: keyof typeof MAX, id: string): void {
  try {
    window.localStorage.removeItem(key(kind, id));
  } catch {
    /* ignore */
  }
}
