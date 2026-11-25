import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { fromMinor, minorDigits, roundHalfUp, toMinor } from '@/engine/money';

/**
 * VAT (GOV.UK “Charge, reclaim and record VAT”; HMRC VAT Notice 700 §7.3.1):
 *   adding:   VAT = net × rate ÷ 100,                 gross = net + VAT
 *   removing: VAT = gross × rate ÷ (100 + rate),       net = gross − VAT  (the “VAT fraction”)
 * VAT is rounded half-up to the nearest penny (or smallest currency unit), one of the
 * rounding methods Notice 700 allows at line level; the other figure is derived so net + VAT = gross.
 * Integer minor units avoid binary rounding errors (ADR-017).
 */
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
export function vatFraction(rate: number): string {
  // Scale to whole numbers: 12.5% → 125/1125.
  let scale = 1;
  while (!Number.isInteger(rate * scale) && scale < 1e6) scale *= 10;
  const p = Math.round(rate * scale);
  const q = Math.round((100 + rate) * scale);
  if (p === 0) return '0';
  const g = gcd(p, q);
  return `${p / g}/${q / g}`;
}

export const compute: ComputeFn = (inputs, { fmt }) => {
  const amount = typeof inputs.amount === 'number' ? inputs.amount : null;
  const rate = typeof inputs.rate === 'number' ? inputs.rate : null;
  const none = (key?: string): ComputeResult => ({
    outputs: { gross: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  if (amount === null || rate === null) return none();
  if (rate < 0) return none('warn.rate');
  const d = minorDigits(fmt.currency);
  const a = toMinor(amount, d);
  const remove = inputs.mode === 'remove';
  const vatMinor = remove ? roundHalfUp((a * rate) / (100 + rate)) : roundHalfUp((a * rate) / 100);
  const netMinor = remove ? a - vatMinor : a;
  const grossMinor = remove ? a : a + vatMinor;
  const money = (m: number) => fmt.money(fromMinor(m, d));
  const frac = vatFraction(rate);
  return {
    outputs: {
      gross: fromMinor(grossMinor, d),
      net: fromMinor(netMinor, d),
      vat: fromMinor(vatMinor, d),
      fraction: frac,
    },
    explain: {
      key: remove ? 'explain.remove' : 'explain.add',
      values: {
        gross: money(grossMinor),
        net: money(netMinor),
        vat: money(vatMinor),
        rate: fmt.num(rate, 4),
      },
    },
    steps: remove
      ? [
          {
            key: 'step.fraction',
            math: `${fmt.num(rate, 4)} ÷ (100 + ${fmt.num(rate, 4)}) = ${frac}`,
          },
          { key: 'step.removeVat', math: `${money(a)} × ${frac} = ${money(vatMinor)}` },
          { key: 'step.net', math: `${money(a)} − ${money(vatMinor)} = ${money(netMinor)}` },
        ]
      : [
          { key: 'step.addVat', math: `${money(a)} × ${fmt.num(rate, 4)}% = ${money(vatMinor)}` },
          { key: 'step.gross', math: `${money(a)} + ${money(vatMinor)} = ${money(grossMinor)}` },
        ],
    warnings: [],
  };
};
