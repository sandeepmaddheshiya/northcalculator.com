import { describe, expect, it } from 'vitest';
import { makeFmt } from '@/calculators/fmt';
import { compute } from './compute';
import { definition } from './definition';
import fixture from '@/engine/dates.calendar.fixture.json';

const ctx = { today: '2026-11-24', fmt: makeFmt('en') };
const run = (inputs: Record<string, unknown>) =>
  compute(
    {
      start: '2026-11-24',
      op: 'add',
      years: 0,
      months: 0,
      weeks: 0,
      days: 0,
      business: false,
      ...inputs,
    } as never,
    ctx,
  );

describe('date calculator: Python dateutil.relativedelta reference (30 random cases)', () => {
  it.each(
    fixture.add.map(
      (c) => [`${c.start} ${c.op} ${c.years}y ${c.months}m ${c.weeks}w ${c.days}d`, c] as const,
    ),
  )('%s', (_l, c) => {
    expect(
      run({
        start: c.start,
        op: c.op,
        years: c.years,
        months: c.months,
        weeks: c.weeks,
        days: c.days,
      }).outputs.result,
    ).toBe(c.result);
  });
});

describe('date calculator: behaviour', () => {
  it('90 days after 24 Nov 2026 is 22 Feb 2027, a Monday', () => {
    const r = run({ days: 90 });
    expect(r.outputs.result).toBe('2027-02-22');
    expect(r.outputs.weekday).toBe('Monday');
  });
  it('month ends clamp: 31 Jan + 1 month = 28 Feb (29 in a leap year)', () => {
    expect(run({ start: '2026-01-31', months: 1 }).outputs.result).toBe('2026-02-28');
    expect(run({ start: '2028-01-31', months: 1 }).outputs.result).toBe('2028-02-29');
    expect(run({ start: '2026-01-31', months: 1 }).warnings[0]?.key).toBe('warn.clamped');
  });
  it('business days skip weekends (Python loop reference)', () => {
    expect(run({ days: 10, business: true }).outputs.result).toBe('2026-12-08');
    expect(run({ start: '2026-11-27', days: 1, business: true }).outputs.result).toBe('2026-11-30'); // Friday + 1 → Monday
    expect(run({ start: '2026-11-30', days: 1, business: true, op: 'sub' }).outputs.result).toBe(
      '2026-11-27',
    );
  });
  it('ISO week of the result', () =>
    expect(run({ start: '2026-12-31', days: 1 }).outputs.isoWeek).toBe('2026-W53'));
  it('adding nothing returns the start date', () =>
    expect(run({}).outputs.result).toBe('2026-11-24'));
  it('subtraction crosses year boundaries', () =>
    expect(run({ op: 'sub', days: 366 }).outputs.result).toBe('2025-11-23'));
  it('invalid start gives no result', () =>
    expect(run({ start: '2026-02-30' }).outputs.result).toBeNull());
});

describe('date calculator: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run({ ...e.inputs });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
