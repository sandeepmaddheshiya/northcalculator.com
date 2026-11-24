import type { ComputeFn, ComputeResult, Step } from '@/calculators/types';

/**
 * Greatest common factor by Euclid's algorithm and least common multiple as lcm(a, b) =
 * a ÷ gcd(a, b) × b, folded over the list (OpenStax Prealgebra 2e §2.5; Elementary Algebra 2e
 * §7.1). BigInt keeps every LCM exact however large it grows. Prime factorizations (trial
 * division, inputs ≤ 10¹²) are shown as the working.
 */
export const MAX_VALUE = 1_000_000_000_000;
const MAX_COUNT = 50;
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const sup = (n: number) => (n === 1 ? '' : [...String(n)].map((d) => SUP[Number(d)]).join(''));

export function gcd(a: bigint, b: bigint): bigint {
  while (b) [a, b] = [b, a % b];
  return a;
}

/** Prime factorization as [prime, exponent] pairs, by trial division. n ≥ 2. */
export function factorize(n: number): [number, number][] {
  const out: [number, number][] = [];
  for (let p = 2; p * p <= n; p += p === 2 ? 1 : 2) {
    let e = 0;
    while (n % p === 0) {
      n /= p;
      e++;
    }
    if (e) out.push([p, e]);
  }
  if (n > 1) out.push([n, 1]);
  return out;
}

export const compute: ComputeFn = (inputs, { fmt }) => {
  const raw = typeof inputs.numbers === 'string' ? inputs.numbers : '';
  const tokens = raw.split(/[\s,;]+/).filter(Boolean);
  const nums: number[] = [];
  const bad: string[] = [];
  for (const tok of tokens) {
    const n = /^\+?\d+$/.test(tok) ? Number(tok) : NaN;
    if (Number.isSafeInteger(n) && n >= 1 && n <= MAX_VALUE) nums.push(n);
    else bad.push(tok);
  }
  const warnings: ComputeResult['warnings'] = [];
  if (bad.length)
    warnings.push({
      key: 'warn.ignored',
      values: { list: bad.slice(0, 5).join(', '), n: bad.length },
      level: 'info',
    });
  if (nums.length > MAX_COUNT) {
    warnings.push({ key: 'warn.many', values: { n: MAX_COUNT }, level: 'info' });
    nums.length = MAX_COUNT;
  }
  if (nums.length < 2) {
    warnings.push({ key: 'warn.two', level: 'warn' });
    const none: ComputeResult = { outputs: { result: null }, steps: [], warnings };
    return none;
  }

  const big = nums.map(BigInt);
  let g = big[0]!;
  let l = big[0]!;
  for (const b of big.slice(1)) {
    g = gcd(g, b);
    l = (l / gcd(l, b)) * b;
  }
  const nf = new Intl.NumberFormat(fmt.locale, { maximumFractionDigits: 0 });
  const show = (n: bigint | number) => nf.format(n);

  const steps: Step[] = [];
  const facts = nums.slice(0, 10).map((n) => [n, n === 1 ? [] : factorize(n)] as const);
  const fstr = (f: readonly [number, number][]) =>
    f.length ? f.map(([p, e]) => `${show(p)}${sup(e)}`).join(' × ') : '1';
  steps.push({
    key: 'step.factor',
    math: facts.map(([n, f]) => `${show(n)} = ${fstr(f)}`).join('\n'),
  });
  if (nums.length <= 10) {
    const primes = [...new Set(facts.flatMap(([, f]) => f.map(([p]) => p)))].sort((a, b) => a - b);
    const exp = (f: readonly [number, number][], p: number) => f.find(([q]) => q === p)?.[1] ?? 0;
    const low = primes
      .map((p) => [p, Math.min(...facts.map(([, f]) => exp(f, p)))] as [number, number])
      .filter(([, e]) => e > 0);
    const high = primes.map(
      (p) => [p, Math.max(...facts.map(([, f]) => exp(f, p)))] as [number, number],
    );
    steps.push({ key: 'step.gcf', math: `${fstr(low)} = ${show(g)}` });
    steps.push({ key: 'step.lcm', math: `${fstr(high)} = ${show(l)}` });
  }
  if (nums.length === 2) {
    steps.push({
      key: 'step.identity',
      math: `${show(nums[0]!)} × ${show(nums[1]!)} ÷ ${show(g)} = ${show(l)}`,
    });
  }
  if (g === 1n) warnings.push({ key: 'warn.coprime', level: 'info' });

  const find = inputs.find === 'lcm' ? 'lcm' : 'gcf';
  return {
    outputs: { result: show(find === 'lcm' ? l : g), gcf: show(g), lcm: show(l) },
    explain: {
      key: `explain.${find}`,
      values: { list: nums.map(show).join(', '), r: show(find === 'lcm' ? l : g) },
    },
    steps,
    warnings,
  };
};
