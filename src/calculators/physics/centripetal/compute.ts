import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Uniform circular motion (OpenStax College Physics 2e §6.2–6.3; University Physics Vol. 1 §4.4):
 *   a_c = v²/r, F_c = m v²/r, period T = 2πr/v.
 * On a flat curve the friction coefficient needed is μ_s = v²/(rg); the ideal (frictionless)
 * bank angle is θ = tan⁻¹(v²/(rg)). g = 9.80665 m/s² (standard gravity).
 */
const GN = 9.80665;
const MS = { ms: 1, kmh: 1 / 3.6, mph: 0.44704 } as const;

export const compute: ComputeFn = (inputs, { fmt }) => {
  const val = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const none = (key?: string): ComputeResult => ({
    outputs: { force: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const m = val('mass');
  const v0 = val('speed');
  const r = val('radius');
  if (m === null || v0 === null || r === null) return none();
  if (!(r > 0)) return none('warn.radius');
  const su = inputs.su === 'kmh' || inputs.su === 'mph' ? inputs.su : 'ms';
  const v = v0 * MS[su];
  const a = (v * v) / r;
  const f = m * a;
  const s = (x: number) => fmt.sig(clean(x), 8);
  return {
    outputs: {
      force: clean(f),
      accel: clean(a),
      friction: clean(a / GN),
      bank: clean((Math.atan(a / GN) * 180) / Math.PI),
      period: v > 0 ? clean((2 * Math.PI * r) / v) : null,
    },
    explain: { key: 'explain', values: { f: s(f), a: s(a), gs: fmt.sig(clean(a / GN), 3) } },
    steps: [
      { key: 'step.accel', math: `${s(v)}² ÷ ${s(r)} = ${s(a)} m/s²` },
      { key: 'step.force', math: `${s(m)} × ${s(a)} = ${s(f)} N` },
      {
        key: 'step.bank',
        math: `tan⁻¹(${s(a)} ÷ 9.80665) = ${s((Math.atan(a / GN) * 180) / Math.PI)}°`,
      },
    ],
    warnings: [],
  };
};
