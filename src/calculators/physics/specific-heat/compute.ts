import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';
import { MATERIALS } from './definition';

/**
 * Q = mcΔT (OpenStax College Physics 2e Eq. 14.2; Chemistry 2e §5.1), with c in J/(kg·°C),
 * solved for heat, specific heat, final temperature or mass. ΔT in °C equals ΔT in K. Preset
 * specific heats are from College Physics Table 14.1. kcal uses the thermochemical calorie,
 * 4.184 J (Chemistry 2e §5.1). No phase changes: melting or boiling needs latent heat too.
 */
const KCAL = 4184;

export const compute: ComputeFn = (inputs, { fmt }) => {
  const val = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const find = ['c', 'final', 'mass'].includes(String(inputs.find)) ? String(inputs.find) : 'heat';
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const mat = String(inputs.material ?? 'water');
  const c0 = mat in MATERIALS ? MATERIALS[mat]! : val('c');
  const m0 = val('mass');
  const t1 = val('t1');
  const t2v = val('t2');
  const q0 = val('heat');
  if (t1 === null) return none();
  let q: number;
  let c: number;
  let m: number;
  let t2: number;
  const s = (x: number) => fmt.sig(clean(x), 8);
  if (find === 'heat') {
    if (c0 === null || m0 === null || t2v === null) return none();
    [c, m, t2] = [c0, m0, t2v];
    q = m * c * (t2 - t1);
  } else if (find === 'c') {
    if (m0 === null || t2v === null || q0 === null) return none();
    if (!(m0 > 0) || t2v === t1) return none('warn.divide');
    [m, t2, q] = [m0, t2v, q0];
    c = q / (m * (t2 - t1));
  } else if (find === 'final') {
    if (c0 === null || m0 === null || q0 === null) return none();
    if (!(m0 > 0 && c0 > 0)) return none('warn.divide');
    [c, m, q] = [c0, m0, q0];
    t2 = t1 + q / (m * c);
  } else {
    if (c0 === null || t2v === null || q0 === null) return none();
    if (!(c0 > 0) || t2v === t1) return none('warn.divide');
    [c, t2, q] = [c0, t2v, q0];
    m = q / (c * (t2 - t1));
  }
  const dt = t2 - t1;
  const result = find === 'heat' ? q : find === 'c' ? c : find === 'final' ? t2 : m;
  return {
    outputs: { result: clean(result), kj: clean(q / 1000), kcal: clean(q / KCAL), dt: clean(dt) },
    explain: {
      key: q >= 0 ? 'explain.in' : 'explain.out',
      values: { q: s(Math.abs(q)), m: s(m), dt: s(dt) },
    },
    steps: [
      {
        key: `step.${find}`,
        math:
          find === 'heat'
            ? `${s(m)} × ${s(c)} × (${s(t2)} − ${s(t1)}) = ${s(q)} J`
            : find === 'c'
              ? `${s(q)} ÷ (${s(m)} × ${s(dt)}) = ${s(c)} J/(kg·°C)`
              : find === 'final'
                ? `${s(t1)} + ${s(q)} ÷ (${s(m)} × ${s(c)}) = ${s(t2)} °C`
                : `${s(q)} ÷ (${s(c)} × ${s(dt)}) = ${s(m)} kg`,
      },
    ],
    warnings: find === 'mass' && m < 0 ? [{ key: 'warn.sign', level: 'warn' }] : [],
  };
};
