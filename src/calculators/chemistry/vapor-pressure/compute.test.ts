import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-26');
const solve = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-26', fmt: makeFmt('en') });
type Out = Record<'result' | 'dh' | 'p2' | 't2K', number>;
const out = (inputs: Record<string, unknown>) => solve(inputs).outputs as unknown as Out;
const sig = (x: number, d: number) => Number(x.toPrecision(d));

describe('vapor-pressure: references (OpenStax Chemistry 2e §10.3)', () => {
  it('Ex 10.7: isooctane 10.0 kPa at 34.0 °C, 100 kPa at 98.8 °C → 33.8 kJ/mol', () =>
    expect(sig(out({ find: 'dh', tu: 'C', p1: 10, t1: 34, p2: 100, t2: 98.8 }).result, 3)).toBe(
      33.8,
    ));
  it('check: ethanol 5.95 kPa at 20.0 °C, 53.3 kPa at 63.5 °C → 41.4 kJ/mol', () =>
    expect(sig(out({ find: 'dh', tu: 'C', p1: 5.95, t1: 20, p2: 53.3, t2: 63.5 }).result, 3)).toBe(
      41.4,
    ));
  it('Ex 10.8: benzene in Denver → 73.7 °C (printed 73.8 from 353.3 K and 346.9 K)', () => {
    const o = out({ find: 't2', tu: 'C', p1: 101.325, t1: 80.1, p2: 83.4, dh: 30.8 });
    // ADR-022: 80.1 °C is 353.25 K, giving 346.81 K (73.7 °C); the book rounds T₁ to 353.3 K.
    expect([sig(o.t2K, 4), sig(o.result, 3)]).toEqual([346.8, 73.7]);
    const book = out({ find: 't2', tu: 'K', p1: 101.325, t1: 353.3, p2: 83.4, dh: 30.8 });
    expect(sig(book.t2K, 4)).toBe(346.9);
  });
  it('check: acetone (56.5 °C, 31.3 kJ/mol) at 25.0 °C → 30.3 kPa (printed 30.1)', () => {
    const o = out({ find: 'p2', tu: 'C', p1: 101.325, t1: 56.5, t2: 25, dh: 31.3 });
    // ADR-022: 30.3 kPa with these inputs; the printed 30.1 reflects rounding in the book’s steps.
    expect(sig(o.result, 3)).toBe(30.3);
  });
});

describe('vapor-pressure: references (Chieh & Censullo, LibreTexts)', () => {
  it('Ex 1: water 1.0 atm at 373 K, 40.7 kJ/mol → 0.697 atm at 363 K, 1.409 atm at 383 K', () => {
    const at = (t2: number) => out({ find: 'p2', tu: 'K', p1: 1, t1: 373, t2, dh: 40.7 }).result;
    expect([sig(at(363), 3), sig(at(383), 4)]).toEqual([0.697, 1.409]);
  });
  it('Ex 2: ice 2.965 torr at 268 K, 4.560 torr at 273 K → ΔH_sub 52,370 J/mol', () =>
    expect(
      sig(out({ find: 'dh', tu: 'K', p1: 2.965, t1: 268, p2: 4.56, t2: 273 }).result * 1000, 4),
    ).toBe(52370));
  it('Ex 3: ethanol 150 torr at 313 K, 760 torr at 351 K → 39.0 kJ/mol', () =>
    expect(sig(out({ find: 'dh', tu: 'K', p1: 150, t1: 313, p2: 760, t2: 351 }).result, 3)).toBe(
      39,
    ));
});

describe('vapor-pressure: behaviour', () => {
  it('equal temperatures and reversed data are explained', () => {
    expect(solve({ find: 'dh', tu: 'C', p1: 10, t1: 20, p2: 20, t2: 20 }).warnings[0]?.key).toBe(
      'warn.same',
    );
    expect(solve({ find: 'dh', tu: 'C', p1: 100, t1: 20, p2: 10, t2: 80 }).warnings[0]?.key).toBe(
      'warn.negative',
    );
  });
});

describe('vapor-pressure: properties', () => {
  it('ΔH from two points reproduces P₂ and T₂', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 0.1, max: 1000, noNaN: true }),
        fc.double({ min: 200, max: 600, noNaN: true }),
        fc.double({ min: 1.1, max: 100, noNaN: true }),
        fc.double({ min: 5, max: 100, noNaN: true }),
        (p1, t1, ratio, dT) => {
          const p2 = p1 * ratio;
          const t2 = t1 + dT;
          const dh = out({ find: 'dh', tu: 'K', p1, t1, p2, t2 }).result;
          const pb = out({ find: 'p2', tu: 'K', p1, t1, t2, dh }).result;
          const tb = out({ find: 't2', tu: 'K', p1, t1, p2, dh }).result;
          return Math.abs(pb / p2 - 1) <= 1e-8 && Math.abs(tb - t2) <= 1e-8 * t2;
        },
      ),
    ));
});

describe('vapor-pressure: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = solve(e.inputs).outputs;
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
