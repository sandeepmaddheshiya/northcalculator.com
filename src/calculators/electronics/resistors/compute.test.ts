import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute, parseResistors } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (mode: string, values: string, voltage: number | null = null) =>
  compute({ ...base, mode, values, voltage } as never, { today: '2026-11-24', fmt: makeFmt('en') });
const out = (mode: string, values: string, voltage: number | null = null) =>
  run(mode, values, voltage).outputs as Record<string, number>;
const sig3 = (x: number) => Number(x.toPrecision(3));

describe('resistors: references', () => {
  it('OpenStax College Physics 2e Ex 21.1: 1.00 + 6.00 + 13.0 = 20.0 Ω; 0.600 A, 7.20 W at 12.0 V', () => {
    const o = out('series', '1, 6, 13', 12);
    expect([o.result, o.current, o.power]).toEqual([20, 0.6, 7.2]);
  });
  it('Ex 21.2: in parallel 0.804 Ω, 14.92 A, 179 W', () => {
    const o = out('parallel', '1, 6, 13', 12);
    expect([sig3(o.result!), Math.round(o.current! * 100) / 100, sig3(o.power!)]).toEqual([
      0.804, 14.92, 179,
    ]);
  });
  it('Ex 21.3: 6.00 ∥ 13.0 = 4.11 Ω', () =>
    expect(sig3(out('parallel', '6 13').result!)).toBe(4.11));
  it('University Physics Vol. 2 Ex 10.2: 4 × 20 + 10 = 90 Ω, 0.1 A at 9 V, 0.9 W', () => {
    const o = out('series', '20 20 20 20 10', 9);
    expect([o.result, o.current, o.power]).toEqual([90, 0.1, 0.9]);
  });
  it('Ex 10.3: 1.00 ∥ 2.00 ∥ 2.00 = 0.50 Ω, 6.00 A, 18.00 W at 3.00 V', () => {
    const o = out('parallel', '1; 2; 2', 3);
    expect([o.result, o.current, o.power]).toEqual([0.5, 6, 18]);
  });
  it('Ex 10.5: 10 + 10 + (10 ∥ 10) = 25 Ω', () =>
    expect(out('series', '10 10').result! + out('parallel', '10 10').result!).toBe(25));
});

describe('resistors: parser', () => {
  it('prefixes and units', () => {
    expect(parseResistors('4.7k, 1M, 220Ω, 330 ohms, .5').values).toEqual([
      4700, 1e6, 220, 330, 0.5,
    ]);
    expect(parseResistors('4.7kΩ 10K').values).toEqual([4700, 10000]);
  });
  it('bad tokens are reported and skipped', () => {
    const r = run('series', '10, abc, -5, 0, 20');
    expect(r.outputs.result).toBe(30);
    expect(r.warnings[0]?.values?.bad).toBe('abc, -5, 0');
  });
  it('nothing valid → no result', () =>
    expect(run('series', 'x y').warnings[0]?.key).toBe('warn.none'));
});

describe('resistors: properties', () => {
  it('parallel ≤ smallest ≤ largest ≤ series; n equal resistors give R/n and nR', () =>
    fc.assert(
      fc.property(
        fc.array(fc.double({ min: 0.001, max: 1e7, noNaN: true }), { minLength: 1, maxLength: 12 }),
        (rs) => {
          const text = rs.map((r) => String(r)).join(', ');
          const o = out('series', text);
          return (
            o.parallel! <= Math.min(...rs) * (1 + 1e-11) &&
            o.series! >= Math.max(...rs) * (1 - 1e-11)
          );
        },
      ),
    ));
  it('equal resistors', () =>
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 100000 }), fc.integer({ min: 1, max: 20 }), (r, n) => {
        const text = Array(n).fill(r).join(' ');
        const o = out('parallel', text);
        return Math.abs(o.parallel! - r / n) <= 1e-9 * r && o.series === r * n;
      }),
    ));
});

describe('resistors: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = out(String(e.inputs.mode), String(e.inputs.values), Number(e.inputs.voltage));
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
