import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-25');
const solve = (inputs: Record<string, unknown>) =>
  compute({ ...base, vo: 0, ...inputs } as never, { today: '2026-11-25', fmt: makeFmt('en') });
const fo = (inputs: Record<string, unknown>) => solve(inputs).outputs.fo as number;
const sig = (x: number, d: number) => Number(x.toPrecision(d));

describe('doppler: references', () => {
  it('College Physics Ex 17.4 / University Physics Ex 17.8: 150 Hz, 35.0 m/s, 340 m/s → 167 Hz and 136 Hz', () => {
    expect(sig(fo({ fs: 150, vw: 340, vs: 35, sdir: 'toward' }), 3)).toBe(167);
    expect(fo({ fs: 150, vw: 340, vs: 35, sdir: 'away' })).toBe(136);
  });
  it('the shifts are 17.2 Hz up (book 17.0 from the rounded 167 Hz) and 14.0 Hz down', () => {
    expect(
      sig(solve({ fs: 150, vw: 340, vs: 35, sdir: 'toward' }).outputs.shift as number, 3),
    ).toBe(17.2);
    expect(solve({ fs: 150, vw: 340, vs: 35, sdir: 'away' }).outputs.shift).toBe(-14);
  });
  it('the engineer moving with the horn hears 150 Hz', () =>
    expect(fo({ fs: 150, vw: 340, vs: 35, sdir: 'away', vo: 35, odir: 'toward' })).toBe(150));
});

describe('doppler: behaviour', () => {
  it('a moving listener: toward 340 Hz source at 34 m/s hears 1.1 × f', () =>
    expect(fo({ fs: 340, vw: 340, vs: 0, vo: 34, odir: 'toward' })).toBe(374));
  it('supersonic approach and an outrun listener are rejected', () => {
    expect(solve({ fs: 100, vw: 340, vs: 340, sdir: 'toward' }).warnings[0]?.key).toBe(
      'warn.supersonic',
    );
    expect(solve({ fs: 100, vw: 340, vs: 0, vo: 400, odir: 'away' }).warnings[0]?.key).toBe(
      'warn.outrun',
    );
  });
});

describe('doppler: properties', () => {
  it('approaching raises, receding lowers, and no motion leaves f unchanged', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 1, max: 1e5, noNaN: true }),
        fc.double({ min: 0.1, max: 300, noNaN: true }),
        (f, vs) => {
          const up = fo({ fs: f, vw: 340, vs, sdir: 'toward' });
          const down = fo({ fs: f, vw: 340, vs, sdir: 'away' });
          return (
            up > f &&
            down < f &&
            up - f > f - down &&
            Math.abs(fo({ fs: f, vw: 340, vs: 0 }) - f) <= 1e-11 * f
          );
        },
      ),
    ));
});

describe('doppler: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = solve(e.inputs).outputs;
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
