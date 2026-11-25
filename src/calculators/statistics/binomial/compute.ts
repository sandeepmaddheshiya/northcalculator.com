import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';
import { lnGamma } from '@/engine/stats';

/**
 * Binomial distribution B(n, p) (OpenStax Introductory Statistics 2e §4.3; NIST/SEMATECH
 * 1.3.6.6.18): P(X = k) = C(n, k) pᵏ(1 − p)ⁿ⁻ᵏ, mean np, SD √(np(1 − p)). Each term is
 * computed in log space with lnGamma, so n up to 100,000 neither overflows nor underflows,
 * and both tails are summed directly (no 1 − sum), keeping small tail probabilities accurate.
 */
export function logPmf(n: number, p: number, k: number): number {
  if (p === 0) return k === 0 ? 0 : -Infinity;
  if (p === 1) return k === n ? 0 : -Infinity;
  return (
    lnGamma(n + 1) -
    lnGamma(k + 1) -
    lnGamma(n - k + 1) +
    k * Math.log(p) +
    (n - k) * Math.log1p(-p)
  );
}

export const compute: ComputeFn = (inputs, { fmt }) => {
  const val = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const none = (key?: string): ComputeResult => ({
    outputs: { eq: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const n0 = val('n');
  const p = val('p');
  const x0 = val('x');
  if (n0 === null || p === null || x0 === null) return none();
  const n = Math.round(n0);
  const x = Math.round(x0);
  if (n < 1) return none('warn.n');
  if (p < 0 || p > 1) return none('warn.p');
  if (x < 0 || x > n) return none('warn.x');
  let lower = 0; // P(X ≤ x)
  let upper = 0; // P(X > x)
  for (let k = 0; k <= n; k++) {
    const v = Math.exp(logPmf(n, p, k));
    if (k <= x) lower += v;
    else upper += v;
  }
  const eq = Math.exp(logPmf(n, p, x));
  const s = (v: number) => fmt.sig(clean(v), 10);
  return {
    outputs: {
      eq: clean(eq),
      le: clean(Math.min(1, lower)),
      lt: clean(Math.max(0, lower - eq)),
      ge: clean(Math.min(1, upper + eq)),
      gt: clean(upper),
      mean: clean(n * p),
      sd: clean(Math.sqrt(n * p * (1 - p))),
    },
    explain: { key: 'explain', values: { n, x, eq: s(eq), le: s(lower) } },
    steps: [
      { key: 'step.pmf', math: `C(${n}, ${x}) × ${s(p)}^${x} × ${s(1 - p)}^${n - x} = ${s(eq)}` },
      { key: 'step.cdf', math: `P(X ≤ ${x}) = Σ P(X = k), k = 0…${x} = ${s(lower)}` },
    ],
    warnings: [],
  };
};
