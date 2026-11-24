import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { formatISODate, fromDayNumber, isoWeekday, toDayNumber } from '@/engine/dates';
import { compute } from './compute';
import { US_2026, definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-24', fmt: makeFmt('en') });
const US_2025 =
  '2025-01-01 2025-01-20 2025-02-17 2025-05-26 2025-06-19 2025-07-04 2025-09-01 2025-10-13 2025-11-11 2025-11-27 2025-12-25';

describe('business-days: references (OPM federal holidays; counts verified with Python datetime)', () => {
  it('2026: 261 weekdays − 11 observed federal holidays = 250', () => {
    const r = run({ start: '2026-01-01', end: '2026-12-31', holidays: US_2026 });
    expect(r.outputs.result).toBe(250);
    expect(r.outputs.weekendDays).toBe(104);
    expect(r.outputs.holidaysOff).toBe(11);
  });
  it('2025: 261 weekdays, 250 working days', () => {
    expect(run({ start: '2025-01-01', end: '2025-12-31', holidays: '' }).outputs.result).toBe(261);
    expect(run({ start: '2025-01-01', end: '2025-12-31', holidays: US_2025 }).outputs.result).toBe(
      250,
    );
  });
  it('Python docs: 2002-12-04 is a Wednesday, so Mon 2–Wed 4 Dec is 3 days', () =>
    expect(run({ start: '2002-12-02', end: '2002-12-04', holidays: '' }).outputs.result).toBe(3));
});

describe('business-days: behaviour', () => {
  it('10 business days after Fri 2026-11-20, skipping Thanksgiving, is Mon 2026-12-07', () => {
    const r = run({ mode: 'add', start: '2026-11-20', days: 10, holidays: US_2026 });
    expect(r.outputs.result).toBe('2026-12-07');
    expect(r.outputs.calendar).toBe(17);
  });
  it('negative days count backwards: −5 from Fri 2026-12-11 is Fri 2026-12-04', () =>
    expect(run({ mode: 'add', start: '2026-12-11', days: -5, holidays: '' }).outputs.result).toBe(
      '2026-12-04',
    ));
  it('0 days rolls a weekend start forward to Monday', () =>
    expect(run({ mode: 'add', start: '2026-11-21', days: 0, holidays: '' }).outputs.result).toBe(
      '2026-11-23',
    ));
  it('Friday–Saturday weekend: March 2026 has 23 working days', () =>
    expect(
      run({ start: '2026-03-01', end: '2026-03-31', weekend: 'friSat', holidays: '' }).outputs
        .result,
    ).toBe(23));
  it('a holiday on a weekend is not subtracted twice', () =>
    expect(
      run({ start: '2026-07-01', end: '2026-07-10', holidays: '2026-07-04' }).outputs.result,
    ).toBe(8));
  it('reversed dates are swapped and flagged', () => {
    const r = run({ start: '2026-01-31', end: '2026-01-01', holidays: '' });
    expect(r.outputs.result).toBe(22);
    expect(r.warnings.some((w) => w.key === 'warn.swapped')).toBe(true);
  });
  it('bad holiday entries are reported', () =>
    expect(run({ holidays: '2026-01-01, 13/01/2026' }).warnings[0]?.values?.n).toBe(1));
  it('no weekend counts every day', () =>
    expect(
      run({ start: '2026-01-01', end: '2026-01-31', weekend: 'none', holidays: '' }).outputs.result,
    ).toBe(31));
});

describe('business-days: properties', () => {
  const dn = fc.integer({
    min: toDayNumber({ y: 2000, m: 1, d: 1 }),
    max: toDayNumber({ y: 2040, m: 12, d: 31 }),
  });
  it('adding n working days then counting the range gives n + 1 (both ends counted)', () =>
    fc.assert(
      fc.property(dn, fc.integer({ min: 1, max: 400 }), (s, n) => {
        let start = s;
        while (isoWeekday(fromDayNumber(start)) >= 5) start++;
        const iso = formatISODate(fromDayNumber(start));
        const end = run({ mode: 'add', start: iso, days: n, holidays: '' }).outputs
          .result as string;
        return run({ start: iso, end, holidays: '' }).outputs.result === n + 1;
      }),
    ));
  it('working + weekend + holiday days = calendar days', () =>
    fc.assert(
      fc.property(dn, fc.integer({ min: 0, max: 2000 }), (s, len) => {
        const r = run({
          start: formatISODate(fromDayNumber(s)),
          end: formatISODate(fromDayNumber(s + len)),
          holidays: US_2026,
        }).outputs;
        return (
          (r.result as number) + (r.weekendDays as number) + (r.holidaysOff as number) ===
          r.calendar
        );
      }),
    ));
});

describe('business-days: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run({ ...e.inputs });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
