import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-24', fmt: makeFmt('en') });

describe('cagr: references', () => {
  it('OpenStax Contemporary Mathematics Ex 6.71: $3,000 → $3,660 in 4 years = 5.10%', () =>
    // Book rounds to 5.10%; exact (Python) 0.0509691250…
    expect(run({ start: 3000, end: 3660, years: 4 }).outputs.cagr).toBe(5.0969));
  it('OpenStax Contemporary Mathematics Ex 6.72: $13,000 → $132,293.49 in 20 years = 12.3%', () =>
    expect(run({ start: 13000, end: 132293.49, years: 20 }).outputs.cagr).toBe(12.3));
  it('OpenStax Contemporary Mathematics Ex 6.72: total ROI 917.64%', () =>
    expect(run({ start: 13000, end: 132293.49, years: 20 }).outputs.total).toBe(917.6422));
  it('OpenStax Macroeconomics 3e §7.2: 100 → 209 in 25 years ≈ 3% (209 is rounded from 209.38)', () =>
    // Python: (209/100)**(1/25) - 1 = 0.029925596
    expect(run({ start: 100, end: 209, years: 25 }).outputs.cagr).toBe(2.9926));
});

describe('cagr: behaviour', () => {
  it('doubling in 10 years is 7.18%, not 10%', () =>
    expect(run({ start: 1, end: 2, years: 10 }).outputs.cagr).toBe(7.1773));
  it('losses give a negative rate: 10,000 → 7,290 in 3 years = −10%', () => {
    const r = run({ start: 10000, end: 7290, years: 3 });
    expect(r.outputs.cagr).toBe(-10);
    expect(r.explain?.key).toBe('explain.down');
  });
  it('no change is 0%', () => expect(run({ start: 500, end: 500, years: 7 }).outputs.cagr).toBe(0));
  it('fractional years are allowed and short periods are flagged', () => {
    const r = run({ start: 100, end: 105, years: 0.25 });
    expect(r.outputs.cagr).toBe(21.5506);
    expect(r.warnings[0]?.key).toBe('warn.short');
  });
  it('zero start, zero years and negative end are rejected with a reason', () => {
    expect(run({ start: 0 }).warnings[0]?.key).toBe('warn.start');
    expect(run({ years: 0 }).warnings[0]?.key).toBe('warn.years');
    expect(run({ end: -5 }).warnings[0]?.key).toBe('warn.negative');
  });
  it('ending at zero is −100%', () => expect(run({ end: 0 }).outputs.cagr).toBe(-100));
  it('reports the change in value', () =>
    expect(run({ start: 13000, end: 132293.49 }).outputs.gain).toBe(119293.49));
});

describe('cagr: properties', () => {
  it('compounding the start at the CAGR returns the end value', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 1, max: 1e7, noNaN: true }),
        fc.double({ min: 1, max: 1e7, noNaN: true }),
        fc.integer({ min: 1, max: 60 }),
        (start, end, years) => {
          const r = run({ start, end, years });
          const rate = (end / start) ** (1 / years) - 1;
          return Math.abs((r.outputs.cagr as number) - rate * 100) < 1e-4;
        },
      ),
    ));
  it('the rate rises with the end value', () =>
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 1e6 }), fc.integer({ min: 1, max: 1e6 }), (a, b) => {
        const lo = run({ start: 1000, end: Math.min(a, b), years: 5 }).outputs.cagr as number;
        const hi = run({ start: 1000, end: Math.max(a, b), years: 5 }).outputs.cagr as number;
        return hi >= lo;
      }),
    ));
});

describe('cagr: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run({ ...e.inputs });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
