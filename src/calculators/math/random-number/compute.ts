import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { stateFromSeed, uniformBelow, xoshiro128ss } from '@/engine/random';

/**
 * Random integers in [min, max], drawn from xoshiro128** seeded by the hidden `seed` input (set from
 * crypto.getRandomValues by the island; see src/engine/random.ts). Each value is equally likely
 * (rejection sampling). "No repeats" draws without replacement (a partial Fisher–Yates shuffle for
 * ranges up to a million, otherwise rejection of duplicates). The chance of the exact result is
 * 1 in Nᵏ (with repeats, in order), N!/(N−k)! (no repeats, in order) or C(N, k) (no repeats, sorted).
 */
const MAX_RANGE = 4294967296;

function chanceOf(n: bigint, k: bigint, unique: boolean, sorted: boolean): bigint | null {
  if (k === 1n) return n;
  if (!unique) return sorted ? null : n ** k;
  let perm = 1n;
  for (let i = 0n; i < k; i++) perm *= n - i;
  if (!sorted) return perm;
  let fact = 1n;
  for (let i = 2n; i <= k; i++) fact *= i;
  return perm / fact;
}

export const compute: ComputeFn = (inputs, { fmt }) => {
  const num = (k: string) =>
    typeof inputs[k] === 'number' ? Math.round(inputs[k] as number) : null;
  let lo = num('min');
  let hi = num('max');
  let count = num('count') ?? 1;
  const unique = inputs.unique === true;
  const sorted = inputs.sorted === true;
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  if (lo === null || hi === null) return none();
  const warnings: ComputeResult['warnings'] = [];
  if (lo > hi) {
    [lo, hi] = [hi, lo];
    warnings.push({ key: 'warn.swapped', level: 'info' });
  }
  const n = hi - lo + 1;
  if (n > MAX_RANGE) return none('warn.range');
  count = Math.max(1, Math.min(1000, count));
  if (unique && count > n) {
    count = n;
    warnings.push({ key: 'warn.tooMany', values: { n: fmt.int(n) }, level: 'info' });
  }

  const rng = xoshiro128ss(stateFromSeed(String(inputs.seed ?? '1')));
  let draws: number[];
  if (!unique) draws = Array.from({ length: count }, () => lo! + uniformBelow(rng, n));
  else if (n <= 1_000_000) {
    const pool = Array.from({ length: n }, (_, i) => lo! + i);
    for (let i = 0; i < count; i++) {
      const j = i + uniformBelow(rng, n - i);
      [pool[i], pool[j]] = [pool[j]!, pool[i]!];
    }
    draws = pool.slice(0, count);
  } else {
    const seen = new Set<number>();
    while (seen.size < count) seen.add(lo + uniformBelow(rng, n));
    draws = [...seen];
  }
  if (sorted) draws.sort((a, b) => a - b);

  const nf = new Intl.NumberFormat(fmt.locale, { maximumFractionDigits: 0 });
  const chance = chanceOf(BigInt(n), BigInt(count), unique, sorted);
  const chanceText =
    chance === null
      ? null
      : chance.toString().length <= 24
        ? `1 in ${nf.format(chance)}`
        : `1 in ${Number(chance).toExponential(3).replace('e+', ' × 10^')}`;
  return {
    outputs: {
      result: draws.map((d) => nf.format(d)).join(', '),
      possible: n,
      chance: chanceText,
      sum: count > 1 ? draws.reduce((a, b) => a + b, 0) : null,
    },
    explain: {
      key: count === 1 ? 'explain.one' : unique ? 'explain.unique' : 'explain.many',
      values: { n: fmt.int(count), lo: nf.format(lo), hi: nf.format(hi) },
    },
    steps: [{ key: 'step.uniform', values: { n: fmt.int(n) } }],
    warnings,
  };
};
