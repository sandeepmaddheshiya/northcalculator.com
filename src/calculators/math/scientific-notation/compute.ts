import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { formatDec, parseDecimal, roundDec, type Dec } from '../rounding/compute';

/**
 * Scientific notation a × 10ⁿ with 1 ≤ |a| < 10 (OpenStax Prealgebra 2e §10.5), computed on the
 * typed decimal digits exactly (no binary floating point). Engineering notation uses exponents
 * that are multiples of 3, matching SI prefixes (NIST SP 811). Optionally rounds to s
 * significant figures, half up.
 */
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
const sup = (n: number) => [...String(n)].map((c) => SUP[c]).join('');

/** Accept "6.2 × 10^3", "6.2x10^-3", "6.2*10**3", "6.2·10⁻³" as well as e-notation. */
export function normalize(raw: string): string {
  const fromSup: Record<string, string> = {
    '⁻': '-',
    '⁰': '0',
    '¹': '1',
    '²': '2',
    '³': '3',
    '⁴': '4',
    '⁵': '5',
    '⁶': '6',
    '⁷': '7',
    '⁸': '8',
    '⁹': '9',
  };
  return raw
    .trim()
    .replace(/[⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, (m) => `^${[...m].map((c) => fromSup[c]).join('')}`)
    .replace(/\s*[×x*·]\s*10\s*(\^|\*\*)\s*/i, 'e');
}

/** Mantissa digits and exponent of x (non-zero): x = d.ddd × 10^exp. */
function parts(x: Dec): { digits: string; exp: number } {
  const digits = x.c.toString().replace(/0+$/, '') || '0';
  const trailing = x.c.toString().length - digits.length;
  return { digits, exp: x.e + trailing + digits.length - 1 };
}

export const compute: ComputeFn = (inputs, { fmt }) => {
  const raw = typeof inputs.value === 'string' ? inputs.value : '';
  const parsed = parseDecimal(normalize(raw), fmt.locale);
  if (!parsed) {
    const none: ComputeResult = {
      outputs: { scientific: null },
      steps: [],
      warnings: raw.trim() ? [{ key: 'warn.parse', level: 'warn' }] : [],
    };
    return none;
  }
  let x = parsed.dec;
  const sig = typeof inputs.sig === 'number' ? Math.trunc(inputs.sig) : 0;
  if (x.c === 0n) {
    return {
      outputs: { scientific: '0', eNotation: '0', engineering: '0', decimal: '0' },
      steps: [],
      warnings: [],
    };
  }
  if (sig > 0) {
    const msd = x.e + x.c.toString().length - 1;
    x = roundDec(x, msd - sig + 1, 'halfUp');
  }
  const { digits, exp } = parts(x);
  const sign = x.neg ? '−' : '';
  const ascii = x.neg ? '-' : '';
  const pad = sig > digits.length ? '0'.repeat(sig - digits.length) : '';
  const mant = (lead: number) => {
    const all = digits + pad;
    const intPart = all.slice(0, lead).padEnd(lead, '0');
    const frac = all.slice(lead);
    return frac ? `${intPart}.${frac}` : intPart;
  };
  const engExp = Math.floor(exp / 3) * 3;
  const scientific = `${sign}${mant(1)} × 10${sup(exp)}`;
  return {
    outputs: {
      scientific,
      eNotation: `${ascii}${mant(1)}e${exp}`,
      engineering: `${sign}${mant(exp - engExp + 1)} × 10${sup(engExp)}`,
      decimal: formatDec(x).replace(/^-/, '−'),
    },
    explain: {
      key: exp >= 0 ? 'explain.big' : 'explain.small',
      values: { s: scientific, n: Math.abs(exp) },
    },
    steps: [
      {
        key: exp >= 0 ? 'step.moveLeft' : 'step.moveRight',
        values: { n: Math.abs(exp) },
        math: `${formatDec(parsed.dec)} → ${mant(1)}`,
      },
      { key: exp >= 0 ? 'step.positive' : 'step.negative', math: `${mant(1)} × 10${sup(exp)}` },
    ],
    warnings: [],
  };
};
