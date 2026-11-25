import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Combined gas law P₁V₁/T₁ = P₂V₂/T₂ for a fixed amount of gas (LibreTexts Introductory
 * Chemistry §11.6; OpenStax Chemistry 2e §9.2), solved for P₂, V₂ or T₂. Temperatures must be
 * absolute: °C inputs are converted with K = °C + 273.15. Pressure and volume may be in any unit,
 * as long as each pair matches. Equal temperatures give Boyle’s law, equal pressures Charles’s.
 */
export const compute: ComputeFn = (inputs, { fmt }) => {
  const val = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const find = inputs.find === 'v2' || inputs.find === 't2' ? inputs.find : 'p2';
  const toK = (t: number) => (inputs.tu === 'C' ? t + 273.15 : t);
  const fromK = (k: number) => (inputs.tu === 'C' ? k - 273.15 : k);
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const p1 = val('p1');
  const v1 = val('v1');
  const t1r = val('t1');
  if (p1 === null || v1 === null || t1r === null) return none();
  const t1 = toK(t1r);
  if (!(t1 > 0)) return none('warn.kelvin');
  if (!(p1 > 0 && v1 > 0)) return none('warn.zero');
  const k = (p1 * v1) / t1;
  let p2: number;
  let v2: number;
  let t2: number;
  const s = (x: number) => fmt.sig(clean(x), 8);
  if (find === 'p2') {
    const a = val('v2');
    const b = val('t2');
    if (a === null || b === null) return none();
    t2 = toK(b);
    if (!(t2 > 0)) return none('warn.kelvin');
    if (!(a > 0)) return none('warn.zero');
    v2 = a;
    p2 = (k * t2) / v2;
  } else if (find === 'v2') {
    const a = val('p2');
    const b = val('t2');
    if (a === null || b === null) return none();
    t2 = toK(b);
    if (!(t2 > 0)) return none('warn.kelvin');
    if (!(a > 0)) return none('warn.zero');
    p2 = a;
    v2 = (k * t2) / p2;
  } else {
    const a = val('p2');
    const b = val('v2');
    if (a === null || b === null) return none();
    if (!(a > 0 && b > 0)) return none('warn.zero');
    [p2, v2] = [a, b];
    t2 = (p2 * v2) / k;
  }
  const result = find === 'p2' ? p2 : find === 'v2' ? v2 : fromK(t2);
  return {
    outputs: { result: clean(result), t1k: clean(t1), t2k: clean(t2), constant: clean(k) },
    explain: { key: 'explain', values: { p2: s(p2), v2: s(v2), t2: s(t2) } },
    steps: [
      ...(inputs.tu === 'C'
        ? [{ key: 'step.kelvin', math: `T₁ = ${s(t1)} K, T₂ = ${s(t2)} K` }]
        : []),
      find === 'p2'
        ? {
            key: 'step.p2',
            math: `${s(p1)} × ${s(v1)} × ${s(t2)} ÷ (${s(t1)} × ${s(v2)}) = ${s(p2)}`,
          }
        : find === 'v2'
          ? {
              key: 'step.v2',
              math: `${s(p1)} × ${s(v1)} × ${s(t2)} ÷ (${s(t1)} × ${s(p2)}) = ${s(v2)}`,
            }
          : {
              key: 'step.t2',
              math: `${s(p2)} × ${s(v2)} × ${s(t1)} ÷ (${s(p1)} × ${s(v1)}) = ${s(t2)} K`,
            },
    ],
    warnings: [],
  };
};
