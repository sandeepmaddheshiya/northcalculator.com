import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Ohm’s law V = IR with electric power P = IV = I²R = V²/R (OpenStax College Physics 2e §20.2,
 * 20.4; University Physics Vol. 2 §9.4–9.5). Any two of V, I, R, P fix the other two. The
 * primary result is the first unknown: R from V and I, I from V and R or P and V, otherwise V.
 */
type Pair = 'vi' | 'vr' | 'ir' | 'pv' | 'pi' | 'pr';
const PAIRS: readonly Pair[] = ['vi', 'vr', 'ir', 'pv', 'pi', 'pr'];
const PRIMARY: Record<Pair, 'v' | 'i' | 'r'> = {
  vi: 'r',
  vr: 'i',
  ir: 'v',
  pv: 'i',
  pi: 'v',
  pr: 'v',
};
const FORMULA: Record<Pair, string> = {
  vi: 'R = V ÷ I, P = V × I',
  vr: 'I = V ÷ R, P = V² ÷ R',
  ir: 'V = I × R, P = I² × R',
  pv: 'I = P ÷ V, R = V² ÷ P',
  pi: 'V = P ÷ I, R = P ÷ I²',
  pr: 'I = √(P ÷ R), V = √(P × R)',
};

export const compute: ComputeFn = (inputs, { fmt }) => {
  const val = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const pair = (PAIRS as readonly string[]).includes(String(inputs.known))
    ? (inputs.known as Pair)
    : 'vi';
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const a = val(pair[0]!);
  const b = val(pair[1]!);
  if (a === null || b === null) return none();
  // A zero divisor leaves the circuit undefined (open or short).
  const divisor = { vi: b, vr: b, ir: 1, pv: b, pi: b, pr: b }[pair];
  if (!(divisor > 0)) return none('warn.zero');
  let v: number;
  let i: number;
  let r: number;
  let p: number;
  switch (pair) {
    case 'vi':
      [v, i] = [a, b];
      r = v / i;
      p = v * i;
      break;
    case 'vr':
      [v, r] = [a, b];
      i = v / r;
      p = (v * v) / r;
      break;
    case 'ir':
      [i, r] = [a, b];
      v = i * r;
      p = i * i * r;
      break;
    case 'pv':
      [p, v] = [a, b];
      i = p / v;
      r = (v * v) / p;
      break;
    case 'pi':
      [p, i] = [a, b];
      v = p / i;
      r = p / (i * i);
      break;
    default:
      [p, r] = [a, b];
      i = Math.sqrt(p / r);
      v = Math.sqrt(p * r);
  }
  const s = (x: number) => fmt.sig(clean(x), 8);
  const out = { v: clean(v), i: clean(i), r: Number.isFinite(r) ? clean(r) : null, p: clean(p) };
  return {
    outputs: { result: out[PRIMARY[pair]], ...out },
    explain: {
      key: Number.isFinite(r) ? 'explain' : 'explain.open',
      values: { v: s(v), i: s(i), r: Number.isFinite(r) ? s(r) : '∞', p: s(p) },
    },
    steps: [{ key: 'step.formula', math: FORMULA[pair] }],
    warnings: [],
  };
};
