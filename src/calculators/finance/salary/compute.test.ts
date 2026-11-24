import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (inputs: Record<string, unknown>, cur = 'USD') =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-24', fmt: makeFmt('en', cur) });
const opm = (amount: number) =>
  run({ amount, per: 'year', hours: 40, weeks: 52.175 }).outputs.result;

describe('salary: references (OPM 2,087-hour divisor)', () => {
  it('OPM fact sheet: $89,033 ÷ 2,087 = $42.66', () => expect(opm(89033)).toBe(42.66));
  it('OPM 2024 GS table: GS-11 step 1, $62,107 → $29.76', () => expect(opm(62107)).toBe(29.76));
  it('OPM 2024 GS table: GS-13 step 1, $88,520 → $42.41', () => expect(opm(88520)).toBe(42.41));
});

describe('salary: behaviour', () => {
  it('$25 an hour, 40 h × 52 weeks = $52,000, $4,333.33 a month', () => {
    const r = run({ amount: 25, per: 'hour' });
    expect(r.outputs.result).toBe(52000);
    expect(r.outputs.month).toBe(4333.33);
    expect(r.outputs.week).toBe(1000);
    expect(r.outputs.biweek).toBe(2000);
    expect(r.outputs.semimonth).toBe(2166.67);
    expect(r.outputs.day).toBe(200);
  });
  it('salary to hourly: $60,000 → $28.85', () =>
    expect(run({ amount: 60000, per: 'year' }).outputs.result).toBe(28.85));
  it('monthly to annual and hourly', () => {
    const r = run({ amount: 4500, per: 'month' });
    expect(r.outputs.result).toBe(54000);
    expect(r.outputs.hour).toBe(25.96);
    expect(r.outputs.month).toBeNull(); // the period you entered is not repeated
  });
  it('fewer paid weeks lower the annual figure', () =>
    expect(run({ amount: 20, per: 'hour', weeks: 50 }).outputs.result).toBe(40000));
  it('part time: 37.5 hours', () =>
    expect(run({ amount: 20, per: 'hour', hours: 37.5 }).outputs.result).toBe(39000));
  it('zero-decimal currencies (JPY)', () =>
    expect(run({ amount: 5000000, per: 'year' }, 'JPY').outputs.result).toBe(2404));
  it('long weeks are flagged; impossible weeks warn', () => {
    expect(run({ hours: 70 }).warnings[0]?.key).toBe('warn.hours');
    expect(run({ hours: 130, days: 5 }).warnings.some((w) => w.key === 'warn.days')).toBe(true);
  });
  it('the amount is sensitive and stays out of history', () =>
    expect(definition.inputs.find((i) => i.id === 'amount')?.sensitive).toBe(true));
  it('missing input gives no result', () =>
    expect(run({ amount: null }).outputs.result).toBeNull());
});

describe('salary: properties', () => {
  it('converting hourly → annual → hourly returns the rate to the cent', () =>
    fc.assert(
      fc.property(
        fc.integer({ min: 100, max: 100000 }),
        fc.integer({ min: 10, max: 60 }),
        (cents, hours) => {
          const rate = cents / 100;
          const annual = run({ amount: rate, per: 'hour', hours }).outputs.result as number;
          const back = run({ amount: annual, per: 'year', hours }).outputs.result as number;
          return Math.abs(back - rate) < 0.006;
        },
      ),
    ));
  it('every period × its count is the annual figure within rounding', () =>
    fc.assert(
      fc.property(fc.integer({ min: 1000, max: 10_000_000 }), (annual) => {
        const r = run({ amount: annual, per: 'year' }).outputs;
        return Math.abs((r.month as number) * 12 - annual) <= 0.06;
      }),
    ));
});

describe('salary: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run({ ...e.inputs });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
