import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';
import { gcd } from '../lcm-gcf/compute';

/**
 * bⁿ for any real exponent, with fractions typed as p/q (OpenStax Prealgebra 2e §10.5;
 * Intermediate Algebra 2e §8.3): b^(p/q) = (q√b)^p, so 27^(2/3) = 3² = 9 exactly and odd roots of
 * negative bases stay real. Integer bases with integer exponents are also shown exactly
 * (BigInt; negative exponents as 1/bⁿ) up to 200 digits.
 */
const MAX_DIGITS = 200;

export function parseExponent(raw: string): { p: number; q: number } | null {
  const s = raw.trim().replace(/[−–]/g, '-').replace(/\s+/g, '');
  let m = /^([+-]?\d+)\/(\d+)$/.exec(s);
  if (m) {
    const q = Number(m[2]);
    return q === 0 ? null : { p: Number(m[1]), q };
  }
  m = /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.exec(s);
  if (!m) return null;
  const v = Number(s);
  if (!Number.isFinite(v)) return null;
  // Terminating decimals become fractions so 0.5 is treated as 1/2.
  const [, frac = ''] = s.replace(/e.*$/i, '').split('.');
  if (/e/i.test(s) || frac.length > 9) return { p: v, q: 1 };
  const q = 10 ** frac.length;
  return { p: Math.round(v * q), q };
}

const SUP: Record<string, string> = {
  '-': '⁻',
  0: '⁰',
  1: '¹',
  2: '²',
  3: '³',
  4: '⁴',
  5: '⁵',
  6: '⁶',
  7: '⁷',
  8: '⁸',
  9: '⁹',
};
export function toScientific(v: number): string {
  if (v === 0) return '0';
  const [m, e] = v.toExponential(11).split('e') as [string, string];
  const mant = m.includes('.') ? m.replace(/0+$/, '').replace(/\.$/, '') : m;
  return `${mant} × 10${[...String(Number(e))].map((c) => SUP[c]).join('')}`;
}

const snap = (x: number) =>
  Math.abs(x - Math.round(x)) < 1e-9 * Math.max(1, Math.abs(x)) ? Math.round(x) : x;

export const compute: ComputeFn = (inputs, { fmt }) => {
  const base = typeof inputs.base === 'number' ? inputs.base : null;
  const exp = parseExponent(typeof inputs.power === 'string' ? inputs.power : '');
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  if (base === null) return none();
  if (!exp)
    return none(typeof inputs.power === 'string' && inputs.power.trim() ? 'warn.parse' : undefined);
  let { p, q } = exp;
  if (Number.isInteger(p) && q > 1) {
    const g = Number(gcd(BigInt(Math.abs(p)), BigInt(q)));
    p /= g;
    q /= g;
  }
  if (base === 0 && p / q < 0) return none('warn.zeroNegative');
  if (base < 0 && q % 2 === 0) return none('warn.evenRoot');
  if (base < 0 && !Number.isInteger(p)) return none('warn.evenRoot');

  // q-th root first (real for odd q), then the p-th power.
  const root = q === 1 ? base : Math.sign(base) * snap(Math.abs(base) ** (1 / q));
  const raw = Number.isInteger(p) ? root ** p : base ** p;
  // Exact integers stay exact; everything else drops floating-point noise past 12 digits.
  const value = Number.isSafeInteger(raw) ? raw : clean(raw);
  if (!Number.isFinite(value)) return none('warn.overflow');

  let exact: string | null = null;
  if (
    Number.isInteger(base) &&
    Number.isInteger(root) &&
    Number.isInteger(p) &&
    Math.abs(p) <= 2000
  ) {
    const n = BigInt(root) ** BigInt(Math.abs(p));
    const digits = n.toString().replace('-', '').length;
    if (digits <= MAX_DIGITS) {
      const nf = new Intl.NumberFormat(fmt.locale, { maximumFractionDigits: 0 });
      exact = p >= 0 ? nf.format(n) : `${n < 0n ? '−' : ''}1/${nf.format(n < 0n ? -n : n)}`;
    }
  }
  const expText = q === 1 ? fmt.num(p, 9) : `${p}/${q}`;
  const sci = toScientific(value);
  return {
    outputs: { result: value, exact, scientific: sci },
    explain: {
      key: 'explain',
      values: { b: fmt.num(base, 10), n: expText, r: exact ?? fmt.sig(value, 12) },
    },
    steps: [
      ...(p < 0
        ? [
            {
              key: 'step.negative',
              math: `${fmt.num(base, 10)}^${expText} = 1 ÷ ${fmt.num(base, 10)}^${q === 1 ? fmt.num(-p, 9) : `${-p}/${q}`}`,
            },
          ]
        : []),
      ...(q > 1
        ? [
            {
              key: 'step.root',
              values: { q },
              math: `${q}√${fmt.num(base, 10)} = ${fmt.sig(root, 12)}`,
            },
          ]
        : []),
      { key: 'step.power', math: `${fmt.sig(root, 12)}^${fmt.num(p, 9)} = ${fmt.sig(value, 12)}` },
    ],
    warnings: [],
  };
};
