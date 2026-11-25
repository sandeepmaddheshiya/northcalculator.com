import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { content } from './content.en';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-25');
const solve = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, {
    today: '2026-11-25',
    fmt: makeFmt('en'),
    t: (k) => content.ui[k] ?? k,
  });
const out = (inputs: Record<string, unknown>) =>
  solve(inputs).outputs as Record<string, number | string>;
const sig = (x: unknown, d: number) => Number((x as number).toPrecision(d));

describe('thin-lens: references (College Physics 2e §25.6)', () => {
  it('Ex 25.6: d_o = 0.750 m, f = 0.500 m → d_i = 1.50 m, m = −2.00, real inverted', () => {
    const o = out({ find: 'image', object: 0.75, focal: 0.5, unit: 'm' });
    expect([o.result, o.magnification, o.kind]).toEqual([1.5, -2, 'Real, inverted, larger']);
  });
  it('Ex 25.7: 7.50 cm, f = 10.0 cm → −30.0 cm, m = 4.00', () => {
    const o = out({ find: 'image', object: 7.5, focal: 10, unit: 'cm' });
    expect([o.result, o.magnification, o.kind]).toEqual([-30, 4, 'Virtual, upright, larger']);
  });
  it('Ex 25.8: f = −10.0 cm → −4.29 cm, m = 0.571', () => {
    const o = out({ find: 'image', object: 7.5, focal: -10, unit: 'cm' });
    expect([sig(o.result, 3), sig(o.magnification, 3)]).toEqual([-4.29, 0.571]);
  });
  it('Ex 25.5: f = 8.00 cm → 12.5 D; f = −5.00 cm → −20 D', () => {
    expect(out({ find: 'image', object: 100, focal: 8, unit: 'cm' }).power).toBe(12.5);
    expect(out({ find: 'image', object: 100, focal: -5, unit: 'cm' }).power).toBe(-20);
  });
});

describe('thin-lens: references (University Physics Vol. 3 §2.4)', () => {
  it('Ex 2.4 (f = 10.0 cm): 50.0 → 12.5, m −0.250; 5.00 → −10.0, m +2.00; 20.0 → 20.0, m −1.00', () => {
    const at = (d: number) => out({ find: 'image', object: d, focal: 10, unit: 'cm' });
    expect([at(50).result, at(50).magnification]).toEqual([12.5, -0.25]);
    expect([at(5).result, at(5).magnification]).toEqual([-10, 2]);
    expect([at(20).result, at(20).magnification, at(20).kind]).toEqual([
      20,
      -1,
      'Real, inverted, same size',
    ]);
  });
  it('Ex 2.5: d_o = 0.75 m, d_i = 1.5 m → f = 0.50 m', () =>
    expect(out({ find: 'focal', object: 0.75, image: 1.5, unit: 'm' }).result).toBe(0.5));
});

describe('thin-lens: behaviour', () => {
  it('object distance from image and focal length', () =>
    expect(out({ find: 'object', image: 1.5, focal: 0.5, unit: 'm' }).result).toBe(0.75));
  it('an object at the focal point is rejected as an image at infinity', () =>
    expect(solve({ find: 'image', object: 10, focal: 10, unit: 'cm' }).warnings[0]?.key).toBe(
      'warn.infinity',
    ));
});

describe('thin-lens: properties', () => {
  it('1/d_o + 1/d_i = 1/f and solving each way round-trips', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 0.01, max: 1000, noNaN: true }),
        fc.double({ min: -1000, max: 1000, noNaN: true }),
        (d, f) => {
          fc.pre(Math.abs(f) > 0.01 && Math.abs(d - f) > 1e-3 * Math.abs(d));
          const i = out({ find: 'image', object: d, focal: f, unit: 'cm' }).result as number;
          fc.pre(Math.abs(i) < 1e9);
          const f2 = out({ find: 'focal', object: d, image: i, unit: 'cm' }).result as number;
          return Math.abs(f2 - f) <= 1e-6 * Math.abs(f);
        },
      ),
    ));
});

describe('thin-lens: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = out(e.inputs);
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
