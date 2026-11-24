import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { roundTo } from '@/engine/money';

/**
 * Weighted course grade: grade = Σ(scoreᵢ ÷ maxᵢ × weightᵢ) ÷ Σ weightᵢ (Illinois CITL; CSU Chico).
 * Dividing by the weights entered means a partly graded course shows the grade so far. Each
 * score is kept exact (no rounding of category averages); the grade is rounded to 4 decimals.
 * The letter uses the common 90/80/70/60 scale, which many but not all courses follow.
 */
export function letterFor(pct: number): string {
  return pct >= 90 ? 'A' : pct >= 80 ? 'B' : pct >= 70 ? 'C' : pct >= 60 ? 'D' : 'F';
}

export const compute: ComputeFn = (inputs, { fmt }) => {
  const rows = Array.isArray(inputs.items)
    ? (inputs.items as readonly Record<string, unknown>[])
    : [];
  const num = (v: unknown) =>
    typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN;
  let weight = 0;
  let points = 0;
  let skipped = 0;
  const table: (readonly (string | number)[])[] = [];
  rows.forEach((r, i) => {
    const s = num(r.score);
    const m = num(r.max);
    const w = num(r.weight);
    if (![s, m, w].every(Number.isFinite) || m <= 0 || w <= 0 || s < 0) {
      skipped++;
      return;
    }
    const pct = (s / m) * 100;
    weight += w;
    points += (pct * w) / 100;
    table.push([i + 1, roundTo(pct, 4), w, roundTo((pct * w) / 100, 4)]);
  });
  if (weight === 0) {
    const none: ComputeResult = {
      outputs: { grade: null },
      steps: [],
      warnings: [{ key: 'warn.empty', level: 'warn' }],
    };
    return none;
  }
  const grade = roundTo((points / weight) * 100, 4);
  const warnings: ComputeResult['warnings'] = [];
  if (skipped) warnings.push({ key: 'warn.skipped', values: { n: skipped }, level: 'info' });
  if (Math.abs(weight - 100) > 1e-9)
    warnings.push({
      key: weight < 100 ? 'warn.partial' : 'warn.over',
      values: { w: fmt.pct(roundTo(weight, 4), 2) },
      level: 'info',
    });
  if (grade > 100) warnings.push({ key: 'warn.extra', level: 'info' });
  return {
    outputs: {
      grade,
      letter: letterFor(grade),
      weight: roundTo(weight, 4),
      points: roundTo(points, 4),
    },
    explain: {
      key: Math.abs(weight - 100) > 1e-9 ? 'explain.partial' : 'explain',
      values: { g: fmt.pct(grade, 2), l: letterFor(grade), w: fmt.pct(roundTo(weight, 4), 2) },
    },
    steps: [
      {
        key: 'step.each',
        math: table
          .map(
            ([n, p, w, q]) =>
              `${n}: ${fmt.num(p as number, 4)}% × ${fmt.num(w as number, 2)}% = ${fmt.num(q as number, 4)}`,
          )
          .join('\n'),
      },
      {
        key: 'step.sum',
        math: `${fmt.num(roundTo(points, 4), 4)} ÷ ${fmt.num(roundTo(weight, 4), 2)} × 100 = ${fmt.num(grade, 4)}%`,
      },
    ],
    table: {
      captionKey: 'table.caption',
      columns: [
        { key: 'table.n', format: 'integer' },
        { key: 'table.pct', format: 'number' },
        { key: 'table.weight', format: 'number' },
        { key: 'table.points', format: 'number' },
      ],
      rows: table,
    },
    warnings,
  };
};
