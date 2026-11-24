import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { fill } from '@/lib/fill';
import { formatISODate, fromDayNumber, toDayNumber } from '@/engine/dates';
import { compute } from './compute';
import { content } from './content.en';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (from: string, target: string) =>
  compute({ ...base, from, target } as never, {
    today: '2026-11-24',
    fmt: makeFmt('en'),
    t: (k, v) => fill(content.ui[k] ?? k, v ?? {}),
  });

describe('days-until: references', () => {
  it('Python docs: 2007-12-05 → 2008-06-24 is 202 days', () =>
    expect(run('2007-12-05', '2008-06-24').outputs.days).toBe(202));
  it('Python docs: date.fromordinal(730920) is 2002-03-11 (day numbers agree with Python ordinals)', () =>
    expect(toDayNumber({ y: 2002, m: 3, d: 11 }) - toDayNumber({ y: 1, m: 1, d: 1 }) + 1).toBe(
      730920,
    ));
  it('USNO leap rule: 2000 was a leap year, 2100 is not', () => {
    expect(run('2000-02-28', '2000-03-01').outputs.days).toBe(2);
    expect(run('2100-02-28', '2100-03-01').outputs.days).toBe(1);
  });
});

describe('days-until: behaviour', () => {
  it('weeks and days', () =>
    expect(run('2007-12-05', '2008-06-24').outputs.weeks).toBe('28 weeks, 6 days'));
  it('New Year 2027: 38 days, 28 weekdays', () => {
    const r = run('2026-11-24', '2027-01-01');
    expect(r.outputs.days).toBe(38);
    expect(r.outputs.weekdays).toBe(28);
    expect(r.outputs.weekendsLeft).toBe(10);
  });
  it('Christmas from 24 November: 31 days', () =>
    expect(run('2026-11-24', '2026-12-25').outputs.days).toBe(31));
  it('past dates count days since, with years/months/days', () => {
    const r = run('2026-11-24', '2000-01-01');
    expect(r.outputs.days).toBe(9824);
    expect(r.outputs.ymd).toBe('26 years, 10 months, 23 days');
    expect(r.explain?.key).toBe('explain.since');
  });
  it('tomorrow is 1 day; today is 0', () => {
    expect(run('2026-11-24', '2026-11-25').outputs.days).toBe(1);
    expect(run('2026-11-24', '2026-11-24').explain?.key).toBe('explain.today');
  });
  it('singular forms', () =>
    expect(run('2026-11-24', '2026-12-02').outputs.weeks).toBe('1 week, 1 day'));
  it('invalid dates give no result', () =>
    expect(run('2026-02-30', '2026-03-01').outputs.days).toBeNull());
});

describe('days-until: properties', () => {
  const dn = fc.integer({
    min: toDayNumber({ y: 1900, m: 1, d: 1 }),
    max: toDayNumber({ y: 2200, m: 1, d: 1 }),
  });
  it('the count is the day-number difference and is symmetric', () =>
    fc.assert(
      fc.property(dn, dn, (a, b) => {
        const x = formatISODate(fromDayNumber(a));
        const y = formatISODate(fromDayNumber(b));
        return (
          run(x, y).outputs.days === Math.abs(b - a) && run(y, x).outputs.days === Math.abs(b - a)
        );
      }),
    ));
});

describe('days-until: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run(String(e.inputs.from), String(e.inputs.target));
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
