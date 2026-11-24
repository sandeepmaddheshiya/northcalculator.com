import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (inputs: Record<string, unknown>, cur = 'USD') =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-24', fmt: makeFmt('en', cur) });

describe('savings-goal: references (OpenStax Contemporary Mathematics §6.6–6.7)', () => {
  it('Ex 6.73: $37,500 in 10 years at 12% (yearly) → $2,136.91', () =>
    expect(run({ goal: 37500, years: 10, rate: 12, freq: '1' }).outputs.payment).toBe(2136.91));
  it('Ex 6.68 inverted: $34,595.88 in 5 years at 11.62% quarterly → $1,300.00', () =>
    expect(run({ goal: 34595.88, years: 5, rate: 11.62, freq: '4' }).outputs.payment).toBe(1300));
  it('Ex 6.69 as printed ($6,689.49) uses a wrong denominator; the exact payment is $3,799.19 (Python decimal, ADR-022)', () =>
    expect(run({ goal: 1500000, years: 35, rate: 11.62, freq: '1' }).outputs.payment).toBe(
      3799.19,
    ));
});

describe('savings-goal: behaviour', () => {
  it('existing savings reduce the deposit: $60,000, 5 y, 4% monthly, $10,000 saved → $720.83', () =>
    expect(run({ goal: 60000, years: 5, rate: 4, freq: '12', start: 10000 }).outputs.payment).toBe(
      720.83,
    ));
  it('with nothing saved → $904.99', () =>
    expect(run({ goal: 60000, years: 5, rate: 4, freq: '12' }).outputs.payment).toBe(904.99));
  it('FAQ: $20,000 in 3 years at 3.5% monthly → $527.71', () =>
    expect(run({ goal: 20000, years: 3, rate: 3.5, freq: '12' }).outputs.payment).toBe(527.71));
  it('0% interest is a straight division', () =>
    expect(run({ goal: 20000, years: 3, rate: 0, freq: '12' }).outputs.payment).toBe(555.56));
  it('start-of-period deposits are smaller by (1 + i)', () => {
    const end = run({ goal: 60000, years: 5, rate: 4, freq: '12' }).outputs.payment as number;
    const begin = run({ goal: 60000, years: 5, rate: 4, freq: '12', timing: 'begin' }).outputs
      .payment as number;
    expect(begin).toBeCloseTo(end / (1 + 0.04 / 12), 1);
  });
  it('savings that already reach the goal need no deposits', () => {
    const r = run({ goal: 1000, years: 10, rate: 5, start: 1000 });
    expect(r.outputs.payment).toBe(0);
    expect(r.warnings[0]?.key).toBe('warn.reached');
  });
  it('totals split deposits and interest', () => {
    const r = run({ goal: 37500, years: 10, rate: 12, freq: '1' });
    expect(r.outputs.contributed).toBe(21369.1);
    expect(r.outputs.interest).toBe(16130.9);
  });
  it('zero-decimal currencies (JPY)', () =>
    expect(run({ goal: 1000000, years: 2, rate: 0, freq: '12' }, 'JPY').outputs.payment).toBe(
      41667,
    ));
});

describe('savings-goal: properties', () => {
  it('saving the computed deposit reaches the goal (within rounding)', () =>
    fc.assert(
      fc.property(
        fc.integer({ min: 1000, max: 1e6 }),
        fc.integer({ min: 1, max: 40 }),
        fc.integer({ min: 0, max: 15 }),
        fc.constantFrom('1', '4', '12'),
        (goal, years, rate, freq) => {
          const p = run({ goal, years, rate, freq }).outputs.payment as number;
          const n = Number(freq);
          const i = rate / 100 / n;
          const N = years * n;
          const fv = i === 0 ? p * N : (p * ((1 + i) ** N - 1)) / i;
          return Math.abs(fv - goal) <= 0.005 * N * (1 + i) ** N + 1e-6;
        },
      ),
    ));
});

describe('savings-goal: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run({ ...e.inputs });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
