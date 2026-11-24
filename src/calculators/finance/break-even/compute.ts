import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { fromMinor, minorDigits, roundHalfUp, roundTo, toMinor } from '@/engine/money';

/**
 * Break-even (OpenStax Principles of Managerial Accounting §3.1–3.2):
 *   contribution margin per unit = price − variable cost;  ratio = margin ÷ price
 *   break-even units = (fixed costs + target profit) ÷ margin per unit  (rounded up to whole units)
 *   break-even sales = (fixed costs + target profit) ÷ ratio
 */
export const compute: ComputeFn = (inputs, { fmt }) => {
  const num = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const fixed = num('fixed');
  const price = num('price');
  const variable = num('variable');
  const profit = num('profit') ?? 0;
  const none = (key?: string): ComputeResult => ({
    outputs: { units: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  if (fixed === null || price === null || variable === null) return none();
  const d = minorDigits(fmt.currency);
  const cmMinor = toMinor(price, d) - toMinor(variable, d);
  if (cmMinor <= 0) return none('warn.noMargin');
  const target = toMinor(fixed, d) + toMinor(profit, d);
  const exact = target / cmMinor;
  const units = Math.ceil(exact - 1e-9) || 0; // avoid −0 when there is nothing to cover
  const ratio = cmMinor / toMinor(price, d);
  const sales = fromMinor(roundHalfUp(target / ratio), d);
  const m = (x: number) => fromMinor(x, d);
  return {
    outputs: {
      units,
      sales,
      cm: m(cmMinor),
      cmRatio: roundTo(ratio * 100, 4),
      exact: roundTo(exact, 6),
    },
    explain: {
      key: profit > 0 ? 'explain.target' : 'explain',
      values: { units: fmt.int(units), sales: fmt.money(sales), profit: fmt.money(profit) },
    },
    steps: [
      {
        key: 'step.cm',
        math: `${fmt.money(price)} − ${fmt.money(variable)} = ${fmt.money(m(cmMinor))}`,
      },
      {
        key: 'step.units',
        math: `${fmt.money(m(target))} ÷ ${fmt.money(m(cmMinor))} = ${fmt.num(exact, 4)}${units !== exact ? ` → ${fmt.int(units)}` : ''}`,
      },
      {
        key: 'step.ratio',
        math: `${fmt.money(m(cmMinor))} ÷ ${fmt.money(price)} = ${fmt.pct(ratio * 100, 2)}`,
      },
      {
        key: 'step.sales',
        math: `${fmt.money(m(target))} ÷ ${fmt.num(ratio, 6)} = ${fmt.money(sales)}`,
      },
    ],
    warnings:
      units !== exact && Math.abs(units - exact) > 1e-9
        ? [{ key: 'warn.roundUp', level: 'info' }]
        : [],
  };
};
