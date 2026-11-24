import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean, roundTo } from '@/engine/money';
import { normalCdf } from '@/engine/stats';

/**
 * z = (x − μ) ÷ σ and x = μ + zσ (OpenStax Introductory Statistics 2e §6.1). Percentages below
 * and above come from the standard normal CDF (src/engine/stats.ts, erf-based; matches the NIST/SEMATECH
 * table to 5 decimals); "between" is the share within ±|z| of the mean. Percentages to 4 decimals.
 */
export const compute: ComputeFn = (inputs, { fmt }) => {
  const n = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const v = n('x');
  const mu = n('mean');
  const sd = n('sd');
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  if (v === null || mu === null || sd === null) return none();
  if (sd <= 0) return none('warn.sd');
  const toX = inputs.mode === 'x';
  const z = toX ? v : (v - mu) / sd;
  const x = toX ? mu + v * sd : v;
  const below = normalCdf(z);
  const pct = (p: number) => roundTo(p * 100, 4);
  return {
    outputs: {
      result: clean(toX ? x : z),
      below: pct(below),
      above: pct(1 - below),
      between: pct(normalCdf(Math.abs(z)) - normalCdf(-Math.abs(z))),
    },
    explain: {
      key: z >= 0 ? 'explain.above' : 'explain.below',
      values: {
        x: fmt.sig(clean(x), 8),
        z: fmt.num(clean(Math.abs(z)), 4),
        p: fmt.pct(pct(below), 2),
      },
    },
    steps: toX
      ? [
          {
            key: 'step.x',
            math: `${fmt.sig(mu, 8)} + ${fmt.sig(z, 8)} × ${fmt.sig(sd, 8)} = ${fmt.sig(clean(x), 8)}`,
          },
        ]
      : [
          {
            key: 'step.z',
            math: `(${fmt.sig(x, 8)} − ${fmt.sig(mu, 8)}) ÷ ${fmt.sig(sd, 8)} = ${fmt.sig(clean(z), 8)}`,
          },
        ],
    warnings: Math.abs(z) > 3 ? [{ key: 'warn.extreme', level: 'info' }] : [],
  };
};
