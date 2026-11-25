import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-25');
const solve = (inputs: Record<string, unknown>) =>
  compute({ ...base, mass: 0, ...inputs } as never, { today: '2026-11-25', fmt: makeFmt('en') });
const out = (inputs: Record<string, unknown>) => solve(inputs).outputs as Record<string, number>;
const sig = (x: number, d: number) => Number(x.toPrecision(d));

describe('hookes-law: references', () => {
  it('College Physics 2e Ex 16.1: 784 N over 1.20 cm → 6.53 × 10⁴ N/m', () =>
    expect(sig(out({ find: 'k', force: 80 * 9.8, x: 0.012 }).result!, 3)).toBe(65300));
  it('Ex 16.2: k = 50.0, x = 0.150 → 0.563 J', () =>
    expect(sig(out({ find: 'force', k: 50, x: 0.15 }).energy!, 3)).toBe(0.563));
  it('University Physics Ex 7.5: 0.54 J for 6 cm → 300 N/m; 6 → 12 cm takes 1.62 J', () => {
    const k = (2 * 0.54) / 0.06 ** 2;
    expect(sig(k, 12)).toBe(300);
    const e6 = out({ find: 'force', k: 300, x: 0.06 }).energy!;
    const e12 = out({ find: 'force', k: 300, x: 0.12 }).energy!;
    expect([e6, e12, sig(e12 - e6, 12)]).toEqual([0.54, 2.16, 1.62]);
  });
  it('Ex 15.2: 2.00 kg on 32.00 N/m → T = 1.57 s (ω = 4.00 s⁻¹)', () => {
    const o = out({ find: 'force', k: 32, x: 0.02, mass: 2 });
    expect(sig(o.period!, 3)).toBe(1.57);
    expect(sig((2 * Math.PI) / o.period!, 10)).toBe(4); // period keeps 12 significant digits
  });
});

describe('hookes-law: behaviour', () => {
  it('FAQ: 9.8 N over 0.05 m → 196 N/m; stretch from force', () => {
    expect(out({ find: 'k', force: 9.8, x: 0.05 }).result).toBe(196);
    expect(out({ find: 'x', force: 98, k: 196 }).result).toBe(0.5);
  });
  it('zero stretch or k is rejected; no mass, no period', () => {
    expect(solve({ find: 'k', force: 1, x: 0 }).warnings[0]?.key).toBe('warn.x');
    expect(solve({ find: 'x', force: 1, k: 0 }).warnings[0]?.key).toBe('warn.k');
    expect(out({ find: 'force', k: 10, x: 1 }).period).toBeNull();
  });
});

describe('hookes-law: properties', () => {
  it('force → k → x round-trips and energy = ½Fx', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 0.01, max: 1e6, noNaN: true }),
        fc.double({ min: 1e-4, max: 10, noNaN: true }),
        (k, x) => {
          const f = out({ find: 'force', k, x }).result!;
          const k2 = out({ find: 'k', force: f, x }).result!;
          const x2 = out({ find: 'x', force: f, k }).result!;
          const e = out({ find: 'force', k, x }).energy!;
          return (
            Math.abs(k2 - k) <= 1e-9 * k &&
            Math.abs(x2 - x) <= 1e-9 * x &&
            Math.abs(e - 0.5 * f * x) <= 1e-9 * f * x
          );
        },
      ),
    ));
});

describe('hookes-law: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = out(e.inputs);
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
