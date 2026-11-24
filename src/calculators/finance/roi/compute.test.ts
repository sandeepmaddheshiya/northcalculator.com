import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-24', fmt: makeFmt('en') });

describe('roi: references (OpenStax Contemporary Mathematics §6.7)', () => {
  it('Ex 6.67: $728 gain on $2,187 = 33.29%', () => {
    const r = run({ cost: 2187, value: 2915 });
    expect(r.outputs.gain).toBe(728);
    expect(r.outputs.roi).toBe(33.2876);
  });
  it('Ex 6.70: $660 on $3,000 = 22%', () =>
    expect(run({ cost: 3000, value: 3660, years: 4 }).outputs.roi).toBe(22));
  it('Ex 6.71: annual return of the bond is 5.10%', () =>
    expect(run({ cost: 3000, value: 3660, years: 4 }).outputs.annualized).toBe(5.0969));
  it('Ex 6.72: $13,000 → $132,293.49 is 917.64%, annual 12.3%', () => {
    const r = run({ cost: 13000, value: 132293.49, years: 20 });
    expect(r.outputs.roi).toBe(917.6422);
    expect(r.outputs.annualized).toBe(12.3);
  });
});

describe('roi: behaviour', () => {
  it('FAQ: $5,000 → $6,200 = 24%', () =>
    expect(run({ cost: 5000, value: 6200 }).outputs.roi).toBe(24));
  it('losses are negative: $1,000 → $850 = −15%', () => {
    const r = run({ cost: 1000, value: 850 });
    expect(r.outputs.roi).toBe(-15);
    expect(r.explain?.key).toBe('explain.loss');
  });
  it('50% over 5 years ≈ 8.45% a year', () =>
    expect(run({ cost: 100, value: 150, years: 5 }).outputs.annualized).toBe(8.4472));
  it('years 0 skips the annualized figure', () =>
    expect(run({ years: 0 }).outputs.annualized).toBeNull());
  it('short holding periods are flagged', () =>
    expect(run({ years: 0.5 }).warnings[0]?.key).toBe('warn.short'));
  it('zero cost is rejected', () => expect(run({ cost: 0 }).warnings[0]?.key).toBe('warn.cost'));
});

describe('roi: properties', () => {
  it('with one year held, annualized equals ROI', () =>
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 1e7 }), fc.integer({ min: 0, max: 1e7 }), (c, v) => {
        const r = run({ cost: c, value: v, years: 1 }).outputs;
        return Math.abs((r.roi as number) - (r.annualized as number)) < 2e-4;
      }),
    ));
});

describe('roi: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run({ ...e.inputs });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
