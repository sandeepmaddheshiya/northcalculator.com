import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { roundTo } from '@/engine/money';

/**
 * Percentage grades to a 4.0-scale GPA using the College Board's "one commonly used system":
 * A 90–100 → 4.0, B 80–89 → 3.0, C 70–79 → 2.0, D 66–69 → 1.0, below that → 0.0, then a
 * credit-weighted average (UC Berkeley registrar). The College Board table lists F as "below 65"
 * and leaves 65 itself unassigned; here anything below 66 counts as F. Percentages are not rounded
 * before the letter is chosen (89.5 is a B).
 */
export function pointsFor(pct: number): [letter: string, points: number] {
  if (pct >= 90) return ['A', 4];
  if (pct >= 80) return ['B', 3];
  if (pct >= 70) return ['C', 2];
  if (pct >= 66) return ['D', 1];
  return ['F', 0];
}

export const compute: ComputeFn = (inputs, { fmt }) => {
  const rows = Array.isArray(inputs.classes)
    ? (inputs.classes as readonly Record<string, unknown>[])
    : [];
  const num = (v: unknown) => (typeof v === 'number' ? v : NaN);
  let credits = 0;
  let points = 0;
  let pctSum = 0;
  let skipped = 0;
  const table: (readonly (string | number)[])[] = [];
  rows.forEach((r, i) => {
    const p = num(r.percent);
    const c = num(r.credits);
    if (!Number.isFinite(p) || !Number.isFinite(c) || c <= 0 || p < 0) {
      skipped++;
      return;
    }
    const [letter, gp] = pointsFor(p);
    credits += c;
    points += gp * c;
    pctSum += p * c;
    table.push([i + 1, p, letter, gp]);
  });
  if (credits === 0) {
    const none: ComputeResult = {
      outputs: { gpa: null },
      steps: [],
      warnings: [{ key: 'warn.empty', level: 'warn' }],
    };
    return none;
  }
  const gpa = roundTo(points / credits, 4);
  const warnings: ComputeResult['warnings'] = [{ key: 'warn.scale', level: 'info' }];
  if (skipped) warnings.push({ key: 'warn.skipped', values: { n: skipped }, level: 'info' });
  if (table.some((r) => (r[1] as number) >= 65 && (r[1] as number) < 66))
    warnings.push({ key: 'warn.65', level: 'info' });
  return {
    outputs: { gpa, average: roundTo(pctSum / credits, 4), credits: roundTo(credits, 4) },
    explain: { key: 'explain', values: { gpa: fmt.num(gpa, 2), n: table.length } },
    steps: [
      {
        key: 'step.letters',
        math: table
          .map((r) => `${fmt.num(r[1] as number, 2)}% → ${r[2]} (${fmt.num(r[3] as number, 1)})`)
          .join('\n'),
      },
      {
        key: 'step.average',
        math: `${fmt.num(points, 2)} ÷ ${fmt.num(credits, 2)} = ${fmt.num(gpa, 4)}`,
      },
    ],
    table: {
      captionKey: 'table.caption',
      columns: [
        { key: 'table.n', format: 'integer' },
        { key: 'table.pct', format: 'percent' },
        { key: 'table.letter', format: 'text' },
        { key: 'table.points', format: 'number' },
      ],
      rows: table,
    },
    warnings,
  };
};
