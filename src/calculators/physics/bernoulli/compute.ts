import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Bernoulli’s equation along a streamline of an incompressible, frictionless fluid (OpenStax
 * College Physics 2e Eq. 12.18; University Physics Vol. 1 Eq. 14.16):
 *   P₁ + ½ρv₁² + ρgh₁ = P₂ + ½ρv₂² + ρgh₂,
 * solved for either pressure or the downstream speed. Pressures may be absolute or gauge, as long
 * as both use the same reference. Pressures are entered in kPa.
 */
export const compute: ComputeFn = (inputs, { fmt }) => {
  const num = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const find = inputs.find === 'p1' || inputs.find === 'v2' ? inputs.find : 'p2';
  const rho = num('rho');
  const g = num('g');
  const h1 = num('h1') ?? 0;
  const h2 = num('h2') ?? 0;
  const v1 = num('v1');
  if (rho === null || g === null || v1 === null) return none();
  if (!(rho > 0) || !(g > 0)) return none('warn.rho');
  if (v1 < 0) return none('warn.speed');
  const s = (x: number) => fmt.sig(clean(x), 6);
  // Energy per unit volume (Pa) of the parts we know.
  const kin = (v: number) => 0.5 * rho * v * v;
  const pot = (h: number) => rho * g * h;

  let P1: number;
  let P2: number;
  let v2: number;
  if (find === 'v2') {
    const p1 = num('p1');
    const p2 = num('p2');
    if (p1 === null || p2 === null) return none();
    P1 = p1 * 1000;
    P2 = p2 * 1000;
    const k2 = P1 + kin(v1) + pot(h1) - P2 - pot(h2);
    // Allow for rounding when point 2 has (almost) exactly the energy of point 1.
    if (k2 < -1e-9 * (Math.abs(P1) + Math.abs(P2) + kin(v1) + Math.abs(pot(h1)) + 1))
      return none('warn.noFlow');
    v2 = Math.sqrt((2 * Math.max(0, k2)) / rho);
  } else {
    const v = num('v2');
    if (v === null) return none();
    if (v < 0) return none('warn.speed');
    v2 = v;
    if (find === 'p2') {
      const p1 = num('p1');
      if (p1 === null) return none();
      P1 = p1 * 1000;
      P2 = P1 + kin(v1) - kin(v2) + pot(h1) - pot(h2);
    } else {
      const p2 = num('p2');
      if (p2 === null) return none();
      P2 = p2 * 1000;
      P1 = P2 + kin(v2) - kin(v1) + pot(h2) - pot(h1);
    }
  }
  const total = P1 + kin(v1) + pot(h1);
  const result = find === 'p1' ? P1 / 1000 : find === 'p2' ? P2 / 1000 : v2;

  return {
    outputs: {
      result: clean(result),
      p1: clean(P1 / 1000),
      p2: clean(P2 / 1000),
      v2: clean(v2),
      dp: clean((P1 - P2) / 1000),
      total: clean(total / 1000),
    },
    explain: {
      key: find === 'v2' ? 'explain.v' : 'explain.p',
      values: { p1: s(P1 / 1000), p2: s(P2 / 1000), v: s(v2) },
    },
    steps: [
      {
        key: 'step.terms',
        math: `½ × ${s(rho)} × ${s(v1)}² = ${s(kin(v1))} Pa; ${s(rho)} × ${s(g)} × ${s(h1)} = ${s(pot(h1))} Pa`,
      },
      find === 'v2'
        ? {
            key: 'step.v2',
            math: `v₂ = √(2 × (${s(P1)} + ${s(kin(v1))} + ${s(pot(h1))} − ${s(P2)} − ${s(pot(h2))}) ÷ ${s(rho)}) = ${s(v2)} m/s`,
          }
        : find === 'p2'
          ? {
              key: 'step.p2',
              math: `${s(P1)} + ${s(kin(v1))} − ${s(kin(v2))} + ${s(pot(h1))} − ${s(pot(h2))} = ${s(P2)} Pa`,
            }
          : {
              key: 'step.p1',
              math: `${s(P2)} + ${s(kin(v2))} − ${s(kin(v1))} + ${s(pot(h2))} − ${s(pot(h1))} = ${s(P1)} Pa`,
            },
    ],
    warnings: P1 < -101.325e3 || P2 < -101.325e3 ? [{ key: 'warn.vacuum', level: 'warn' }] : [],
  };
};
