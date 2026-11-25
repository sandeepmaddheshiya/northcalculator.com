import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-25');
const solve = (inputs: Record<string, unknown>) =>
  compute({ ...base, tu: 'K', ...inputs } as never, { today: '2026-11-25', fmt: makeFmt('en') });
const res = (inputs: Record<string, unknown>) => solve(inputs).outputs.result as number;
const sig = (x: number, d: number) => Number(x.toPrecision(d));

describe('combined-gas: references', () => {
  it('LibreTexts Ex 11.6.1: 1.82 atm, 8.33 L, 286 K → 5.72 L, 355 K gives 3.29 atm (printed 3.22, a misprint)', () =>
    expect(sig(res({ find: 'p2', p1: 1.82, v1: 8.33, t1: 286, v2: 5.72, t2: 355 }), 3)).toBe(3.29));
  it('§11.6 exercise: 662 torr, 46.7 mL, 266 K → 409 torr, 371 K gives 105 mL', () =>
    expect(sig(res({ find: 'v2', p1: 662, v1: 46.7, t1: 266, p2: 409, t2: 371 }), 3)).toBe(105));
  it('§11.4 Boyle: 2.44 atm, 4.01 L → 1.93 atm gives 5.07 L; 722 torr, 88.8 mL → 663 mL gives 96.7 torr', () => {
    expect(sig(res({ find: 'v2', p1: 2.44, v1: 4.01, t1: 300, p2: 1.93, t2: 300 }), 3)).toBe(5.07);
    expect(sig(res({ find: 'p2', p1: 722, v1: 88.8, t1: 300, v2: 663, t2: 300 }), 3)).toBe(96.7);
  });
  it('§11.5 Charles: 2.20 L at 22 °C → 71 °C gives 2.57 L; 34.8 L at 206 K → 25.0 L gives 148 K', () => {
    expect(sig(res({ find: 'v2', p1: 1, v1: 2.2, t1: 22, p2: 1, t2: 71, tu: 'C' }), 3)).toBe(2.57);
    expect(sig(res({ find: 't2', p1: 1, v1: 34.8, t1: 206, p2: 1, v2: 25 }), 3)).toBe(148);
  });
  it('OpenStax Chemistry 2e Ex 9.10: 153 atm, 13.2 L, 300 K → 3.13 atm, 310 K gives 667 L; check: 0.193 L', () => {
    expect(sig(res({ find: 'v2', p1: 153, v1: 13.2, t1: 300, p2: 3.13, t2: 310 }), 3)).toBe(667);
    expect(sig(res({ find: 'v2', p1: 0.85, v1: 0.25, t1: 27, p2: 1, t2: 0, tu: 'C' }), 3)).toBe(
      0.193,
    );
  });
});

describe('combined-gas: behaviour', () => {
  it('T₂ in °C when asked in °C', () =>
    expect(res({ find: 't2', p1: 1, v1: 1, t1: 0, p2: 1, v2: 2, tu: 'C' })).toBe(273.15));
  it('below absolute zero and zero volumes are rejected', () => {
    expect(
      solve({ find: 'p2', p1: 1, v1: 1, t1: -300, v2: 1, t2: 300, tu: 'C' }).warnings[0]?.key,
    ).toBe('warn.kelvin');
    expect(solve({ find: 'p2', p1: 1, v1: 1, t1: 300, v2: 0, t2: 300 }).warnings[0]?.key).toBe(
      'warn.zero',
    );
  });
});

describe('combined-gas: properties', () => {
  it('solving for each unknown reproduces the same state', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 0.1, max: 1000, noNaN: true }),
        fc.double({ min: 0.1, max: 1000, noNaN: true }),
        fc.double({ min: 50, max: 2000, noNaN: true }),
        fc.double({ min: 0.1, max: 1000, noNaN: true }),
        fc.double({ min: 50, max: 2000, noNaN: true }),
        (p1, v1, t1, v2, t2) => {
          const p2 = res({ find: 'p2', p1, v1, t1, v2, t2 });
          const v2b = res({ find: 'v2', p1, v1, t1, p2, t2 });
          const t2b = res({ find: 't2', p1, v1, t1, p2, v2 });
          return Math.abs(v2b - v2) <= 1e-9 * v2 && Math.abs(t2b - t2) <= 1e-9 * t2;
        },
      ),
    ));
});

describe('combined-gas: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = solve(e.inputs).outputs;
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
