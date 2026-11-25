import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-25');
const solve = (inputs: Record<string, unknown>) =>
  compute({ ...base, rho: 1000, g: 9.8, ...inputs } as never, {
    today: '2026-11-25',
    fmt: makeFmt('en'),
  });
type Out = Record<'result' | 'p1' | 'p2' | 'v2' | 'dp' | 'total', number>;
const out = (inputs: Record<string, unknown>) => solve(inputs).outputs as unknown as Out;
const sig = (x: number, d: number) => Number(x.toPrecision(d));

describe('bernoulli: references (OpenStax College Physics 2e §12.2–12.3)', () => {
  it('Ex 12.4: hose 1.96 m/s, nozzle 25.5 m/s at 1.01 × 10⁵ N/m² → 4.24 × 10⁵ N/m²', () =>
    expect(sig(out({ find: 'p1', p2: 101, v1: 1.96, h1: 0, v2: 25.5, h2: 0 }).result, 3)).toBe(
      424,
    ));
  it('Ex 12.5: fire hose 6.40 cm → 3.00 cm at 40.0 L/s, 10.0 m up, 0 gauge → 1.62 × 10⁶ N/m²', () => {
    const v1 = 0.04 / (Math.PI * 0.032 ** 2);
    const v2 = 0.04 / (Math.PI * 0.015 ** 2);
    expect([sig(v1, 5), sig(v2, 5)]).toEqual([12.434, 56.588]);
    expect(sig(out({ find: 'p1', p2: 0, v1, h1: 0, v2, h2: 10 }).result, 3)).toBe(1620);
  });
});

describe('bernoulli: references (OpenStax University Physics Vol. 1 §14.6)', () => {
  it('Ex 14.6: 4.24 × 10⁵ N/m²', () =>
    expect(sig(out({ find: 'p1', p2: 101, v1: 1.96, v2: 25.5, h1: 0, h2: 0 }).p1, 3)).toBe(424));
  it('Ex 14.7: 1.62 × 10⁶ gauge, 12.4 → 56.6 m/s, 10.0 m rise → −2.9 kPa', () =>
    expect(sig(out({ find: 'p2', p1: 1620, v1: 12.4, h1: 0, v2: 56.6, h2: 10 }).result, 2)).toBe(
      -2.9,
    ));
});

describe('bernoulli: behaviour', () => {
  it('Torricelli: open tank 5.0 m deep → √(2gh)', () =>
    expect(sig(out({ find: 'v2', p1: 0, v1: 0, h1: 5, p2: 0, h2: 0 }).result, 12)).toBe(
      sig(Math.sqrt(2 * 9.8 * 5), 12),
    ));
  it('static fluid: P₂ = P₁ + ρgh for a 10 m depth', () =>
    expect(out({ find: 'p2', p1: 101.325, v1: 0, h1: 10, v2: 0, h2: 0 }).result).toBe(
      101.325 + 98,
    ));
  it('impossible flow and vacuum are flagged', () => {
    expect(solve({ find: 'v2', p1: 0, v1: 0, h1: 0, p2: 100, h2: 0 }).warnings[0]?.key).toBe(
      'warn.noFlow',
    );
    expect(solve({ find: 'p2', p1: 0, v1: 0, h1: 0, v2: 20, h2: 0 }).warnings[0]?.key).toBe(
      'warn.vacuum',
    );
  });
});

describe('bernoulli: properties', () => {
  const p = fc.double({ min: -50, max: 5000, noNaN: true });
  const v = fc.double({ min: 0, max: 50, noNaN: true });
  const h = fc.double({ min: -50, max: 50, noNaN: true });
  it('solving for P₂ then P₁ and v₂ recovers the inputs', () =>
    fc.assert(
      fc.property(p, v, h, v, h, (p1, v1, h1, v2, h2) => {
        const P2 = out({ find: 'p2', p1, v1, h1, v2, h2 }).result;
        const back = out({ find: 'p1', p2: P2, v1, h1, v2, h2 }).result;
        const tol =
          1e-9 *
          (Math.abs(p1) + 0.5 * v1 * v1 + 0.5 * v2 * v2 + 10 * (Math.abs(h1) + Math.abs(h2)) + 1);
        const r = solve({ find: 'v2', p1, v1, h1, p2: P2, h2 }).outputs.result as number;
        // Compare kinetic energies: near v₂ = 0 the speed itself is ill-conditioned.
        const ke = Math.abs(500 * (r * r - v2 * v2));
        return Math.abs(back - p1) <= tol && ke <= 1e-6 * (tol / 1e-9) * 1000;
      }),
    ));
});

describe('bernoulli: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = solve(e.inputs).outputs;
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
