import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Percentiles of a data set, using the rank position p(n + 1) common to both sources:
 *   NIST/SEMATECH 7.2.6.2 (method R6, the main result): write p(n + 1) = k + d and interpolate,
 *     Y[k] + d(Y[k+1] − Y[k]), clamping to the smallest and largest values;
 *   OpenStax Introductory Statistics 2e §2.3: if the position is not whole, average the two
 *     neighbouring values instead (shown as a second figure).
 * Quartiles use R6 at 25, 50 and 75. Percentile rank of x = (below + ½·equal) ÷ n × 100 (OpenStax).
 * Outliers lie more than 1.5 × IQR beyond the quartiles.
 */
export function parseData(text: string): { values: number[]; bad: number } {
  const values: number[] = [];
  let bad = 0;
  for (const tok of text.split(/[\s,;]+/)) {
    if (!tok) continue;
    const v = Number(tok.replace('−', '-'));
    if (Number.isFinite(v)) values.push(v);
    else bad++;
  }
  return { values, bad };
}

export function r6(sorted: number[], pct: number): number {
  const n = sorted.length;
  const pos = (pct / 100) * (n + 1);
  const k = Math.floor(pos);
  const d = pos - k;
  if (k <= 0) return sorted[0]!;
  if (k >= n) return sorted[n - 1]!;
  return sorted[k - 1]! + d * (sorted[k]! - sorted[k - 1]!);
}

export function averaged(sorted: number[], pct: number): number {
  const n = sorted.length;
  const pos = (pct / 100) * (n + 1);
  if (pos <= 1) return sorted[0]!;
  if (pos >= n) return sorted[n - 1]!;
  if (Number.isInteger(pos)) return sorted[pos - 1]!;
  return (sorted[Math.floor(pos) - 1]! + sorted[Math.ceil(pos) - 1]!) / 2;
}

export const compute: ComputeFn = (inputs, ctx) => {
  const { fmt } = ctx;
  const t = ctx.t ?? ((k: string) => k);
  const { values, bad } = parseData(String(inputs.data ?? ''));
  const none = (key?: string): ComputeResult => ({
    outputs: { value: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  if (values.length < 2) return none(values.length || bad ? 'warn.few' : undefined);
  const p = typeof inputs.p === 'number' ? inputs.p : null;
  if (p === null) return none();
  const s = [...values].sort((a, b) => a - b);
  const n = s.length;
  const value = r6(s, p);
  const avg = averaged(s, p);
  const q1 = r6(s, 25);
  const q3 = r6(s, 75);
  const iqr = q3 - q1;
  const lo = q1 - 1.5 * iqr;
  const hi = q3 + 1.5 * iqr;
  const outs = s.filter((v) => v < lo || v > hi);
  const x = typeof inputs.x === 'number' ? inputs.x : null;
  const rank =
    x === null
      ? null
      : ((s.filter((v) => v < x).length + 0.5 * s.filter((v) => v === x).length) / n) * 100;
  const f = (v: number) => fmt.sig(clean(v), 10);
  const pos = (p / 100) * (n + 1);
  return {
    outputs: {
      value: clean(value),
      averaged: clean(avg),
      rank: rank === null ? null : clean(rank),
      q1: clean(q1),
      median: clean(r6(s, 50)),
      q3: clean(q3),
      iqr: clean(iqr),
      outliers: outs.length ? outs.map(f).join(', ') : t('outliers.none'),
    },
    explain: { key: 'explain', values: { p: fmt.num(p, 4), v: f(value), n } },
    steps: [
      {
        key: 'step.position',
        math: `${fmt.num(p, 4)} ÷ 100 × (${n} + 1) = ${fmt.num(clean(pos), 6)}`,
      },
      { key: 'step.interpolate', math: `= ${f(value)}` },
      { key: 'step.fences', math: `${f(lo)} to ${f(hi)}` },
    ],
    warnings: bad ? [{ key: 'warn.bad', level: 'warn', values: { n: bad } }] : [],
  };
};
