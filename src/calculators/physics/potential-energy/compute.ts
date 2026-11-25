import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Gravitational potential energy near a planet's surface, PE = mgh (OpenStax College Physics 2e
 * Eq. 7.27; University Physics Vol. 1 Eq. 8.5; Physics Eq. 9.5), solved for m = PE ÷ (gh) or
 * h = PE ÷ (mg). Height is measured from a reference level of your choice and may be negative.
 * For a positive height the speed after falling it from rest without air resistance is
 * v = √(2gh) (College Physics Example 7.7). Units convert with the exact NIST SP 811 factors.
 */
const KG = { kg: 1, g: 0.001, lb: 0.45359237 } as const;
const M = { m: 1, ft: 0.3048 } as const;

export const compute: ComputeFn = (inputs, { fmt }) => {
  const val = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const find = inputs.find === 'mass' || inputs.find === 'height' ? inputs.find : 'energy';
  const mu = inputs.massUnit === 'g' || inputs.massUnit === 'lb' ? inputs.massUnit : 'kg';
  const hu = inputs.heightUnit === 'ft' ? 'ft' : 'm';
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const g = val('g');
  const mIn = val('mass');
  const hIn = val('height');
  const eIn = val('energy');
  if (g === null || !(g > 0)) return none();
  let m: number;
  let h: number;
  let e: number;
  if (find === 'energy') {
    if (mIn === null || hIn === null) return none();
    m = mIn * KG[mu];
    h = hIn * M[hu];
    e = m * g * h;
  } else if (find === 'mass') {
    if (eIn === null || hIn === null) return none();
    if (hIn === 0) return none('warn.height');
    h = hIn * M[hu];
    e = eIn;
    m = e / (g * h);
    if (m < 0) return none('warn.sign');
  } else {
    if (eIn === null || mIn === null) return none();
    if (!(mIn > 0)) return none('warn.mass');
    m = mIn * KG[mu];
    e = eIn;
    h = e / (m * g);
  }
  const s = (x: number) => fmt.sig(clean(x), 8);
  const hShown = h / M[hu];
  const speed = h > 0 ? Math.sqrt(2 * g * h) : null;
  return {
    outputs: {
      result: clean(find === 'energy' ? e : find === 'mass' ? m : hShown),
      kj: clean(e / 1000),
      kg: clean(m),
      m: clean(h),
      speed: speed === null ? null : clean(speed),
    },
    explain: {
      key: h >= 0 ? 'explain' : 'explain.below',
      values: { m: s(m), h: s(Math.abs(h)), e: s(e) },
    },
    steps: [
      ...(find !== 'mass' && mu !== 'kg'
        ? [{ key: 'step.kg', math: `${s(mIn!)} ${mu} = ${s(m)} kg` }]
        : []),
      ...(find !== 'height' && hu !== 'm'
        ? [{ key: 'step.m', math: `${s(hIn!)} ft = ${s(h)} m` }]
        : []),
      find === 'energy'
        ? { key: 'step.energy', math: `${s(m)} × ${s(g)} × ${s(h)} = ${s(e)} J` }
        : find === 'mass'
          ? { key: 'step.mass', math: `${s(e)} ÷ (${s(g)} × ${s(h)}) = ${s(m)} kg` }
          : { key: 'step.height', math: `${s(e)} ÷ (${s(m)} × ${s(g)}) = ${s(h)} m` },
      ...(speed === null
        ? []
        : [{ key: 'step.speed', math: `√(2 × ${s(g)} × ${s(h)}) = ${s(speed)} m/s` }]),
    ],
    warnings: Math.abs(h) > 1e5 ? [{ key: 'warn.far', level: 'info' }] : [],
  };
};
