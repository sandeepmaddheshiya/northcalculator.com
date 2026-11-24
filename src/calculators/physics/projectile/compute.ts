import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Projectile without air resistance (OpenStax University Physics Vol. 1 §4.3; College Physics
 * 2e §3.4), launched at speed v₀ and angle θ₀ from height h above the landing ground:
 *   vₓ = v₀ cos θ₀, v_y = v₀ sin θ₀
 *   flight time T solves h + v_y t − ½gt² = 0: T = (v_y + √(v_y² + 2gh)) ÷ g
 *     (rationalised as 2h ÷ (√(v_y² + 2gh) − v_y) when v_y < 0, to avoid cancellation)
 *   range R = vₓT; peak h + v_y² ÷ 2g when v_y > 0; landing speed √(vₓ² + (v_y − gT)²).
 * With h = 0 these reduce to R = v₀² sin 2θ₀ ÷ g and T = 2v₀ sin θ₀ ÷ g.
 */
const MS = { ms: 1, kmh: 1 / 3.6, mph: 0.44704 } as const;

export const compute: ComputeFn = (inputs, { fmt }) => {
  const val = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const none = (key?: string): ComputeResult => ({
    outputs: { range: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const v = val('speed');
  const deg = val('angle');
  const h = val('height') ?? 0;
  const g = val('g') ?? 9.80665;
  if (v === null || deg === null) return none();
  if (!(g > 0)) return none('warn.g');
  if (deg < -90 || deg > 90) return none('warn.angle');
  const su = inputs.su === 'kmh' || inputs.su === 'mph' ? inputs.su : 'ms';
  const v0 = v * MS[su];
  const th = (deg * Math.PI) / 180;
  const vx = deg === 90 || deg === -90 ? 0 : v0 * Math.cos(th);
  const vy = v0 * Math.sin(th);
  const root = Math.sqrt(vy * vy + 2 * g * h);
  const T = vy >= 0 ? (vy + root) / g : (2 * h) / (root - vy);
  const R = vx * T;
  const apex = vy > 0 ? vy / g : 0;
  const peak = h + (vy > 0 ? (vy * vy) / (2 * g) : 0);
  const vyEnd = vy - g * T;
  const impact = Math.hypot(vx, vyEnd);
  const below = (Math.atan2(-vyEnd, vx) * 180) / Math.PI;
  const s = (x: number) => fmt.sig(clean(x), 8);
  return {
    outputs: {
      range: clean(R),
      time: clean(T),
      maxHeight: clean(peak),
      apexTime: clean(apex),
      impactSpeed: clean(impact),
      impactAngle: clean(below),
    },
    explain: { key: 'explain', values: { r: s(R), t: s(T), h: s(peak) } },
    steps: [
      {
        key: 'step.components',
        math: `vₓ = ${s(v0)} cos ${s(deg)}° = ${s(vx)}, v_y = ${s(v0)} sin ${s(deg)}° = ${s(vy)} m/s`,
      },
      {
        key: 'step.time',
        math: `T = (${s(vy)} + √(${s(vy)}² + 2 × ${s(g)} × ${s(h)})) ÷ ${s(g)} = ${s(T)} s`,
      },
      { key: 'step.range', math: `R = ${s(vx)} × ${s(T)} = ${s(R)} m` },
    ],
    warnings: [],
  };
};
