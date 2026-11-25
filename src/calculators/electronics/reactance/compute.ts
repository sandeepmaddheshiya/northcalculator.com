import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Reactance of an ideal inductor X_L = 2πfL and capacitor X_C = 1 ÷ (2πfC) (OpenStax College
 * Physics 2e Eqs. 23.52, 23.58; University Physics Vol. 2 Eqs. 15.3, 15.8), the current
 * I = V ÷ |X| at a given rms (or peak) voltage, and for an LC pair the net series reactance
 * X_L − X_C and the resonant frequency f₀ = 1 ÷ (2π√(LC)) (College Physics Eq. 23.72).
 * Resistance is ignored: real coils and capacitors also have some.
 */
const HZ = { Hz: 1, kHz: 1e3, MHz: 1e6 } as const;
const HENRY = { H: 1, mH: 1e-3, uH: 1e-6 } as const;
const FARAD = { F: 1, uF: 1e-6, nF: 1e-9, pF: 1e-12 } as const;

const pick = <T extends Record<string, number>>(map: T, v: unknown, d: keyof T): keyof T =>
  typeof v === 'string' && v in map ? (v as keyof T) : d;

export const compute: ComputeFn = (inputs, { fmt }) => {
  const val = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const comp = inputs.comp === 'C' || inputs.comp === 'LC' ? inputs.comp : 'L';
  const none = (key?: string): ComputeResult => ({
    outputs: { x: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const fIn = val('f');
  const lIn = val('L');
  const cIn = val('C');
  const V = val('V');
  if (fIn === null) return none();
  const f = fIn * HZ[pick(HZ, inputs.fu, 'Hz')];
  const L = comp === 'C' || lIn === null ? null : lIn * HENRY[pick(HENRY, inputs.lu, 'mH')];
  const C = comp === 'L' || cIn === null ? null : cIn * FARAD[pick(FARAD, inputs.cu, 'uF')];
  if ((comp !== 'C' && L === null) || (comp !== 'L' && C === null)) return none();
  if ((L !== null && !(L > 0)) || (C !== null && !(C > 0))) return none('warn.zero');
  if (!(f > 0) && comp !== 'L') return none('warn.dc');

  const w = 2 * Math.PI * f;
  const xl = L === null ? null : w * L;
  const xc = C === null ? null : 1 / (w * C);
  const x = comp === 'L' ? xl! : comp === 'C' ? xc! : xl! - xc!;
  const f0 = L !== null && C !== null ? 1 / (2 * Math.PI * Math.sqrt(L * C)) : null;
  // At f₀ the two reactances cancel up to rounding; treat that residue as zero.
  const tiny = comp === 'LC' ? 1e-9 * Math.max(xl!, xc!) : 0;
  const current = V !== null && Math.abs(x) > tiny ? V / Math.abs(x) : null;
  const s = (v: number) => fmt.sig(clean(v), 8);

  const steps: ComputeResult['steps'] = [
    { key: 'step.omega', math: `2π × ${s(f)} Hz = ${s(w)} rad/s` },
  ];
  if (xl !== null) steps.push({ key: 'step.xl', math: `${s(w)} × ${s(L!)} H = ${s(xl)} Ω` });
  if (xc !== null) steps.push({ key: 'step.xc', math: `1 ÷ (${s(w)} × ${s(C!)} F) = ${s(xc)} Ω` });
  if (comp === 'LC') {
    steps.push({ key: 'step.net', math: `${s(xl!)} − ${s(xc!)} = ${s(x)} Ω` });
    steps.push({ key: 'step.f0', math: `1 ÷ (2π√(${s(L!)} × ${s(C!)})) = ${s(f0!)} Hz` });
  }
  if (current !== null)
    steps.push({ key: 'step.current', math: `${s(V!)} V ÷ ${s(Math.abs(x))} Ω = ${s(current)} A` });

  return {
    outputs: {
      x: Math.abs(x) <= tiny ? 0 : clean(x),
      xl: comp === 'LC' ? clean(xl!) : null,
      xc: comp === 'LC' ? clean(xc!) : null,
      current: current === null ? null : clean(current),
      f0: f0 === null ? null : clean(f0),
      omega: clean(w),
    },
    explain: {
      key:
        comp === 'LC'
          ? x > tiny
            ? 'explain.inductive'
            : x < -tiny
              ? 'explain.capacitive'
              : 'explain.resonant'
          : 'explain.single',
      values: { x: s(Math.abs(x)), f: s(f), f0: f0 === null ? '' : s(f0) },
    },
    steps,
    warnings: comp === 'L' && f === 0 ? [{ key: 'warn.dcL', level: 'info' }] : [],
  };
};
