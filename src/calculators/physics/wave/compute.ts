import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * v = fλ and T = 1/f (OpenStax College Physics 2e §16.9; University Physics Vol. 1 §16.1),
 * for any wave. Speeds can be entered as multiples of c = 299,792,458 m/s, exact by the SI
 * definition of the metre.
 */
export const C = 299792458;
const MS = { ms: 1, kms: 1000, c: C } as const;
const HZ = { Hz: 1, kHz: 1e3, MHz: 1e6, GHz: 1e9, THz: 1e12 } as const;
const M = { km: 1000, m: 1, cm: 0.01, mm: 0.001, um: 1e-6, nm: 1e-9 } as const;
const pick = <T extends object>(map: T, v: unknown, d: keyof T): keyof T =>
  typeof v === 'string' && v in map ? (v as keyof T) : d;

export const compute: ComputeFn = (inputs, ctx) => {
  const { fmt } = ctx;
  const t = ctx.t ?? ((k: string) => k.replace(/^sym\./, ''));
  const val = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const find = inputs.find === 'speed' || inputs.find === 'frequency' ? inputs.find : 'wavelength';
  const vu = pick(MS, inputs.vu, 'ms');
  const fu = pick(HZ, inputs.fu, 'Hz');
  const lu = pick(M, inputs.lu, 'm');
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  let v = 0;
  let f = 0;
  let l = 0;
  if (find !== 'speed') {
    const x = val('speed');
    if (x === null) return none();
    v = x * MS[vu];
  }
  if (find !== 'frequency') {
    const x = val('frequency');
    if (x === null) return none();
    f = x * HZ[fu];
  }
  if (find !== 'wavelength') {
    const x = val('wavelength');
    if (x === null) return none();
    l = x * M[lu];
  }
  if (find === 'speed') v = f * l;
  else if (find === 'frequency') {
    if (!(l > 0)) return none('warn.zero');
    f = v / l;
  } else {
    if (!(f > 0)) return none('warn.zero');
    l = v / f;
  }
  const s = (x: number) => fmt.sig(clean(x), 10);
  const result =
    find === 'speed'
      ? `${s(v / MS[vu])} ${t(`sym.${String(vu)}`)}`
      : find === 'frequency'
        ? `${s(f / HZ[fu])} ${t(`sym.${String(fu)}`)}`
        : `${s(l / M[lu])} ${t(`sym.${String(lu)}`)}`;
  return {
    outputs: {
      result,
      ms: clean(v),
      hz: clean(f),
      m: clean(l),
      period: f > 0 ? clean(1 / f) : null,
    },
    explain: { key: 'explain', values: { v: s(v), f: s(f), l: s(l) } },
    steps: [
      find === 'speed'
        ? { key: 'step.speed', math: `${s(f)} Hz × ${s(l)} m = ${s(v)} m/s` }
        : find === 'frequency'
          ? { key: 'step.frequency', math: `${s(v)} m/s ÷ ${s(l)} m = ${s(f)} Hz` }
          : { key: 'step.wavelength', math: `${s(v)} m/s ÷ ${s(f)} Hz = ${s(l)} m` },
    ],
    warnings: v > C * (1 + 1e-12) ? [{ key: 'warn.fast', level: 'info' }] : [],
  };
};
