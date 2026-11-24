import type { ComputeFn, ComputeResult, Step } from '@/calculators/types';
import { roundTo } from '@/engine/money';

/**
 * Compound annual growth rate: CAGR = (end ÷ start)^(1 ÷ years) − 1 (OpenStax Contemporary
 * Mathematics §6.7, "annual return"). It is the constant yearly rate that turns the start value
 * into the end value, and says nothing about the path in between. Percentages are rounded to
 * 4 decimal places and shown to 2.
 */
export const compute: ComputeFn = (inputs, { fmt }) => {
  const num = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const start = num('start');
  const end = num('end');
  const years = num('years');
  const none = (key?: string): ComputeResult => ({
    outputs: { cagr: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  if (start === null || end === null || years === null) return none();
  if (start <= 0) return none('warn.start');
  if (years <= 0) return none('warn.years');
  if (end < 0) return none('warn.negative');

  const multiple = end / start;
  const rate = multiple ** (1 / years) - 1;
  const cagr = roundTo(rate * 100, 4);
  const steps: Step[] = [
    {
      key: 'step.multiple',
      math: `${fmt.money(end)} ÷ ${fmt.money(start)} = ${fmt.num(multiple, 6)}`,
    },
    {
      key: 'step.root',
      math: `${fmt.num(multiple, 6)}^(1 ÷ ${fmt.num(years, 4)}) = ${fmt.num(1 + rate, 6)}`,
    },
    {
      key: 'step.subtract',
      math: `${fmt.num(1 + rate, 6)} − 1 = ${fmt.num(rate, 6)} = ${fmt.pct(cagr, 4)}`,
    },
  ];
  const warnings: ComputeResult['warnings'] = [];
  if (years < 1) warnings.push({ key: 'warn.short', level: 'info' });
  if (end === 0) warnings.push({ key: 'warn.zero', level: 'info' });
  return {
    outputs: {
      cagr,
      total: roundTo((multiple - 1) * 100, 4),
      multiple: roundTo(multiple, 6),
      gain: roundTo(end - start, 6),
    },
    explain: {
      key: rate >= 0 ? 'explain.up' : 'explain.down',
      values: {
        start: fmt.money(start),
        end: fmt.money(end),
        years: fmt.num(years, 2),
        r: fmt.pct(Math.abs(cagr), 2),
      },
    },
    steps,
    warnings,
  };
};
