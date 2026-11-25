import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute, K } from './compute';
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

describe('coulomb: references', () => {
  it('k = 1/(4πε₀) = 8.988 × 10⁹ (College Physics 2e Eq. 18.4)', () =>
    expect(sig(K, 4)).toBe(8.988e9));
  it('College Physics Ex 18.1: e and −e at 0.530 × 10⁻¹⁰ m → 8.19 × 10⁻⁸ N with k = 8.99 × 10⁹, e = 1.60 × 10⁻¹⁹ (8.21 × 10⁻⁸ exact)', () => {
    const o = out({ q1: 1, u1: 'e', q2: -1, u2: 'e', r: 0.53e-10 });
    expect([sig(o.force, 3), o.kind]).toEqual([8.21e-8, 'Attract']);
    expect(
      sig(
        (out({ q1: 1.6e-19, u1: 'C', q2: -1.6e-19, u2: 'C', r: 0.53e-10 }).force! as number) *
          (8.99e9 / K),
        3,
      ),
    ).toBe(8.19e-8);
  });
  it('University Physics Ex 5.1: ±1.602 × 10⁻¹⁹ C at 5.29 × 10⁻¹¹ m → 8.25 × 10⁻⁸ N (8.24 × 10⁻⁸ with CODATA k)', () => {
    expect(sig(out({ q1: 1, u1: 'e', q2: -1, u2: 'e', r: 5.29e-11 }).force, 3)).toBe(8.24e-8);
    const kBook = 1 / (4 * Math.PI * 8.85e-12);
    expect(sig((kBook * 1.602e-19 ** 2) / 5.29e-11 ** 2, 3)).toBe(8.25e-8);
  });
});

describe('coulomb: behaviour', () => {
  it('like charges repel; zero charge feels nothing; units convert', () => {
    expect(out({ q1: 2, u1: 'uC', q2: 3, u2: 'uC', r: 0.1 }).kind).toBe('Repel');
    expect(out({ q1: 0, u1: 'C', q2: 3, u2: 'uC', r: 0.1 }).kind).toBe('No force');
    expect(out({ q1: 1000, u1: 'nC', q2: 1, u2: 'uC', r: 1 }).force).toBe(
      out({ q1: 1, u1: 'uC', q2: 1, u2: 'uC', r: 1 }).force,
    );
  });
  it('zero distance rejected', () =>
    expect(solve({ q1: 1, q2: 1, r: 0 }).warnings[0]?.key).toBe('warn.r'));
});

describe('coulomb: properties', () => {
  it('inverse square in r and symmetric in the charges', () =>
    fc.assert(
      fc.property(
        fc.integer({ min: -1000, max: 1000 }).filter((n) => n !== 0),
        fc.integer({ min: -1000, max: 1000 }).filter((n) => n !== 0),
        fc.double({ min: 1e-6, max: 1e6, noNaN: true }),
        (a, b, r) => {
          const f = out({ q1: a, u1: 'uC', q2: b, u2: 'uC', r }).force as number;
          const g = out({ q1: b, u1: 'uC', q2: a, u2: 'uC', r: 2 * r }).force as number;
          return Math.abs(4 * g - f) <= 1e-9 * f;
        },
      ),
    ));
});

describe('coulomb: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = out(e.inputs);
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
