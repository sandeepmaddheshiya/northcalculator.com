import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Doppler effect for sound (OpenStax College Physics 2e §17.4; University Physics Vol. 1 §17.7):
 *   f_o = f_s × (v ± v_o) ÷ (v ∓ v_s)
 * with the upper signs when observer or source moves toward the other. Speeds are along the line
 * joining them, relative to the air. A source at or above the speed of sound produces a shock
 * wave (sonic boom) instead of a shifted tone.
 */
export const compute: ComputeFn = (inputs, { fmt }) => {
  const val = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const none = (key?: string): ComputeResult => ({
    outputs: { fo: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const fs = val('fs');
  const v = val('vw');
  const vs = val('vs') ?? 0;
  const vo = val('vo') ?? 0;
  if (fs === null || v === null) return none();
  if (!(v > 0)) return none('warn.sound');
  const sTo = inputs.sdir !== 'away';
  const oTo = inputs.odir !== 'away';
  const num = v + (oTo ? vo : -vo);
  const den = v + (sTo ? -vs : vs);
  if (sTo && vs >= v) return none('warn.supersonic');
  if (num <= 0) return none('warn.outrun');
  const fo = (fs * num) / den;
  const s = (x: number) => fmt.sig(clean(x), 8);
  return {
    outputs: { fo: clean(fo), shift: clean(fo - fs), ratio: clean(num / den) },
    explain: {
      key: fo >= fs ? 'explain.higher' : 'explain.lower',
      values: { fo: s(fo), d: s(Math.abs(fo - fs)) },
    },
    steps: [
      {
        key: 'step.f',
        math: `${s(fs)} × (${s(v)} ${oTo ? '+' : '−'} ${s(vo)}) ÷ (${s(v)} ${sTo ? '−' : '+'} ${s(vs)}) = ${s(fo)} Hz`,
      },
    ],
    warnings: [],
  };
};
