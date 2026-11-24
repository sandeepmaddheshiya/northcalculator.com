import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { roundTo } from '@/engine/money';

/**
 * Return on investment = (final value − cost) ÷ cost (OpenStax Contemporary Mathematics §6.7).
 * The annualized return is the constant yearly rate with the same result:
 * (value ÷ cost)^(1/years) − 1, as in the book's "annual return". Percentages to 4 decimals.
 */
export const compute: ComputeFn = (inputs, { fmt }) => {
  const num = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const cost = num('cost');
  const value = num('value');
  const years = num('years') ?? 0;
  const none = (key?: string): ComputeResult => ({
    outputs: { roi: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  if (cost === null || value === null) return none();
  if (cost <= 0) return none('warn.cost');
  const gain = roundTo(value - cost, 6);
  const roi = roundTo((gain / cost) * 100, 4);
  const multiple = value / cost;
  const annualized = years > 0 ? roundTo((multiple ** (1 / years) - 1) * 100, 4) : null;
  const warnings: ComputeResult['warnings'] = [];
  if (years > 0 && years < 1) warnings.push({ key: 'warn.short', level: 'info' });
  return {
    outputs: { roi, gain, annualized, multiple: roundTo(multiple, 6) },
    explain: {
      key: gain >= 0 ? 'explain.gain' : 'explain.loss',
      values: {
        gain: fmt.money(Math.abs(gain)),
        cost: fmt.money(cost),
        roi: fmt.pct(Math.abs(roi), 2),
      },
    },
    steps: [
      { key: 'step.gain', math: `${fmt.money(value)} − ${fmt.money(cost)} = ${fmt.money(gain)}` },
      { key: 'step.roi', math: `${fmt.money(gain)} ÷ ${fmt.money(cost)} = ${fmt.pct(roi, 4)}` },
      ...(annualized !== null
        ? [
            {
              key: 'step.annualized',
              math: `${fmt.num(multiple, 6)}^(1 ÷ ${fmt.num(years, 4)}) − 1 = ${fmt.pct(annualized, 4)}`,
            },
          ]
        : []),
    ],
    warnings,
  };
};
