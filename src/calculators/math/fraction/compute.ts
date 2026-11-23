import type { ComputeFn, ComputeResult, Step } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Exact fraction arithmetic with BigInt (OpenStax Prealgebra 2e §4.2, §4.5): no rounding at all.
 * Mixed numbers w n/d are read as w + n/d with the sign of w (−1 1/2 = −3/2). Sums use the least
 * common denominator; results are reduced by the greatest common divisor (Euclid's algorithm).
 */
type Q = { n: bigint; d: bigint };

const abs = (x: bigint) => (x < 0n ? -x : x);
export function gcd(a: bigint, b: bigint): bigint {
  a = abs(a);
  b = abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}
const lcm = (a: bigint, b: bigint) => (a / gcd(a, b)) * b;
function norm({ n, d }: Q): Q {
  if (d < 0n) [n, d] = [-n, -d];
  const g = gcd(n, d) || 1n;
  return { n: n / g, d: d / g };
}
/** Typographic minus (−), matching number formatting elsewhere on the site. */
export const show = (q: Q) => `${q.n < 0n ? '−' : ''}${abs(q.n)}${q.d === 1n ? '' : `/${q.d}`}`;
export function mixed(q: Q): string {
  if (abs(q.n) < q.d || q.d === 1n) return show(q);
  const w = q.n / q.d; // truncates toward zero
  const r = abs(q.n % q.d);
  return `${q.n < 0n ? '−' : ''}${abs(w)} ${r}/${q.d}`;
}

export const compute: ComputeFn = (inputs, { fmt }) => {
  const big = (k: string, dflt: number) => {
    const v = inputs[k];
    return BigInt(typeof v === 'number' && Number.isInteger(v) ? v : dflt);
  };
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const read = (p: 'a' | 'b'): Q | null => {
    const w = big(`${p}w`, 0);
    const n = big(`${p}n`, 0);
    const d = big(`${p}d`, 1);
    if (d === 0n) return null;
    // w n/d: the whole part carries the sign for mixed numbers.
    const frac = { n: abs(n) * (d < 0n ? -1n : 1n), d: abs(d) };
    if (w === 0n) return { n: n * (d < 0n ? -1n : 1n), d: abs(d) };
    return { n: w * frac.d + (w < 0n ? -frac.n : frac.n), d: frac.d };
  };
  const a = read('a');
  const b = read('b');
  if (!a || !b) return none('warn.zeroDen');

  const steps: Step[] = [];
  let r: Q;
  const A = show(a);
  const B = show(b);
  switch (inputs.op) {
    case 'sub':
    case 'add': {
      const L = lcm(a.d, b.d);
      const an = a.n * (L / a.d);
      const bn = b.n * (L / b.d);
      const sum = inputs.op === 'add' ? an + bn : an - bn;
      steps.push({
        key: 'step.lcd',
        values: { a: `${a.d}`, b: `${b.d}`, l: `${L}` },
        math: `LCD(${a.d}, ${b.d}) = ${L}`,
      });
      steps.push({ key: 'step.rewrite', math: `${A} = ${an}/${L}  ·  ${B} = ${bn}/${L}` });
      steps.push({
        key: inputs.op === 'add' ? 'step.addNum' : 'step.subNum',
        math: `${an} ${inputs.op === 'add' ? '+' : '−'} ${bn < 0n && inputs.op === 'add' ? `(${bn})` : bn} = ${sum}  →  ${sum}/${L}`,
      });
      r = { n: sum, d: L };
      break;
    }
    case 'mul':
      r = { n: a.n * b.n, d: a.d * b.d };
      steps.push({
        key: 'step.mul',
        math: `(${a.n} × ${b.n}) / (${a.d} × ${b.d}) = ${r.n}/${r.d}`,
      });
      break;
    case 'div':
      if (b.n === 0n) return none('warn.divZero');
      r = { n: a.n * b.d, d: a.d * b.n };
      steps.push({ key: 'step.reciprocal', math: `${A} ÷ ${B} = ${A} × ${b.d}/${b.n}` });
      steps.push({
        key: 'step.mul',
        math: `(${a.n} × ${b.d}) / (${a.d} × ${b.n}) = ${r.n}/${r.d}`,
      });
      break;
    default:
      return none();
  }
  const g = gcd(r.n, r.d) || 1n;
  const out = norm(r);
  if (g > 1n || r.d < 0n)
    steps.push({
      key: 'step.simplify',
      values: { g: `${g}` },
      math: `${r.n}/${r.d} = ${show(out)}`,
    });
  const decimal = clean(Number(out.n) / Number(out.d));
  return {
    outputs: {
      result: show(out),
      mixed: abs(out.n) > out.d && out.d !== 1n ? mixed(out) : out.d === 1n ? show(out) : null,
      decimal,
    },
    explain: { key: 'explain', values: { a: A, b: B, r: show(out), dec: fmt.sig(decimal, 10) } },
    steps,
    warnings: [],
  };
};
