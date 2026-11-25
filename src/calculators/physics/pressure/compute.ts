import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Pressure P = F ÷ A (OpenStax College Physics 2e §11.3; University Physics Vol. 1 §14.1), or the
 * pressure of a fluid column P = ρgh (§11.4, Eq. 11.17), which is gauge pressure; absolute
 * pressure adds one standard atmosphere, 101,325 Pa (NIST SP 811). 1 psi = 6,894.757293168 Pa.
 */
export const ATM = 101325;
const PSI = 6894.757293168361;

export const compute: ComputeFn = (inputs, { fmt }) => {
  const val = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const none = (key?: string): ComputeResult => ({
    outputs: { pa: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const depthMode = inputs.mode !== 'force';
  let p: number;
  let math: string;
  const s = (x: number) => fmt.sig(clean(x), 8);
  if (depthMode) {
    const h = val('depth');
    const rho = val('density');
    const g = val('g') ?? 9.80665;
    if (h === null || rho === null) return none();
    if (!(g > 0)) return none('warn.g');
    p = rho * g * h;
    math = `${s(rho)} × ${s(g)} × ${s(h)} = ${s(p)} Pa`;
  } else {
    const f = val('force');
    const a = val('area');
    if (f === null || a === null) return none();
    if (!(a > 0)) return none('warn.area');
    p = f / a;
    math = `${s(f)} N ÷ ${s(a)} m² = ${s(p)} Pa`;
  }
  return {
    outputs: {
      pa: clean(p),
      kpa: clean(p / 1000),
      atm: clean(p / ATM),
      psi: clean(p / PSI),
      absolute: depthMode ? clean(p + ATM) : null,
    },
    explain: {
      key: depthMode ? 'explain.depth' : 'explain.force',
      values: { p: s(p / 1000), atm: s(p / ATM) },
    },
    steps: [{ key: depthMode ? 'step.depth' : 'step.force', math }],
    warnings: [],
  };
};
