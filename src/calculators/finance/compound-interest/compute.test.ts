import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (inputs: Record<string, unknown>) =>
  compute({ ...base, add: 0, ...inputs } as never, {
    today: '2026-11-24',
    fmt: makeFmt('en', 'USD'),
  });
const fv = (inputs: Record<string, unknown>) => run(inputs).outputs.fv as number;

describe('compound interest: OpenStax Contemporary Mathematics §6.4 and §6.6 (verified 2026-11-24)', () => {
  it('Ex 6.39: $1,000 at 4% compounded annually for 3 years → $1,124.86', () =>
    expect(fv({ principal: 1000, rate: 4, years: 3, comp: 'annual' })).toBe(1124.86));
  it('Ex 6.41a: $5,000 at 3.8% monthly for 5 years → $6,044.43', () =>
    expect(fv({ principal: 5000, rate: 3.8, years: 5, comp: 'monthly' })).toBe(6044.43));
  // The book truncates to the cent in 6.41b and 6.42; exact values (Python decimal) are
  // 53,093.548… and 11,732.826…, which round half-up to .55 and .83.
  it('Ex 6.41b: $18,500 at 6.25% quarterly for 17 years → $53,093.54 (exact 53,093.548…)', () =>
    expect(fv({ principal: 18500, rate: 6.25, years: 17, comp: 'quarterly' })).toBe(53093.55));
  it('Ex 6.42: $7,500 at 4.5% quarterly for 10 years → $11,732.82 (exact 11,732.826…)', () =>
    expect(fv({ principal: 7500, rate: 4.5, years: 10, comp: 'quarterly' })).toBe(11732.83));
  it('Ex 6.43: $10,000 at 5.6% daily for 20 years → $30,645.90', () =>
    expect(fv({ principal: 10000, rate: 5.6, years: 20, comp: 'daily' })).toBe(30645.91));
  it('Ex 6.46: 6% compounded quarterly has an effective annual yield of 6.14%', () =>
    expect(run({ rate: 6, comp: 'quarterly', principal: 1 }).outputs.apy as number).toBeCloseTo(
      6.136,
      3,
    ));
  it('Ex 6.47: 5% compounded daily yields 5.13%', () =>
    expect(run({ rate: 5, comp: 'daily', principal: 1 }).outputs.apy as number).toBeCloseTo(
      5.127,
      3,
    ));
  it('Ex 6.55: $4,520 at 1.45% annually for 3 years → $4,719.48', () =>
    expect(fv({ principal: 4520, rate: 1.45, years: 3, comp: 'annual' })).toBe(4719.48));
  it('Ex 6.57: $2,500 at 1.76% monthly for 4 years → $2,682.20', () =>
    expect(fv({ principal: 2500, rate: 1.76, years: 4, comp: 'monthly' })).toBe(2682.2));
  it('Ex 6.59: $250 a month at 3.75% monthly for 8 years → $27,938.20', () =>
    expect(fv({ principal: 0, rate: 3.75, years: 8, add: 250 })).toBe(27938.2));
  it('Ex 6.60: $2,500 a year at 3.4% annually for 18 years → $60,694.77 (book truncates; exact 60,694.777…)', () =>
    expect(
      fv({ principal: 0, rate: 3.4, years: 18, comp: 'annual', add: 2500, freq: 'annually' }),
    ).toBe(60694.78));
});

describe('compound interest: behaviour', () => {
  it('Ex 6.43 book value: $30,645.90 vs exact $30,645.909… (rounds to .91)', () => {
    // 10000 × (1 + 0.056/365)^7300 = 30645.90916 (Python); the book truncates to the cent.
    expect(
      Math.abs(fv({ principal: 10000, rate: 5.6, years: 20, comp: 'daily' }) - 30645.9),
    ).toBeLessThan(0.02);
  });
  it('continuous compounding: P·e^(rt)', () =>
    expect(fv({ principal: 1000, rate: 5, years: 10, comp: 'continuous' })).toBe(1648.72));
  it('annuity due earns one extra period of interest', () => {
    const end = fv({ principal: 0, rate: 3.75, years: 8, add: 250 });
    const startV = fv({ principal: 0, rate: 3.75, years: 8, add: 250, timing: 'start' });
    expect(startV).toBeCloseTo(end * (1 + 0.0375 / 12), 1);
  });
  it('0% interest just sums deposits', () => {
    const r = run({ principal: 1000, rate: 0, years: 2, add: 50 });
    expect(r.outputs.fv).toBe(2200);
    expect(r.outputs.interest).toBe(0);
    expect(r.outputs.double).toBeNull();
  });
  it('doubling time at 7.2% annual ≈ 10.2 years (rule of 72 says 10)', () =>
    expect(run({ principal: 1, rate: 7.2, comp: 'annual' }).outputs.double as number).toBeCloseTo(
      9.97,
      1,
    ));
  it('contributions + interest = balance', () => {
    const r = run({ principal: 10000, rate: 5, years: 10, add: 100 });
    expect((r.outputs.contrib as number) + (r.outputs.interest as number)).toBeCloseTo(
      r.outputs.fv as number,
      1,
    );
    expect(r.outputs.contrib).toBe(22000);
  });
  it('nothing invested gives a warning', () =>
    expect(run({ principal: 0, add: 0 }).warnings[0]?.key).toBe('warn.nothing'));
  it('100 years at 100% stays finite', () =>
    expect(Number.isFinite(fv({ principal: 1, rate: 100, years: 100, comp: 'annual' }))).toBe(
      true,
    ));
});

describe('compound interest: invariants', () => {
  it('more frequent compounding never earns less', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.1, max: 25, noNaN: true }),
        fc.integer({ min: 1, max: 40 }),
        (rate, years) => {
          const vals = ['annual', 'semiannual', 'quarterly', 'monthly', 'daily', 'continuous'].map(
            (comp) => fv({ principal: 1000, rate, years, comp }),
          );
          for (let k = 1; k < vals.length; k++)
            expect(vals[k]!).toBeGreaterThanOrEqual(vals[k - 1]! - 0.01);
        },
      ),
      { numRuns: 50 },
    );
  });
});

describe('compound interest: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run({ ...e.inputs });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
