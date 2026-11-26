import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Thermal expansion (OpenStax College Physics 2e §13.2, Eqs. 13.7, 13.9, 13.10; University
 * Physics Vol. 2 §1.3, Eqs. 1.2–1.4): ΔL = αLΔT, ΔA = 2αAΔT, ΔV = βVΔT. A bar held at both ends
 * instead feels the thermal stress F/A = YαΔT (UP2 Example 1.4). Coefficients per °C from
 * CP2e Table 13.2 / UP2 Table 1.2 (identical apart from marble, which is left out).
 */
export const MATERIALS: Record<string, { alpha?: number; beta: number }> = {
  aluminum: { alpha: 25e-6, beta: 75e-6 },
  brass: { alpha: 19e-6, beta: 56e-6 },
  copper: { alpha: 17e-6, beta: 51e-6 },
  gold: { alpha: 14e-6, beta: 42e-6 },
  steel: { alpha: 12e-6, beta: 35e-6 },
  invar: { alpha: 0.9e-6, beta: 2.7e-6 },
  lead: { alpha: 29e-6, beta: 87e-6 },
  silver: { alpha: 18e-6, beta: 54e-6 },
  glass: { alpha: 9e-6, beta: 27e-6 },
  pyrex: { alpha: 3e-6, beta: 9e-6 },
  quartz: { alpha: 0.4e-6, beta: 1e-6 },
  concrete: { alpha: 12e-6, beta: 36e-6 },
  ether: { beta: 1650e-6 },
  ethanol: { beta: 1100e-6 },
  gasoline: { beta: 950e-6 },
  glycerin: { beta: 500e-6 },
  mercury: { beta: 180e-6 },
  water: { beta: 210e-6 },
  air: { beta: 3400e-6 },
};

export const compute: ComputeFn = (inputs, { fmt }) => {
  const num = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const none = (key?: string): ComputeResult => ({
    outputs: { change: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const mode = inputs.mode === 'area' || inputs.mode === 'volume' ? inputs.mode : 'linear';
  const mat = MATERIALS[String(inputs.material)];
  let coef: number | null;
  if (inputs.material === 'custom') {
    const c = num('coef');
    coef = c === null ? null : c * 1e-6;
  } else if (!mat) return none();
  else coef = mode === 'volume' ? mat.beta : (mat.alpha ?? null);
  if (coef === null) return mat && !mat.alpha ? none('warn.fluid') : none();
  const size = num('size');
  const t1 = num('t1');
  const t2 = num('t2');
  if (size === null || t1 === null || t2 === null) return none();
  if (!(size > 0)) return none('warn.size');
  const dT = (t2 - t1) * (inputs.tu === 'F' ? 5 / 9 : 1);
  const factor = mode === 'area' ? 2 * coef : coef;
  const change = factor * size * dT;
  const s = (x: number) => fmt.sig(clean(x), 6);
  const y = num('y');
  const stress = mode === 'linear' && y !== null && y > 0 ? y * 1e9 * coef * dT : null;
  const sym = mode === 'linear' ? 'L' : mode === 'area' ? 'A' : 'V';
  const k = mode === 'area' ? `2 × ${s(coef)}` : s(coef);

  return {
    outputs: {
      change: clean(change),
      final: clean(size + change),
      percent: clean(factor * dT * 100),
      coef: clean(coef),
      dT: clean(dT),
      stress: stress === null ? null : clean(Math.abs(stress) / 1e6),
    },
    explain: {
      key: change >= 0 ? 'explain.grow' : 'explain.shrink',
      values: { d: s(Math.abs(change)), f: s(size + change) },
    },
    steps: [
      ...(inputs.tu === 'F'
        ? [{ key: 'step.f', math: `ΔT = (${s(t2)} − ${s(t1)}) × 5/9 = ${s(dT)} °C` }]
        : []),
      {
        key: `step.${mode}`,
        math: `Δ${sym} = ${k} × ${s(size)} × ${s(dT)} = ${s(change)}`,
      },
      ...(stress === null
        ? []
        : [
            {
              key: 'step.stress',
              math: `F/A = ${s(y!)} × 10⁹ × ${s(coef)} × ${s(Math.abs(dT))} = ${s(Math.abs(stress))} Pa`,
            },
          ]),
    ],
    warnings: stress !== null && dT < 0 ? [{ key: 'warn.tension', level: 'info' }] : [],
  };
};
