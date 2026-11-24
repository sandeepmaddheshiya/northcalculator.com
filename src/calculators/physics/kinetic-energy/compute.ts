import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * KE = ½mv² (OpenStax College Physics 2e Eq. 7.12; University Physics Vol. 1 Eq. 7.6), solved
 * for m = 2KE ÷ v² or v = √(2KE ÷ m). Inputs convert to SI with the exact NIST SP 811 factors
 * (1 lb = 0.45359237 kg, 1 mph = 0.44704 m/s, 1 km/h = 1/3.6 m/s). Classical mechanics only:
 * near the speed of light the formula underestimates.
 */
const KG = { kg: 1, g: 0.001, lb: 0.45359237 } as const;
const MS = { ms: 1, kmh: 1 / 3.6, mph: 0.44704 } as const;

export const compute: ComputeFn = (inputs, { fmt }) => {
  const val = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const find = inputs.find === 'mass' || inputs.find === 'speed' ? inputs.find : 'energy';
  const mu = inputs.massUnit === 'g' || inputs.massUnit === 'lb' ? inputs.massUnit : 'kg';
  const vu = inputs.speedUnit === 'kmh' || inputs.speedUnit === 'mph' ? inputs.speedUnit : 'ms';
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const mIn = val('mass');
  const vIn = val('speed');
  const kIn = val('energy');
  let m: number;
  let v: number;
  let k: number;
  if (find === 'energy') {
    if (mIn === null || vIn === null) return none();
    m = mIn * KG[mu];
    v = vIn * MS[vu];
    k = 0.5 * m * v * v;
  } else if (find === 'mass') {
    if (kIn === null || vIn === null) return none();
    if (!(vIn > 0)) return none('warn.speed');
    v = vIn * MS[vu];
    k = kIn;
    m = (2 * k) / (v * v);
  } else {
    if (kIn === null || mIn === null) return none();
    if (!(mIn > 0)) return none('warn.mass');
    m = mIn * KG[mu];
    k = kIn;
    v = Math.sqrt((2 * k) / m);
  }
  const s = (x: number) => fmt.sig(clean(x), 8);
  return {
    outputs: {
      result: clean(find === 'energy' ? k : find === 'mass' ? m : v),
      kj: clean(k / 1000),
      kg: clean(m),
      ms: clean(v),
      kmh: clean(v * 3.6),
    },
    explain: { key: 'explain', values: { m: s(m), v: s(v), k: s(k) } },
    steps: [
      ...(find !== 'mass' && mu !== 'kg'
        ? [{ key: 'step.kg', math: `${s(mIn!)} ${mu} = ${s(m)} kg` }]
        : []),
      ...(find !== 'speed' && vu !== 'ms'
        ? [{ key: 'step.ms', math: `${s(vIn!)} = ${s(v)} m/s` }]
        : []),
      find === 'energy'
        ? { key: 'step.energy', math: `½ × ${s(m)} × ${s(v)}² = ${s(k)} J` }
        : find === 'mass'
          ? { key: 'step.mass', math: `2 × ${s(k)} ÷ ${s(v)}² = ${s(m)} kg` }
          : { key: 'step.speed', math: `√(2 × ${s(k)} ÷ ${s(m)}) = ${s(v)} m/s` },
    ],
    warnings: v > 3e7 ? [{ key: 'warn.relativistic', level: 'info' }] : [],
  };
};
