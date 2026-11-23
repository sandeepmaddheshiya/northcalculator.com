import type { Fmt } from './types';
import { fill } from '@/lib/fill';

/** Formats a calculator output for display. Shared by the island (client) and pages (server). */
export function formatOutput(
  fmt: Fmt,
  format: string,
  v: number | string | null,
  ui: Record<string, string>,
  decimals?: number,
): string {
  if (v === null) return '—';
  if (typeof v === 'string') return format === 'date' ? fmt.date(v) : (ui[v] ?? v);
  switch (format) {
    case 'currency':
    case 'money':
      return fmt.money(v, decimals);
    case 'percent':
      return fmt.pct(v, decimals ?? 2);
    case 'integer':
      return fmt.int(v);
    case 'sig':
      return fmt.sig(v, decimals ?? 10);
    case 'duration': {
      // Value in months → "29 yr 4 mo" (templates from the calculator's ui strings).
      const y = Math.floor(v / 12);
      const m = Math.round(v - y * 12);
      const parts = [];
      if (y) parts.push(fill(ui['fmt.years'] ?? '{n} yr', { n: fmt.int(y) }));
      if (m || !y) parts.push(fill(ui['fmt.months'] ?? '{n} mo', { n: fmt.int(m) }));
      return parts.join(' ');
    }
    default:
      return fmt.num(v, decimals ?? 4);
  }
}
