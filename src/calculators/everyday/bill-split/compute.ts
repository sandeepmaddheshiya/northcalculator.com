import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { fromMinor, minorDigits, roundHalfUp, toMinor } from '@/engine/money';

/**
 * Split a bill by what each person ordered. Tax and tip are worked out on the whole bill
 * (percent of an amount, OpenStax Prealgebra 2e §6.2; Contemporary Mathematics §6.2), then shared
 * in proportion to each person's order. Shares are rounded to the smallest currency unit with the
 * largest-remainder method, so they always add up to exactly the bill.
 */
export function shareOut(parts: readonly number[], totalMinor: number): number[] {
  const sum = parts.reduce((a, b) => a + b, 0);
  if (sum === 0) return parts.map(() => 0);
  const exact = parts.map((p) => (p * totalMinor) / sum);
  const floors = exact.map(Math.floor);
  let left = totalMinor - floors.reduce((a, b) => a + b, 0);
  const order = exact
    .map((x, i) => [x - Math.floor(x), i] as const)
    .sort((a, b) => b[0] - a[0] || a[1] - b[1]);
  for (const [, i] of order) {
    if (left <= 0) break;
    floors[i]!++;
    left--;
  }
  return floors;
}

export const compute: ComputeFn = (inputs, { fmt }) => {
  const rows = Array.isArray(inputs.people)
    ? (inputs.people as readonly Record<string, unknown>[])
    : [];
  const d = minorDigits(fmt.currency);
  const m = (x: number) => fromMinor(x, d);
  const amounts = rows.map((r) =>
    typeof r.amount === 'number' && r.amount >= 0 ? toMinor(r.amount, d) : 0,
  );
  const subtotal = amounts.reduce((a, b) => a + b, 0);
  if (!rows.length || subtotal === 0) {
    const none: ComputeResult = {
      outputs: { total: null },
      steps: [],
      warnings: [{ key: 'warn.empty', level: 'warn' }],
    };
    return none;
  }
  const taxRate = typeof inputs.taxRate === 'number' ? inputs.taxRate : 0;
  const tipRate = typeof inputs.tipRate === 'number' ? inputs.tipRate : 0;
  const tax = roundHalfUp((subtotal * taxRate) / 100);
  const tipBase = inputs.tipOn === 'total' ? subtotal + tax : subtotal;
  const tip = roundHalfUp((tipBase * tipRate) / 100);
  const total = subtotal + tax + tip;
  const shares = shareOut(amounts, total);
  return {
    outputs: {
      total: m(total),
      subtotal: m(subtotal),
      tax: m(tax),
      tip: m(tip),
      factor: Math.round((total / subtotal) * 1e6) / 1e6,
    },
    explain: {
      key: 'explain',
      values: { total: fmt.money(m(total)), n: rows.length, f: fmt.num(total / subtotal, 4) },
    },
    steps: [
      {
        key: 'step.tax',
        math: `${fmt.money(m(subtotal))} × ${fmt.pct(taxRate, 3)} = ${fmt.money(m(tax))}`,
      },
      {
        key: 'step.tip',
        math: `${fmt.money(m(tipBase))} × ${fmt.pct(tipRate, 3)} = ${fmt.money(m(tip))}`,
      },
      {
        key: 'step.share',
        math: `${fmt.money(m(total))} ÷ ${fmt.money(m(subtotal))} = ${fmt.num(total / subtotal, 6)}`,
      },
    ],
    table: {
      captionKey: 'table.caption',
      columns: [
        { key: 'table.person', format: 'integer' },
        { key: 'table.ordered', format: 'money' },
        { key: 'table.pays', format: 'money' },
      ],
      rows: amounts.map((a, i) => [i + 1, m(a), m(shares[i]!)]),
    },
    warnings: [],
  };
};
