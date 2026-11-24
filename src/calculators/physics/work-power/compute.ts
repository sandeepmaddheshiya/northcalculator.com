import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Work W = Fd cos θ (OpenStax College Physics 2e §7.1) and average power P = W ÷ t (§7.7;
 * University Physics Vol. 1 §7.4). Horsepower uses the mechanical horsepower of 550 ft·lbf/s
 * = 745.69987158227 W (from NIST SP 811’s exact foot and pound-force); OpenStax rounds it to 746 W.
 * cos 90° is taken as exactly 0.
 */
export const HP = 550 * 0.3048 * 0.45359237 * 9.80665;

export const compute: ComputeFn = (inputs, { fmt }) => {
  const val = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const none = (key?: string): ComputeResult => ({
    outputs: { work: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const f = val('force');
  const d = val('distance');
  const deg = val('angle') ?? 0;
  const t = val('time');
  if (f === null || d === null) return none();
  if (deg < 0 || deg > 180) return none('warn.angle');
  const cos = deg === 90 ? 0 : deg === 180 ? -1 : Math.cos((deg * Math.PI) / 180);
  const w = f * d * cos;
  const p = t !== null && t > 0 ? w / t : null;
  const s = (x: number) => fmt.sig(clean(x), 8);
  return {
    outputs: {
      work: clean(w),
      kj: clean(w / 1000),
      power: p === null ? null : clean(p),
      hp: p === null ? null : clean(p / HP),
      wh: clean(w / 3600),
    },
    explain: {
      key: p === null ? 'explain' : 'explain.power',
      values: { w: s(w), p: p === null ? '' : s(p) },
    },
    steps: [
      { key: 'step.work', math: `${s(f)} × ${s(d)} × cos ${s(deg)}° = ${s(w)} J` },
      ...(p === null ? [] : [{ key: 'step.power', math: `${s(w)} J ÷ ${s(t!)} s = ${s(p)} W` }]),
    ],
    warnings: deg > 90 ? [{ key: 'warn.negative', level: 'info' }] : [],
  };
};
