import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Circular orbits and Kepler's third law (OpenStax University Physics Vol. 1 Eqs. 13.7, 13.8,
 * 13.11; College Physics 2e Eq. 6.65): v = √(GM ÷ r), T = 2π√(r³ ÷ GM), and for an ellipse the
 * semi-major axis a replaces r. G is the CODATA 2022 value. Central-body presets are the textbook
 * values: Earth 5.98 × 10²⁴ kg and 6,380 km (College Physics), Sun 2.00 × 10³⁰ kg (University
 * Physics). The astronomical unit is exactly 149,597,870,700 m (IAU 2012 Resolution B2) and the
 * year is the Julian year of 365.25 days. Assumes the orbiting body's mass is negligible next to the central one.
 */
export const G = 6.6743e-11;
export const BODIES: Record<string, { mass: number; radius: number | null }> = {
  earth: { mass: 5.98e24, radius: 6.38e6 },
  sun: { mass: 2.0e30, radius: null },
};
export const LENGTH = { km: 1e3, m: 1, au: 149597870700 } as const;
export const TIME = { min: 60, h: 3600, d: 86400, y: 365.25 * 86400 } as const;
const UNIT = { km: 'km', m: 'm', au: 'au', min: 'min', h: 'h', d: 'days', y: 'years' } as const;

const pick = <T extends Record<string, unknown>>(map: T, v: unknown, d: keyof T): keyof T =>
  typeof v === 'string' && v in map ? (v as keyof T) : d;

export const compute: ComputeFn = (inputs, { fmt }) => {
  const val = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const findRadius = inputs.find === 'radius';
  const body =
    typeof inputs.body === 'string' && (inputs.body in BODIES || inputs.body === 'custom')
      ? inputs.body
      : 'earth';
  const preset = BODIES[body];
  const M = preset ? preset.mass : val('mass');
  if (M === null) return none();
  if (!(M > 0)) return none('warn.mass');
  const GM = G * M;
  const lu = pick(LENGTH, inputs.lu, 'km');
  const tu = pick(TIME, inputs.tu, 'min');
  const fromSurface = inputs.measure === 'altitude';
  const bodyRadius = fromSurface
    ? preset
      ? preset.radius
      : val('bodyRadius') === null
        ? null
        : val('bodyRadius')! * 1e3
    : 0;
  if (bodyRadius === null) return none(preset ? 'warn.noRadius' : undefined);
  const s = (x: number) => fmt.sig(clean(x), 8);

  let r: number;
  let T: number;
  const steps: ComputeResult['steps'] = [];
  if (findRadius) {
    const tIn = val('period');
    if (tIn === null) return none();
    if (!(tIn > 0)) return none('warn.period');
    T = tIn * TIME[tu];
    r = Math.cbrt((GM * T * T) / (4 * Math.PI ** 2));
    if (fromSurface && r <= bodyRadius) return none('warn.inside');
    steps.push({
      key: 'step.radius',
      math: `∛(${s(GM)} × ${s(T)}² ÷ 4π²) = ${s(r)} m`,
    });
  } else {
    const rIn = val('distance');
    if (rIn === null) return none();
    if (!(rIn > 0) && !fromSurface) return none('warn.distance');
    if (rIn < 0) return none('warn.distance');
    r = rIn * LENGTH[lu] + bodyRadius;
    if (fromSurface)
      steps.push({
        key: 'step.add',
        math: `${s(rIn * LENGTH[lu])} + ${s(bodyRadius)} = ${s(r)} m`,
      });
    T = 2 * Math.PI * Math.sqrt(r ** 3 / GM);
    steps.push({ key: 'step.period', math: `2π √(${s(r)}³ ÷ ${s(GM)}) = ${s(T)} s` });
  }
  const v = Math.sqrt(GM / r);
  steps.push({ key: 'step.speed', math: `√(${s(GM)} ÷ ${s(r)}) = ${s(v)} m/s` });
  const altitude = r - bodyRadius;
  const result = findRadius
    ? `${s((fromSurface ? altitude : r) / LENGTH[lu])} ${UNIT[lu]}`
    : `${s(T / TIME[tu])} ${UNIT[tu]}`;

  return {
    outputs: {
      result,
      seconds: clean(T),
      hours: clean(T / 3600),
      days: clean(T / 86400),
      radiusKm: clean(r / 1e3),
      altitudeKm: fromSurface ? clean(altitude / 1e3) : null,
      speed: clean(v),
      kmh: clean(v * 3.6),
    },
    explain: {
      key: 'explain',
      values: { v: s(v / 1e3), h: s(T / 3600) },
    },
    steps,
    warnings:
      preset && fromSurface && preset.radius && altitude < 1e5 && body === 'earth'
        ? [{ key: 'warn.air', level: 'info' }]
        : [],
  };
};
