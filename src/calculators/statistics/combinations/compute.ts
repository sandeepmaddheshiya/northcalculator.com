import type { ComputeFn, ComputeResult } from '@/calculators/types';

/**
 * Counting (OpenStax Contemporary Mathematics §7.2–7.3), exact with BigInt:
 *   nPr = n! ÷ (n − r)!         ordered selections without repetition
 *   nCr = n! ÷ (r!(n − r)!)     unordered selections without repetition
 *   nʳ                          ordered, repetition allowed
 *   C(n + r − 1, r)             unordered, repetition allowed
 * Very long results are shown in scientific notation.
 */
export function perm(n: bigint, r: bigint): bigint {
  let x = 1n;
  for (let i = 0n; i < r; i++) x *= n - i;
  return x;
}
export function comb(n: bigint, r: bigint): bigint {
  if (r > n) return 0n;
  const k = r < n - r ? r : n - r;
  let x = 1n;
  for (let i = 1n; i <= k; i++) x = (x * (n - k + i)) / i;
  return x;
}

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
export function show(x: bigint, locale: string): string {
  const s = x.toString();
  if (s.length <= 21) return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(x);
  const exp = s.length - 1;
  return `${s[0]}.${s.slice(1, 7)} × 10${[...String(exp)].map((d) => SUP[Number(d)]).join('')}`;
}

export const compute: ComputeFn = (inputs, { fmt }) => {
  const n = typeof inputs.n === 'number' ? Math.round(inputs.n) : null;
  const r = typeof inputs.r === 'number' ? Math.round(inputs.r) : null;
  const none = (key?: string): ComputeResult => ({
    outputs: { nCr: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  if (n === null || r === null || n < 0 || r < 0) return none();
  if (r > n) return none('warn.rn');
  const N = BigInt(n);
  const R = BigInt(r);
  const p = perm(N, R);
  const c = comb(N, R);
  const sh = (x: bigint) => show(x, fmt.locale);
  return {
    outputs: {
      nCr: sh(c),
      nPr: sh(p),
      repPerm: sh(N ** R),
      repComb: sh(comb(N + R - 1n, R)),
      nFact: sh(perm(N, N)),
    },
    explain: { key: 'explain', values: { n, r, c: sh(c), p: sh(p) } },
    steps: [
      { key: 'step.perm', math: `${n}P${r} = ${n}! ÷ ${n - r}! = ${sh(p)}` },
      {
        key: 'step.comb',
        math: `${n}C${r} = ${n}P${r} ÷ ${r}! = ${sh(p)} ÷ ${sh(perm(R, R))} = ${sh(c)}`,
      },
    ],
    warnings: [],
  };
};
