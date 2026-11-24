import type { ComputeFn } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * sin, cos, tan and their reciprocals for an angle in degrees or radians (θ/180 = θ_R/π,
 * OpenStax Algebra and Trigonometry 2e §7.1). For multiples of 15° the exact value comes from
 * NIST DLMF Table 4.17.1, with the quadrant sign from the reference angle (§7.3); the decimal is
 * then computed from the reference angle so that, say, sin 180° is exactly 0.
 */
const MINUS = '−';
// Exact values on 0°, 15°, …, 90° (DLMF Table 4.17.1). null = undefined (division by zero).
const SIN: Record<number, string> = {
  0: '0',
  15: '(√6 − √2)/4',
  30: '1/2',
  45: '√2/2',
  60: '√3/2',
  75: '(√6 + √2)/4',
  90: '1',
};
const TAN: Record<number, string | null> = {
  0: '0',
  15: '2 − √3',
  30: '√3/3',
  45: '1',
  60: '√3',
  75: '2 + √3',
  90: null,
};
const SEC: Record<number, string | null> = {
  0: '1',
  15: '√6 − √2',
  30: '2√3/3',
  45: '√2',
  60: '2',
  75: '√6 + √2',
  90: null,
};

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
/** deg as a multiple of π: 15 → "π/12", 300 → "5π/3". */
export function piFraction(deg: number): string {
  if (deg === 0) return '0';
  const g = gcd(Math.abs(deg), 180);
  const p = deg / g;
  const q = 180 / g;
  const num = p === 1 ? 'π' : p === -1 ? `${MINUS}π` : `${String(p).replace('-', MINUS)}π`;
  return q === 1 ? num : `${num}/${q}`;
}

export const compute: ComputeFn = (inputs, ctx): ReturnType<ComputeFn> => {
  const { fmt } = ctx;
  const t = ctx.t ?? ((k: string) => k);
  const a = typeof inputs.angle === 'number' ? inputs.angle : null;
  if (a === null) return { outputs: { sin: null }, steps: [], warnings: [] };
  const rad = inputs.unit === 'rad';
  const deg = rad ? (a * 180) / Math.PI : a;
  const theta = rad ? a : (a * Math.PI) / 180;
  const d9 = (x: number) => fmt.sig(clean(x), 9).replace(/^-/, MINUS);

  // Normalise to [0, 360) and find the reference angle and quadrant signs.
  const norm = ((deg % 360) + 360) % 360;
  const k15 = Math.round(deg / 15);
  const exact = Math.abs(deg - k15 * 15) <= 1e-9 * Math.max(1, Math.abs(deg));
  const n = exact ? (((k15 * 15) % 360) + 360) % 360 : norm;
  const ref = n <= 90 ? n : n <= 180 ? 180 - n : n <= 270 ? n - 180 : 360 - n;
  const sSign = n > 180 ? -1 : 1;
  const cSign = n > 90 && n < 270 ? -1 : 1;

  const refRad = (ref * Math.PI) / 180;
  const sinV = exact ? sSign * Math.sin(refRad) : Math.sin(theta);
  const cosV = exact ? cSign * Math.cos(refRad) : Math.cos(theta);
  const zeroSin = exact && ref === 0;
  const zeroCos = exact && ref === 90;
  const values = {
    sin: zeroSin ? 0 : sinV,
    cos: zeroCos ? 0 : cosV,
    tan: zeroCos ? null : zeroSin ? 0 : sinV / cosV,
    csc: zeroSin ? null : 1 / sinV,
    sec: zeroCos ? null : 1 / cosV,
    cot: zeroSin ? null : zeroCos ? 0 : cosV / sinV,
  };
  const signed = (s: string, sign: number) =>
    sign < 0 && s !== '0' ? `${MINUS}${s.includes(' ') && !s.startsWith('(') ? `(${s})` : s}` : s;
  const exactOf = (f: keyof typeof values): string | null => {
    if (!exact) return null;
    const ts = sSign * cSign;
    switch (f) {
      case 'sin':
        return signed(SIN[ref]!, sSign);
      case 'cos':
        return signed(SIN[90 - ref]!, cSign);
      case 'tan':
        return TAN[ref] == null ? null : signed(TAN[ref]!, ts);
      case 'cot':
        return TAN[90 - ref] == null ? null : signed(TAN[90 - ref]!, ts);
      case 'sec':
        return SEC[ref] == null ? null : signed(SEC[ref]!, cSign);
      default:
        return SEC[90 - ref] == null ? null : signed(SEC[90 - ref]!, sSign);
    }
  };
  const show = (f: keyof typeof values): string => {
    const v = values[f];
    if (v === null) return t('undefined');
    const e = exactOf(f);
    const dec = d9(v);
    if (e === null || e === dec) return dec;
    return `${e} ${e.includes('√') ? '≈' : '='} ${dec}`;
  };
  const converted = rad
    ? `${d9(deg)}°`
    : exact
      ? `${piFraction(k15 * 15)} ≈ ${d9(theta)} rad`
      : `${d9(theta)} rad`;
  return {
    outputs: {
      sin: show('sin'),
      cos: show('cos'),
      tan: show('tan'),
      csc: show('csc'),
      sec: show('sec'),
      cot: show('cot'),
      converted,
      reference: clean(ref),
    },
    explain: {
      key: 'explain',
      values: {
        deg: d9(deg),
        ref: d9(ref),
        q: n === 0 || n % 90 === 0 ? '—' : String(Math.floor(n / 90) + 1),
      },
    },
    steps: [
      ...(rad
        ? [{ key: 'step.toDeg', math: `${d9(a)} × 180 ÷ π = ${d9(deg)}°` }]
        : [{ key: 'step.toRad', math: `${d9(a)} × π ÷ 180 = ${d9(theta)} rad` }]),
      { key: 'step.ref', math: `${d9(n)}° → ${d9(ref)}°` },
    ],
    warnings: [],
  };
};
