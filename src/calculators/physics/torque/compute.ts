import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Torque τ = rF sin θ, where θ is the angle between the force and the line from the pivot
 * (OpenStax College Physics 2e §9.2; University Physics Vol. 1 §10.6). The lever arm is
 * r⊥ = r sin θ. 1 lbf·ft = 0.3048 × 4.4482216152605 N·m = 1.3558179483 N·m (NIST SP 811).
 * sin 90° and sin 0°/180° are taken as exact.
 */
const LBFFT = 0.3048 * 0.45359237 * 9.80665;

export const compute: ComputeFn = (inputs, { fmt }) => {
  const val = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const none = (key?: string): ComputeResult => ({
    outputs: { torque: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const f = val('force');
  const r = val('distance');
  const a = val('angle') ?? 90;
  if (f === null || r === null) return none();
  if (a < 0 || a > 180) return none('warn.angle');
  const sin = a === 90 ? 1 : a === 0 || a === 180 ? 0 : Math.sin((a * Math.PI) / 180);
  const lever = r * sin;
  const tq = f * lever;
  const s = (x: number) => fmt.sig(clean(x), 8);
  return {
    outputs: { torque: clean(tq), lever: clean(lever), lbft: clean(tq / LBFFT) },
    explain: { key: 'explain', values: { t: s(tq), l: s(lever) } },
    steps: [
      { key: 'step.lever', math: `${s(r)} × sin ${s(a)}° = ${s(lever)} m` },
      { key: 'step.torque', math: `${s(f)} × ${s(lever)} = ${s(tq)} N·m` },
    ],
    warnings: a === 0 || a === 180 ? [{ key: 'warn.parallel', level: 'info' }] : [],
  };
};
