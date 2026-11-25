import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';
import { lnGamma } from '@/engine/stats';

/**
 * Poisson distribution with mean μ (OpenStax Introductory Statistics 2e §4.6; NIST/SEMATECH
 * 1.3.6.6.19): P(X = k) = μᵏe^(−μ) ÷ k!, standard deviation √μ. Terms are computed in log space
 * and both tails are summed directly; the upper tail stops once terms fall below 1e−17 of the
 * running total past the mode.
 */
export function logPmf(mu: number, k: number): number {
  if (mu === 0) return k === 0 ? 0 : -Infinity;
  return k * Math.log(mu) - mu - lnGamma(k + 1);
}

export const compute: ComputeFn = (inputs, { fmt }) => {
  const val = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const none = (key?: string): ComputeResult => ({
    outputs: { eq: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const mu = val('mean');
  const x0 = val('x');
  if (mu === null || x0 === null) return none();
  if (mu < 0) return none('warn.mean');
  const x = Math.round(x0);
  if (x < 0) return none('warn.x');
  let lower = 0;
  for (let k = 0; k <= x; k++) lower += Math.exp(logPmf(mu, k));
  let upper = 0;
  for (let k = x + 1; k < x + 100 + mu + 50 * Math.sqrt(mu + 1); k++) {
    const v = Math.exp(logPmf(mu, k));
    upper += v;
    if (k > mu && v < 1e-17 * upper) break;
  }
  const eq = Math.exp(logPmf(mu, x));
  const s = (v: number) => fmt.sig(clean(v), 10);
  return {
    outputs: {
      eq: clean(eq),
      le: clean(Math.min(1, lower)),
      lt: clean(Math.max(0, lower - eq)),
      ge: clean(Math.min(1, upper + eq)),
      gt: clean(upper),
      sd: clean(Math.sqrt(mu)),
    },
    explain: { key: 'explain', values: { x, mu: s(mu), eq: s(eq), le: s(lower) } },
    steps: [
      { key: 'step.pmf', math: `${s(mu)}^${x} × e^(−${s(mu)}) ÷ ${x}! = ${s(eq)}` },
      { key: 'step.cdf', math: `P(X ≤ ${x}) = ${s(lower)}, P(X > ${x}) = ${s(upper)}` },
    ],
    warnings: [],
  };
};
