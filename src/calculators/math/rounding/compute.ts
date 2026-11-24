import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { localeSeparators } from '@/engine/parse';
import { METHODS } from './definition';

/**
 * Rounding on the decimal digits exactly as typed (no binary floating point, so 92.85 is really
 * 92.85). A number is sign × C × 10^E with C a BigInt. Rounding to decimal places n keeps
 * exponent −n; to s significant figures keeps exponent (position of the first digit) − s + 1.
 * Half-way rules follow IEEE 754 names; "half even" is the rule in OpenStax Chemistry 2e §1.5,
 * "half up" (half away from zero) the one taught in OpenStax Prealgebra 2e §5.1.
 */
type Method = (typeof METHODS)[number];
export interface Dec {
  neg: boolean;
  c: bigint;
  e: number;
}

export function parseDecimal(raw: string, locale = 'en'): { dec: Dec; sig: number | null } | null {
  const { decimal } = localeSeparators(locale);
  let s = raw
    .trim()
    .replace(/[\s_']/g, '')
    .replace(/[−–]/g, '-');
  s = decimal === ',' ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
  const m = /^([+-])?(\d*)(?:\.(\d*))?(?:[eE]([+-]?\d{1,4}))?$/.exec(s);
  if (!m || !/\d/.test((m[2] ?? '') + (m[3] ?? ''))) return null;
  const int = m[2] ?? '';
  const frac = m[3] ?? '';
  const exp = m[4] ? Number(m[4]) : 0;
  const c = BigInt(int + frac || '0');
  // Significant figures of the input as written (OpenStax Chemistry 2e §1.5).
  let digits = (int + frac).replace(/^0+/, '');
  if (m[3] === undefined && !m[4]) digits = digits.replace(/0+$/, ''); // 1300 → ambiguous zeros
  const sig = c === 0n ? null : digits.length;
  return { dec: { neg: m[1] === '-' && c !== 0n, c, e: exp - frac.length }, sig };
}

export function roundDec(x: Dec, t: number, method: Method): Dec {
  if (x.e >= t) return x;
  const div = 10n ** BigInt(t - x.e);
  let q = x.c / div;
  const r = x.c % div;
  const twice = 2n * r;
  const up =
    method === 'halfUp'
      ? twice >= div
      : method === 'halfDown'
        ? twice > div
        : method === 'halfEven'
          ? twice > div || (twice === div && q % 2n === 1n)
          : method === 'up'
            ? r > 0n
            : method === 'down'
              ? false
              : method === 'ceiling'
                ? r > 0n && !x.neg
                : r > 0n && x.neg; // floor
  if (up) q += 1n;
  return { neg: x.neg && q !== 0n, c: q, e: t };
}

/** Plain decimal text, showing at least `minDp` decimal places (padding zeros). */
export function formatDec(x: Dec, minDp = 0): string {
  let { c, e } = x;
  if (-e < minDp) {
    c *= 10n ** BigInt(minDp + e);
    e = -minDp;
  }
  let s = c.toString();
  if (e >= 0) s += '0'.repeat(e);
  else {
    s = s.padStart(-e + 1, '0');
    s = `${s.slice(0, e)}.${s.slice(e)}`;
  }
  return (x.neg ? '-' : '') + s;
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

export function scientific(x: Dec): string {
  if (x.c === 0n) return '0';
  const s = x.c.toString();
  const n = x.e + s.length - 1;
  const mant = s.length > 1 ? `${s[0]}.${s.slice(1)}` : s;
  return `${x.neg ? '-' : ''}${mant} × 10${[...String(n)].map((ch) => SUP[ch]).join('')}`;
}

export const compute: ComputeFn = (inputs, { fmt }) => {
  const parsed = parseDecimal(typeof inputs.value === 'string' ? inputs.value : '', fmt.locale);
  const digits = typeof inputs.digits === 'number' ? Math.trunc(inputs.digits) : null;
  const method = (METHODS as readonly string[]).includes(String(inputs.method))
    ? (inputs.method as Method)
    : 'halfUp';
  const sf = inputs.to === 'sf';
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  if (!parsed)
    return none(typeof inputs.value === 'string' && inputs.value.trim() ? 'warn.parse' : undefined);
  if (digits === null) return none();
  if (sf && digits < 1) return none('warn.sf');
  const { dec, sig } = parsed;

  let t: number;
  if (sf) {
    if (dec.c === 0n) t = -digits + 1;
    else t = dec.e + dec.c.toString().length - 1 - digits + 1;
  } else t = -digits;
  let r = roundDec(dec, t, method);
  let tf = t;
  // Significant figures: a carry (9.99 → 10.0) adds a digit; drop the extra trailing zero.
  if (sf && r.c !== 0n && r.c.toString().length > digits && r.c % 10n === 0n) {
    r = { ...r, c: r.c / 10n, e: r.e + 1 };
    tf += 1;
  }
  const shownDp = Math.max(0, -tf);
  const result = formatDec(r, shownDp);
  const exact = formatDec(dec);

  const warnings: ComputeResult['warnings'] = [];
  if (dec.e >= t) warnings.push({ key: 'warn.exact', level: 'info' });
  if (sf && t > 0 && r.c % 10n === 0n) warnings.push({ key: 'warn.ambiguous', level: 'info' });

  return {
    outputs: { result, scientific: scientific(r), sigfigs: sig },
    explain: {
      key: sf ? 'explain.sf' : digits < 0 ? 'explain.place' : 'explain.dp',
      values: { x: exact, r: result, n: Math.abs(digits), p: fmt.int(10 ** Math.min(15, -digits)) },
    },
    steps: [
      { key: sf ? 'step.keepSf' : 'step.keepDp', values: { n: digits } },
      { key: `step.${method}`, math: `${exact} ≈ ${result}` },
    ],
    warnings,
  };
};
