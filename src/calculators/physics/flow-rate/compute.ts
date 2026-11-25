import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Volume flow rate and continuity for an incompressible fluid (OpenStax College Physics 2e
 * Eqs. 12.4, 12.7, 12.13; University Physics Vol. 1 Eqs. 14.13–14.14): Q = A v̄ with
 * A = πd²/4 for a round pipe, and Q₁ = Q₂, so A₁v₁ = n₂A₂v₂ when the flow splits into n₂ equal
 * branches. 1 L = 10⁻³ m³; 1 US gallon = 231 in³ = 3.785411784 L (NIST SP 811 lists 3.785412 L;
 * 231 × 2.54³ cm³ gives the exact figure).
 */
export const Q_UNITS = { ls: 1e-3, lmin: 1e-3 / 60, m3s: 1, gpm: 3.785411784e-3 / 60 } as const;
type QUnit = keyof typeof Q_UNITS;

export const area = (dCm: number) => (Math.PI * (dCm / 100) ** 2) / 4;

export const compute: ComputeFn = (inputs, { fmt }) => {
  const num = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const findFlow = inputs.find === 'flow';
  const qu: QUnit = (['ls', 'lmin', 'm3s', 'gpm'] as const).find((u) => u === inputs.qu) ?? 'ls';
  const d1 = num('d1');
  const d2 = num('d2');
  const n2 = num('n2') ?? 1;
  if (d1 === null) return none();
  if (!(d1 > 0)) return none('warn.d');
  if (!(n2 >= 1) || !Number.isInteger(n2)) return none('warn.n');
  const A1 = area(d1);
  let Q: number;
  let v1: number;
  if (findFlow) {
    const v = num('v1');
    if (v === null) return none();
    if (v < 0) return none('warn.v');
    v1 = v;
    Q = A1 * v1;
  } else {
    const q = num('q');
    if (q === null) return none();
    if (q < 0) return none('warn.q');
    Q = q * Q_UNITS[qu];
    v1 = Q / A1;
  }
  const A2 = d2 !== null && d2 > 0 ? area(d2) : null;
  const v2 = A2 === null ? null : Q / (n2 * A2);
  const s = (x: number) => fmt.sig(clean(x), 6);
  const steps: ComputeResult['steps'] = [
    { key: 'step.area', math: `π × (${s(d1 / 100)} m)² ÷ 4 = ${s(A1)} m²` },
    findFlow
      ? { key: 'step.flow', math: `${s(A1)} m² × ${s(v1)} m/s = ${s(Q)} m³/s` }
      : { key: 'step.speed', math: `${s(Q)} m³/s ÷ ${s(A1)} m² = ${s(v1)} m/s` },
  ];
  if (v2 !== null)
    steps.push({
      key: 'step.continuity',
      math: `${s(Q)} ÷ (${n2} × ${s(A2!)}) = ${s(v2)} m/s`,
    });

  return {
    outputs: {
      result: clean(findFlow ? Q / Q_UNITS[qu] : v1),
      v1: clean(v1),
      v2: v2 === null ? null : clean(v2),
      ls: clean(Q / Q_UNITS.ls),
      lmin: clean(Q / Q_UNITS.lmin),
      m3s: clean(Q),
      gpm: clean(Q / Q_UNITS.gpm),
      a1: clean(A1 * 1e4),
    },
    explain: {
      key: v2 === null ? 'explain' : 'explain.two',
      values: { v1: s(v1), v2: v2 === null ? '' : s(v2), q: s(Q * 1000) },
    },
    steps,
    warnings: [],
  };
};
