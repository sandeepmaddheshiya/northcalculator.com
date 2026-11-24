import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { formatISODate, fromDayNumber, toDayNumber } from '@/engine/dates';
import { compute } from './compute';
import { definition } from './definition';
import fixture from './isoweeks.fixture.json';

const base = defaultValues(definition, '2026-11-24');
const run = (date: string, system = 'iso') =>
  compute({ ...base, date, system } as never, { today: '2026-11-24', fmt: makeFmt('en') });

describe('week-number: references', () => {
  it('Python docs: 2003-12-29 and 2004-01-04 are in ISO week 1 of 2004', () => {
    for (const d of ['2003-12-29', '2004-01-04']) {
      expect(run(d).outputs.week).toBe(1);
      expect(run(d).outputs.weekYear).toBe('2004');
    }
    expect(run('2003-12-29').outputs.start).toBe('2003-12-29');
    expect(run('2004-01-04').outputs.end).toBe('2004-01-04');
  });
  it('Python docs: 2002-03-11 is ISO week 11', () =>
    expect(run('2002-03-11').outputs.week).toBe(11));
  it('Microsoft WEEKNUM: 3/9/2012 is week 10 (system 1, Sunday)', () =>
    expect(run('2012-03-09', 'us').outputs.week).toBe(10));
  it('Python isocalendar fixture (400 dates)', () => {
    for (const [d, y, w] of fixture as [string, number, number][]) {
      const r = run(d);
      expect([r.outputs.weekYear, r.outputs.week], d).toEqual([String(y), w]);
    }
  });
});

describe('week-number: behaviour', () => {
  it('2027-01-01 is 2026-W53 and flagged', () => {
    const r = run('2027-01-01');
    expect(r.outputs.week).toBe(53);
    expect(r.warnings[0]?.key).toBe('warn.otherYear');
  });
  it('weeks in the ISO year: 2026 has 53, 2025 has 52', () => {
    expect(run('2026-06-01').outputs.weeks).toBe(53);
    expect(run('2025-06-01').outputs.weeks).toBe(52);
  });
  it('US week 1 contains Jan 1 and is clipped to the year', () => {
    const r = run('2026-01-01', 'us'); // Thursday
    expect(r.outputs.week).toBe(1);
    expect(r.outputs.start).toBe('2026-01-01');
    expect(r.outputs.end).toBe('2026-01-03');
  });
  it('US: a leap year starting on Saturday has 54 weeks (2000)', () =>
    expect(run('2000-12-31', 'us').outputs.week).toBe(54));
  it('day of the year', () => expect(run('2024-12-31').outputs.dayOfYear).toBe(366));
  it('an invalid date gives no result', () => expect(run('2026-02-30').outputs.week).toBeNull());
});

describe('week-number: properties', () => {
  const day = fc.integer({
    min: toDayNumber({ y: 1900, m: 1, d: 1 }),
    max: toDayNumber({ y: 2200, m: 12, d: 31 }),
  });
  it('ISO weeks have exactly seven days, Monday to Sunday', () =>
    fc.assert(
      fc.property(day, (n) => {
        const r = run(formatISODate(fromDayNumber(n))).outputs;
        return (
          toDayNumber(fromDayNumber(n)) >=
            toDayNumber(fromDayNumber(toDayNumber(parse(r.start)))) &&
          toDayNumber(parse(r.end)) - toDayNumber(parse(r.start)) === 6
        );
      }),
    ));
  it('consecutive days never go backwards within a US year', () =>
    fc.assert(
      fc.property(day, (n) => {
        const a = fromDayNumber(n);
        const b = fromDayNumber(n + 1);
        if (a.y !== b.y) return true;
        return (
          (run(formatISODate(b), 'us').outputs.week as number) -
            (run(formatISODate(a), 'us').outputs.week as number) <=
          1
        );
      }),
    ));
});

function parse(v: unknown) {
  const [y, m, d] = String(v).split('-').map(Number);
  return { y: y!, m: m!, d: d! };
}

describe('week-number: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = compute({ ...base, ...e.inputs } as never, {
      today: '2026-11-24',
      fmt: makeFmt('en'),
    });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
