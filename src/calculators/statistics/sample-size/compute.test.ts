import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-24', fmt: makeFmt('en') })
    .outputs as Record<string, number>;
const prop = (margin: number, level: number, p = 50) =>
  run({ type: 'proportion', margin, level, p });

describe('sample-size: references', () => {
  it('OpenStax Intro Stats 2e Ex 8.14: ±0.03 at 90%, p′q′ = 0.25 → 751.7 → 752', () => {
    const o = prop(3, 90);
    expect(Math.round(o.exact! * 10) / 10).toBe(751.5);
    expect(o.n).toBe(752);
  });
  it('Ex 8.7: σ = 15, EBM = 2, 95% → 216.09 → 217 (book uses z = 1.96; exact z gives 216.08)', () => {
    const o = run({ type: 'mean', sd: 15, margin: 2, level: 95 });
    expect(o.n).toBe(217);
    expect(Math.round(((1.96 * 15) / 2) ** 2 * 100) / 100).toBe(216.09);
  });
  it('NIST 7.2.2.2: N ≥ (1.96/δ)²σ² — σ = 1, δ = 0.5 → 15.37 → 16', () => {
    const o = run({ type: 'mean', sd: 1, margin: 0.5, level: 95 });
    expect(o.n).toBe(16);
    expect(Math.ceil((1.96 / 0.5) ** 2)).toBe(16);
  });
});

describe('sample-size: behaviour', () => {
  it('FAQ: ±5, ±3, ±1 at 95% → 385, 1,068, 9,604', () =>
    expect([prop(5, 95).n, prop(3, 95).n, prop(1, 95).n]).toEqual([385, 1068, 9604]));
  it('p = 10% needs about a third as many as 50%', () => expect(prop(5, 95, 10).n).toBe(139));
  it('p = 0 or 100% needs 1; zero margin is rejected', () => {
    expect(prop(5, 95, 0).n).toBe(1);
    expect(
      compute({ ...base, margin: 0 } as never, { today: '', fmt: makeFmt('en') }).warnings[0]?.key,
    ).toBe('warn.margin');
  });
});

describe('sample-size: properties', () => {
  it('halving the margin roughly quadruples n; more confidence never needs fewer', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 0.5, max: 20, noNaN: true }),
        fc.double({ min: 51, max: 99.5, noNaN: true }),
        (e, c) => {
          const a = prop(e, c).exact!;
          const b = prop(e / 2, c).exact!;
          return Math.abs(b / a - 4) < 1e-9 && prop(e, Math.min(99.9, c + 0.4)).n! >= prop(e, c).n!;
        },
      ),
    ));
});

describe('sample-size: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = run(e.inputs);
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
