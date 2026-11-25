import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-25');
const solve = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-25', fmt: makeFmt('en') });
const out = (inputs: Record<string, unknown>) => solve(inputs).outputs as Record<string, number>;
const sig = (x: number, d: number) => Number(x.toPrecision(d));

describe('half-life: references', () => {
  it('Chemistry 2e Ex 21.5: cobalt-60, λ = 0.132 y⁻¹; 15 y → 13.9% exact (book 13.8% with λ = 0.132); 2.00% at 29.7 y (book 29.6)', () => {
    const o = out({ find: 'remaining', initial: 100, time: 15, halfLife: 5.27 });
    expect(sig(o.lambda!, 3)).toBe(0.132);
    expect(sig(o.result!, 3)).toBe(13.9);
    expect(sig(100 * Math.exp(-0.132 * 15), 3)).toBe(13.8);
    expect(sig(out({ find: 'time', initial: 100, remaining: 2, halfLife: 5.27 }).result!, 3)).toBe(
      29.7,
    );
    expect(sig(-Math.log(0.02) / 0.132, 3)).toBe(29.6);
  });
  it('§21.3 check: radon-222, 0.750 → 0.100 g → 11.1 d', () =>
    expect(
      sig(out({ find: 'time', initial: 0.75, remaining: 0.1, halfLife: 3.823 }).result!, 3),
    ).toBe(11.1));
  it('Ex 21.6: Dead Sea Scrolls, 10.8 of 13.6 → 1906 y (book prints 1910 with λ = 1.21 × 10⁻⁴); King Tut 9.07 → about 3350 y', () => {
    expect(
      Math.round(out({ find: 'time', initial: 13.6, remaining: 10.8, halfLife: 5730 }).result!),
    ).toBe(1906);
    expect(sig(-Math.log(10.8 / 13.6) / 1.21e-4, 3)).toBe(1910);
    expect(
      sig(out({ find: 'time', initial: 13.6, remaining: 9.07, halfLife: 5730 }).result!, 3),
    ).toBe(3350);
  });
  it('College Physics 2e Ex 31.4: 92% left, t½ = 5730 y → 690 y', () =>
    expect(sig(out({ find: 'time', initial: 1, remaining: 0.92, halfLife: 5730 }).result!, 2)).toBe(
      690,
    ));
});

describe('half-life: behaviour', () => {
  it('FAQ: 80 g, 10-day half-life, 30 days → 10 g; half left = one half-life', () => {
    expect(out({ find: 'remaining', initial: 80, time: 30, halfLife: 10 }).result).toBe(10);
    expect(out({ find: 'halfLife', initial: 80, remaining: 40, time: 7 }).result).toBe(7);
  });
  it('invalid remaining amounts are rejected', () => {
    expect(solve({ find: 'time', initial: 10, remaining: 20, halfLife: 1 }).warnings[0]?.key).toBe(
      'warn.remaining',
    );
    expect(solve({ find: 'halfLife', initial: 10, remaining: 10, time: 1 }).warnings[0]?.key).toBe(
      'warn.remaining',
    );
  });
});

describe('half-life: properties', () => {
  it('remaining → time → half-life round-trips', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 0.01, max: 1e6, noNaN: true }),
        fc.double({ min: 0.001, max: 1e4, noNaN: true }),
        fc.double({ min: 0.01, max: 20, noNaN: true }),
        (n0, h, k) => {
          const t = k * h;
          const n = out({ find: 'remaining', initial: n0, time: t, halfLife: h }).result!;
          fc.pre(n > 0 && n < n0);
          const t2 = out({ find: 'time', initial: n0, remaining: n, halfLife: h }).result!;
          const h2 = out({ find: 'halfLife', initial: n0, remaining: n, time: t }).result!;
          return Math.abs(t2 - t) <= 1e-8 * t + 1e-12 && Math.abs(h2 - h) <= 1e-8 * h;
        },
      ),
    ));
});

describe('half-life: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = out(e.inputs);
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
