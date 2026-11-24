import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Newton’s second law F = ma (OpenStax College Physics 2e Eq. 4.4; University Physics Vol. 1
 * Eq. 5.4), solved for any one of the three. Units via NIST SP 811: 1 lbf = gₙ × 1 lb =
 * 4.4482216152605 N, gₙ = 9.80665 m/s², 1 ft = 0.3048 m. “Weight” is the mass times gₙ.
 */
export const GN = 9.80665;
const N = { N: 1, kN: 1000, lbf: 0.45359237 * GN } as const;
const KG = { kg: 1, g: 0.001, lb: 0.45359237 } as const;
const MS2 = { ms2: 1, g: GN, fts2: 0.3048 } as const;
const pick = <T extends object>(map: T, v: unknown, d: keyof T): keyof T =>
  typeof v === 'string' && v in map ? (v as keyof T) : d;

export const compute: ComputeFn = (inputs, ctx) => {
  const { fmt } = ctx;
  const t = ctx.t ?? ((k: string) => k);
  const val = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const find = inputs.find === 'force' || inputs.find === 'mass' ? inputs.find : 'accel';
  const fu = pick(N, inputs.fu, 'N');
  const mu = pick(KG, inputs.mu, 'kg');
  const au = pick(MS2, inputs.au, 'ms2');
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  let f = 0;
  let m = 0;
  let a = 0;
  if (find === 'force') {
    const x = val('mass');
    const y = val('accel');
    if (x === null || y === null) return none();
    m = x * KG[mu];
    a = y * MS2[au];
    f = m * a;
  } else if (find === 'mass') {
    const x = val('force');
    const y = val('accel');
    if (x === null || y === null) return none();
    if (!(y > 0)) return none('warn.accel');
    f = x * N[fu];
    a = y * MS2[au];
    m = f / a;
  } else {
    const x = val('force');
    const y = val('mass');
    if (x === null || y === null) return none();
    if (!(y > 0)) return none('warn.mass');
    f = x * N[fu];
    m = y * KG[mu];
    a = f / m;
  }
  const s = (x: number) => fmt.sig(clean(x), 8);
  const result =
    find === 'force'
      ? `${s(f / N[fu])} ${t(`sym.${String(fu)}`)}`
      : find === 'mass'
        ? `${s(m / KG[mu])} ${t(`sym.${String(mu)}`)}`
        : `${s(a / MS2[au])} ${t(`sym.${String(au)}`)}`;
  return {
    outputs: { result, N: clean(f), kg: clean(m), ms2: clean(a), weight: clean(m * GN) },
    explain: { key: 'explain', values: { f: s(f), m: s(m), a: s(a) } },
    steps: [
      find === 'force'
        ? { key: 'step.force', math: `${s(m)} kg × ${s(a)} m/s² = ${s(f)} N` }
        : find === 'mass'
          ? { key: 'step.mass', math: `${s(f)} N ÷ ${s(a)} m/s² = ${s(m)} kg` }
          : { key: 'step.accel', math: `${s(f)} N ÷ ${s(m)} kg = ${s(a)} m/s²` },
    ],
    warnings: [],
  };
};
