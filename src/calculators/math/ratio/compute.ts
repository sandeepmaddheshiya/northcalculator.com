import type { ComputeFn, ComputeResult, Step } from '@/calculators/types';
import { clean } from '@/engine/money';
import { gcd } from '../lcm-gcf/compute';

/**
 * Ratios (OpenStax Prealgebra 2e §5.6, §6.5).
 * Simplify: scale A and B to whole numbers by moving the decimal point (Example 5.59), then divide
 * both by their GCF. Exact: decimals become BigInt, so 4.8 : 11.2 is exactly 48 : 112 = 3 : 7.
 * Solve: A : B = C : D ⇒ D = B × C ÷ A (cross products).
 */
export function toScaled(x: number): { n: bigint; dp: number } | null {
  if (!Number.isFinite(x) || x < 0) return null;
  const s = String(clean(x));
  if (/e/i.test(s)) return null;
  const [int, frac = ''] = s.split('.');
  return { n: BigInt(int! + frac), dp: frac.length };
}

export function simplify(a: number, b: number): [bigint, bigint] | null {
  const x = toScaled(a);
  const y = toScaled(b);
  if (!x || !y) return null;
  const dp = Math.max(x.dp, y.dp);
  const p = x.n * 10n ** BigInt(dp - x.dp);
  const q = y.n * 10n ** BigInt(dp - y.dp);
  const g = gcd(p, q);
  return g === 0n ? null : [p / g, q / g];
}

export const compute: ComputeFn = (inputs, { fmt }) => {
  const num = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const a = num('a');
  const b = num('b');
  const solve = inputs.mode === 'solve';
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  if (a === null || b === null) return none();
  if (a === 0 && b === 0) return none('warn.bothZero');
  const nf = new Intl.NumberFormat(fmt.locale, { maximumFractionDigits: 0 });
  const pair = simplify(a, b);
  const simplest = pair ? `${nf.format(pair[0])} : ${nf.format(pair[1])}` : null;
  const oneTo = a > 0 ? `1 : ${fmt.num(clean(b / a), 6)}` : null;
  const quotient = b > 0 ? clean(a / b) : null;
  const steps: Step[] = [];

  if (!solve) {
    if (!pair) return none('warn.precision');
    const x = toScaled(a)!;
    const y = toScaled(b)!;
    const dp = Math.max(x.dp, y.dp);
    if (dp > 0)
      steps.push({
        key: 'step.scale',
        values: { n: dp },
        math: `${fmt.num(a, 12)} : ${fmt.num(b, 12)} = ${fmt.num(a * 10 ** dp, 0)} : ${fmt.num(b * 10 ** dp, 0)}`,
      });
    const g = gcd(x.n * 10n ** BigInt(dp - x.dp), y.n * 10n ** BigInt(dp - y.dp));
    steps.push({
      key: 'step.gcf',
      values: { g: nf.format(g) },
      math: `÷ ${nf.format(g)} → ${simplest}`,
    });
    return {
      outputs: { result: simplest, simplest: null, oneTo, quotient },
      explain: {
        key: 'explain.simplify',
        values: { a: fmt.num(a, 12), b: fmt.num(b, 12), r: simplest! },
      },
      steps,
      warnings: [],
    };
  }

  const c = num('c');
  if (c === null) return none();
  if (a === 0) return none('warn.zeroA');
  const d = clean((b * c) / a);
  steps.push({
    key: 'step.cross',
    math: `${fmt.num(a, 12)} × D = ${fmt.num(b, 12)} × ${fmt.num(c, 12)}`,
  });
  steps.push({
    key: 'step.divide',
    math: `D = ${fmt.num(clean(b * c), 12)} ÷ ${fmt.num(a, 12)} = ${fmt.num(d, 10)}`,
  });
  return {
    outputs: { result: fmt.sig(d, 10), simplest, oneTo, quotient },
    explain: {
      key: 'explain.solve',
      values: { a: fmt.num(a, 12), b: fmt.num(b, 12), c: fmt.num(c, 12), d: fmt.num(d, 10) },
    },
    steps,
    warnings: [],
  };
};
