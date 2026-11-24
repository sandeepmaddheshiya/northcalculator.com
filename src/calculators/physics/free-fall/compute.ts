import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Free fall without air resistance (OpenStax College Physics 2e §2.7; University Physics Vol. 1
 * §3.5), measuring downward as positive with an optional downward launch speed v₀:
 *   from a height h: t = (−v₀ + √(v₀² + 2gh)) ÷ g, v = v₀ + gt
 *   from a time t:   d = v₀t + ½gt², v = v₀ + gt
 * The default g is standard gravity, 9.80665 m/s² (NIST SP 811); textbooks often use 9.80 or 9.8.
 */
const FT = 0.3048;

export const compute: ComputeFn = (inputs, { fmt }) => {
  const val = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const fromTime = inputs.known === 'time';
  const ft = inputs.hu === 'ft';
  const g = val('g') ?? 9.80665;
  const v0m = val('v0') ?? 0; // in m/s, or ft/s when heights are in feet
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  if (!(g > 0)) return none('warn.g');
  const v0 = ft ? v0m * FT : v0m;
  let t: number;
  let d: number; // metres
  if (fromTime) {
    const x = val('time');
    if (x === null) return none();
    t = x;
    d = v0 * t + 0.5 * g * t * t;
  } else {
    const h = val('height');
    if (h === null) return none();
    d = ft ? h * FT : h;
    // Rationalised form of (−v₀ + √(v₀² + 2gh)) ÷ g avoids cancellation when v₀ ≫ gh.
    t = d === 0 ? 0 : (2 * d) / (v0 + Math.sqrt(v0 * v0 + 2 * g * d));
  }
  const v = v0 + g * t;
  const unit = ft ? FT : 1;
  const s = (x: number) => fmt.sig(clean(x), 8);
  return {
    outputs: {
      result: clean(fromTime ? d / unit : t),
      speed: clean(v / unit),
      kmh: clean(v * 3.6),
      mph: clean(v / 0.44704),
      distance: clean(d / unit),
    },
    explain: {
      key: ft ? 'explain.ft' : 'explain.m',
      values: { d: s(d / unit), t: s(t), v: s(v / unit) },
    },
    steps: fromTime
      ? [
          {
            key: 'step.distance',
            math: `${s(v0 / unit)} × ${s(t)} + ½ × ${s(g / unit)} × ${s(t)}² = ${s(d / unit)}`,
          },
          {
            key: 'step.speed',
            math: `${s(v0 / unit)} + ${s(g / unit)} × ${s(t)} = ${s(v / unit)}`,
          },
        ]
      : [
          {
            key: 'step.time',
            math: `(−${s(v0 / unit)} + √(${s(v0 / unit)}² + 2 × ${s(g / unit)} × ${s(d / unit)})) ÷ ${s(g / unit)} = ${s(t)} s`,
          },
          {
            key: 'step.speed',
            math: `${s(v0 / unit)} + ${s(g / unit)} × ${s(t)} = ${s(v / unit)}`,
          },
        ],
    warnings: v > 50 ? [{ key: 'warn.air', level: 'info' }] : [],
  };
};
