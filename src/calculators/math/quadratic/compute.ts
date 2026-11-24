import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * ax² + bx + c = 0 by the quadratic formula x = (−b ± √(b² − 4ac)) ÷ 2a (OpenStax Intermediate
 * Algebra 2e §9.3; College Algebra 2e §2.5). Real roots use the cancellation-free form
 * q = −(b + sign(b)√D)/2, x₁ = q/a, x₂ = c/q. For integer coefficients the exact answer is also
 * given in simplest radical form, with i for complex roots.
 */
const MINUS = '−';
const neg = (s: string) => s.replace(/^-/, MINUS);
const gcd = (a: number, b: number): number => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
};
const frac = (p: number, q: number) => {
  if (q < 0) [p, q] = [-p, -q];
  const g = gcd(p, q) || 1;
  return q / g === 1 ? neg(String(p / g)) : `${neg(String(p / g))}/${q / g}`;
};

/** √n = k√m with m square-free. */
export function simplifyRoot(n: number): [number, number] {
  let k = 1;
  let m = n;
  for (let f = 2; f * f <= m; f++) {
    while (m % (f * f) === 0) {
      m /= f * f;
      k *= f;
    }
  }
  return [k, m];
}

export function exactRoots(a: number, b: number, c: number): string | null {
  const ok = (x: number) => Number.isInteger(x) && Math.abs(x) <= 1e6;
  if (!ok(a) || !ok(b) || !ok(c) || a === 0) return null;
  const d = b * b - 4 * a * c;
  const den = 2 * a;
  const s = Math.sqrt(Math.abs(d));
  if (d >= 0 && Number.isInteger(s)) {
    if (s === 0) return frac(-b, den);
    const r = [(-b + s) / den, (-b - s) / den];
    const [hi, lo] = r[0]! >= r[1]! ? [-b + s, -b - s] : [-b - s, -b + s];
    return `${frac(hi, den)} or ${frac(lo, den)}`;
  }
  const [k, m] = simplifyRoot(Math.abs(d));
  let g = gcd(gcd(b, k), den);
  if (den < 0) g = -g;
  const p = -b / g;
  const kk = k / g < 0 ? -k / g : k / g;
  const q = den / g;
  const i = d < 0 ? 'i' : '';
  const rad = m === 1 ? `${kk === 1 ? '' : kk}${i}` : `${kk === 1 ? '' : kk}${i}√${m}`;
  const top = p === 0 ? `±${rad}` : `${neg(String(p))} ± ${rad}`;
  return q === 1 ? top : p === 0 ? `${top}/${q}` : `(${top})/${q}`;
}

export const compute: ComputeFn = (inputs, ctx) => {
  const { fmt } = ctx;
  const t =
    ctx.t ??
    ((k: string, v?: Record<string, string | number>) => (v ? Object.values(v).join(' or ') : k));
  const val = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const a = val('a');
  const b = val('b');
  const c = val('c');
  const none = (key?: string): ComputeResult => ({
    outputs: { roots: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  if (a === null || b === null || c === null) return none();
  const s = (x: number) => neg(fmt.sig(clean(x), 10));
  if (a === 0) {
    if (b === 0) return none('warn.degenerate');
    const x = -c / b;
    return {
      outputs: { roots: s(x), exact: null, discriminant: null, kind: t('kind.linear') },
      steps: [{ key: 'step.linear', math: `x = −c ÷ b = ${s(x)}` }],
      warnings: [{ key: 'warn.linear', level: 'info' }],
    };
  }
  const d = b * b - 4 * a * c;
  let roots: string;
  let kind: string;
  if (d > 0) {
    const q = -(b + Math.sign(b || 1) * Math.sqrt(d)) / 2;
    const x1 = q / a;
    const x2 = q === 0 ? -b / a : c / q;
    const [hi, lo] = x1 >= x2 ? [x1, x2] : [x2, x1];
    roots = t('roots.two', { x1: s(hi), x2: s(lo) });
    kind = t('kind.two');
  } else if (d === 0) {
    roots = s(-b / (2 * a));
    kind = t('kind.one');
  } else {
    const re = -b / (2 * a);
    const im = Math.abs(Math.sqrt(-d) / (2 * a));
    roots = `${re === 0 ? '' : `${s(re)} `}±${re === 0 ? '' : ' '}${s(im)}i`;
    kind = t('kind.complex');
  }
  const exact = exactRoots(a, b, c);
  return {
    outputs: {
      roots,
      exact: exact === null ? null : exact.replace(' or ', ` ${t('word.or')} `),
      discriminant: clean(d),
      kind,
    },
    explain: { key: 'explain', values: { roots, kind: kind.toLowerCase() } },
    steps: [
      { key: 'step.d', math: `${s(b)}² − 4 × ${s(a)} × ${s(c)} = ${s(d)}` },
      {
        key: 'step.formula',
        math: `x = (${s(-b)} ± √${d < 0 ? `(${s(d)})` : s(d)}) ÷ ${s(2 * a)}`,
      },
    ],
    warnings: [],
  };
};
