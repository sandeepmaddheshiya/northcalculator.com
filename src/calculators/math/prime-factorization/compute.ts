import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { factorize } from '@/calculators/math/lcm-gcf/compute';

/**
 * Prime factorization by trial division up to √n (OpenStax Contemporary Mathematics §3.1;
 * Prealgebra 2e §2.5), shown in exponent form (2² × 3 × 7) and expanded. The number of divisors
 * is the product of (exponent + 1); divisors are listed when there are at most 120.
 */
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const sup = (e: number) => [...String(e)].map((d) => SUP[Number(d)]).join('');

export function divisors(f: [number, number][]): number[] {
  let out = [1];
  for (const [p, e] of f) {
    const next: number[] = [];
    for (const d of out) for (let k = 0, m = 1; k <= e; k++, m *= p) next.push(d * m);
    out = next;
  }
  return out.sort((a, b) => a - b);
}

export const compute: ComputeFn = (inputs, ctx) => {
  const { fmt } = ctx;
  const t = ctx.t ?? ((k: string) => k);
  const raw = typeof inputs.n === 'number' ? inputs.n : null;
  const none = (key?: string): ComputeResult => ({
    outputs: { factors: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  if (raw === null) return none();
  const n = Math.round(raw);
  if (n < 1 || n > 1e12) return none('warn.range');
  const num = (x: number) => fmt.num(x, 0);
  if (n === 1) {
    return {
      outputs: { factors: '1', expanded: '1', kind: t('kind.one'), divisorCount: 1, divisors: '1' },
      explain: { key: 'explain.one', values: {} },
      steps: [],
      warnings: [],
    };
  }
  const f = factorize(n);
  const isPrime = f.length === 1 && f[0]![1] === 1;
  const count = f.reduce((a, [, e]) => a * (e + 1), 1);
  const factors = isPrime
    ? num(n)
    : f.map(([p, e]) => (e === 1 ? num(p) : `${num(p)}${sup(e)}`)).join(' × ');
  const expanded = f.flatMap(([p, e]) => Array<string>(e).fill(num(p))).join(' × ');
  return {
    outputs: {
      factors,
      expanded,
      kind: t(isPrime ? 'kind.prime' : 'kind.composite'),
      divisorCount: count,
      divisors: count <= 120 ? divisors(f).map(num).join(', ') : t('divisors.many'),
    },
    explain: {
      key: isPrime ? 'explain.prime' : 'explain.composite',
      values: { n: num(n), f: factors, c: count },
    },
    steps: [
      { key: 'step.trial', math: `√${num(n)} ≈ ${fmt.num(Math.floor(Math.sqrt(n)), 0)}` },
      { key: 'step.result', math: `${num(n)} = ${expanded}` },
    ],
    warnings: [],
  };
};
