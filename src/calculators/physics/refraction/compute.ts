import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Snell's law n₁ sin θ₁ = n₂ sin θ₂ (OpenStax College Physics 2e Eq. 25.7–25.8; University
 * Physics Vol. 3 Eq. 1.4), solved for the refracted angle or for an unknown index. The critical
 * angle θc = sin⁻¹(n₂ ÷ n₁) exists when n₁ > n₂ (Eq. 25.17 / 1.5); past it the light is totally
 * internally reflected. Speed in a medium v = c ÷ n with c = 299,792,458 m/s exactly.
 * Preset indices are College Physics Table 25.1 (gases at 0 °C, liquids at 20 °C).
 */
export const INDEX: Record<string, number> = {
  vacuum: 1,
  air: 1.000293,
  water: 1.333,
  ice: 1.309,
  ethanol: 1.361,
  glycerine: 1.473,
  crown: 1.52,
  flint: 1.66,
  plexiglas: 1.51,
  polystyrene: 1.49,
  quartz: 1.458,
  zircon: 1.923,
  diamond: 2.419,
};
export const C = 299792458;
const DEG = Math.PI / 180;

const index = (inputs: Record<string, unknown>, sel: string, custom: string) => {
  const m = inputs[sel];
  if (typeof m === 'string' && m in INDEX) return INDEX[m]!;
  const n = inputs[custom];
  return typeof n === 'number' ? n : null;
};

export const compute: ComputeFn = (inputs, { fmt }) => {
  const none = (
    key?: string,
    level: 'warn' | 'info' = 'warn',
    values?: Record<string, string>,
  ): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level, values }] : [],
  });
  const findIndex = inputs.find === 'n2';
  const n1 = index(inputs, 'm1', 'n1');
  const n2 = findIndex ? null : index(inputs, 'm2', 'n2');
  const t1 = typeof inputs.theta1 === 'number' ? inputs.theta1 : null;
  const t2In = typeof inputs.theta2 === 'number' ? inputs.theta2 : null;
  if (n1 === null || t1 === null || (!findIndex && n2 === null) || (findIndex && t2In === null))
    return none();
  if (n1 < 1 || (n2 !== null && n2 < 1)) return none('warn.index');
  if (t1 < 0 || t1 >= 90) return none('warn.angle');
  const s = (x: number) => fmt.sig(clean(x), 8);
  const sin1 = Math.sin(t1 * DEG);

  if (findIndex) {
    if (!(t2In! > 0 && t2In! < 90)) return none('warn.angle');
    if (t1 === 0) return none('warn.normal');
    const n2f = (n1 * sin1) / Math.sin(t2In! * DEG);
    return {
      outputs: {
        result: clean(n2f),
        theta2: clean(t2In!),
        v2: clean(C / n2f),
        critical: n1 > n2f ? clean(Math.asin(n2f / n1) / DEG) : null,
      },
      explain: { key: 'explain.index', values: { n: s(n2f) } },
      steps: [
        {
          key: 'step.index',
          math: `${s(n1)} × sin ${s(t1)}° ÷ sin ${s(t2In!)}° = ${s(n1 * sin1)} ÷ ${s(Math.sin(t2In! * DEG))} = ${s(n2f)}`,
        },
      ],
      warnings: n2f < 1 ? [{ key: 'warn.below1', level: 'info' }] : [],
    };
  }

  const sin2 = (n1 * sin1) / n2!;
  const critical = n1 > n2! ? Math.asin(n2! / n1) / DEG : null;
  const steps: ComputeResult['steps'] = [
    { key: 'step.sin', math: `sin θ₂ = ${s(n1)} × sin ${s(t1)}° ÷ ${s(n2!)} = ${s(sin2)}` },
  ];
  if (critical !== null)
    steps.push({ key: 'step.critical', math: `sin⁻¹(${s(n2!)} ÷ ${s(n1)}) = ${s(critical)}°` });
  if (sin2 > 1)
    return {
      outputs: {
        result: null,
        critical: clean(critical!),
        v1: clean(C / n1),
        v2: clean(C / n2!),
      },
      steps,
      warnings: [{ key: 'warn.tir', level: 'info', values: { c: s(critical!) } }],
    };
  const t2 = Math.asin(sin2) / DEG;
  steps.push({ key: 'step.angle', math: `θ₂ = sin⁻¹(${s(sin2)}) = ${s(t2)}°` });
  return {
    outputs: {
      result: clean(t2),
      bend: clean(t1 - t2),
      critical: critical === null ? null : clean(critical),
      v1: clean(C / n1),
      v2: clean(C / n2!),
    },
    explain: {
      key: t2 < t1 ? 'explain.toward' : t2 > t1 ? 'explain.away' : 'explain.straight',
      values: { t2: s(t2), d: s(Math.abs(t1 - t2)) },
    },
    steps,
    warnings: [],
  };
};
