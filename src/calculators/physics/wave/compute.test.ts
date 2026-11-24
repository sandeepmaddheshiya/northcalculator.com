import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { C, compute } from './compute';
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

describe('wave: references', () => {
  it('College Physics 2e Ex 16.8: λ = 10.0 m, T = 5.00 s → 2.00 m/s', () =>
    expect(
      out({ find: 'speed', wavelength: 10, lu: 'm', frequency: 1 / 5, fu: 'Hz', vu: 'ms' }).ms,
    ).toBe(2));
  it('University Physics Ex 16.1: 5.00 m/s at 2.00 Hz → T = 0.50 s, λ = 2.50 m', () => {
    const o = out({ find: 'wavelength', speed: 5, vu: 'ms', frequency: 2, fu: 'Hz', lu: 'm' });
    expect([o.period, o.m]).toEqual([0.5, 2.5]);
  });
  it('Ex 16.2: λ = 8.00 cm at 2.00 cm/s → T = 4.00 s, f = 0.25 Hz', () => {
    const o = out({ find: 'frequency', speed: 0.02, vu: 'ms', wavelength: 8, lu: 'cm', fu: 'Hz' });
    expect([o.hz, o.period]).toEqual([0.25, 4]);
  });
  it('§16.1: c = 2.99792458 × 10⁸ m/s', () => expect(C).toBe(2.99792458e8));
});

describe('wave: behaviour', () => {
  it('FAQ: 2.4 GHz → 12.5 cm; 532 nm → ≈ 564 THz', () => {
    expect(
      out({ find: 'wavelength', speed: 1, vu: 'c', frequency: 2.4, fu: 'GHz', lu: 'cm' }).result,
    ).toBe('12.49135242 cm');
    expect(
      Math.round(
        (out({ find: 'frequency', speed: 1, vu: 'c', wavelength: 532, lu: 'nm', fu: 'THz' })
          .hz as number) / 1e12,
      ),
    ).toBe(564);
  });
  it('50 Hz repeats every 0.02 s', () =>
    expect(out({ find: 'wavelength', speed: 340, vu: 'ms', frequency: 50, fu: 'Hz' }).period).toBe(
      0.02,
    ));
  it('zero divisors are rejected; faster than light is flagged', () => {
    expect(solve({ find: 'wavelength', speed: 1, frequency: 0 }).warnings[0]?.key).toBe(
      'warn.zero',
    );
    expect(
      solve({ find: 'speed', frequency: 1, fu: 'GHz', wavelength: 1, lu: 'm' }).warnings[0]?.key,
    ).toBe('warn.fast');
  });
});

describe('wave: properties', () => {
  it('solving for each quantity round-trips', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 1e-3, max: 1e9, noNaN: true }),
        fc.double({ min: 1e-3, max: 1e12, noNaN: true }),
        (v, f) => {
          const l = out({ find: 'wavelength', speed: v, vu: 'ms', frequency: f, fu: 'Hz', lu: 'm' })
            .m as number;
          const f2 = out({
            find: 'frequency',
            speed: v,
            vu: 'ms',
            wavelength: l,
            lu: 'm',
            fu: 'Hz',
          }).hz as number;
          const v2 = out({
            find: 'speed',
            frequency: f,
            fu: 'Hz',
            wavelength: l,
            lu: 'm',
            vu: 'ms',
          }).ms as number;
          return Math.abs(f2 - f) <= 1e-9 * f && Math.abs(v2 - v) <= 1e-9 * v;
        },
      ),
    ));
});

describe('wave: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = out(e.inputs);
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
