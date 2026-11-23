import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { fill } from '@/lib/fill';
import { compute, weekdayOf } from './compute';
import { definition } from './definition';
import { content } from './content.en';
import fixture from '@/engine/dates.dateutil.fixture.json';

const ctx = {
  today: '2026-11-24',
  fmt: makeFmt('en'),
  t: (k: string, v?: Record<string, string | number>) => fill(content.ui[k] ?? k, v ?? {}),
};
const run = (inputs: Record<string, unknown>) =>
  compute({ asOf: '2026-11-24', rule: 'feb28', ...inputs } as never, ctx);

describe('age: independent reference (Python dateutil.relativedelta + date arithmetic, 45 cases)', () => {
  it.each(fixture.map((c) => [`${c.dob} → ${c.asOf}`, c] as const))('%s', (_label, c) => {
    const r = run({ dob: c.dob, asOf: c.asOf });
    const y = c.y === 1 ? '1 year' : `${c.y.toLocaleString('en')} years`;
    const m = c.m === 1 ? '1 month' : `${c.m} months`;
    const d = c.d === 1 ? '1 day' : `${c.d} days`;
    expect(r.outputs.age).toBe(`${y}, ${m}, ${d}`);
    expect(r.outputs.days).toBe(c.days);
    expect(r.outputs.months).toBe(c.y * 12 + c.m);
    expect(weekdayOf(c.dob)).toBe(c.weekday);
  });
});

describe('age: calendar rules', () => {
  it('a known weekday: 1 January 2000 was a Saturday', () =>
    expect(run({ dob: '2000-01-01' }).outputs.weekday).toBe('Saturday'));
  it('leap-day birthday with the 28 February rule', () => {
    expect(run({ dob: '2000-02-29', asOf: '2025-02-28' }).outputs.age).toBe(
      '25 years, 0 months, 0 days',
    );
    expect(run({ dob: '2000-02-29', asOf: '2025-02-27' }).outputs.age).toBe(
      '24 years, 11 months, 29 days',
    );
  });
  it('leap-day birthday with the 1 March rule', () => {
    expect(run({ dob: '2000-02-29', asOf: '2025-02-28', rule: 'mar1' }).outputs.age).toBe(
      '24 years, 11 months, 30 days',
    );
    expect(run({ dob: '2000-02-29', asOf: '2025-03-01', rule: 'mar1' }).outputs.age).toBe(
      '25 years, 0 months, 0 days',
    );
  });
  it('1900 was not a leap year, 2000 was', () => {
    expect(run({ dob: '1900-02-28', asOf: '1900-03-01' }).outputs.days).toBe(1);
    expect(run({ dob: '2000-02-28', asOf: '2000-03-01' }).outputs.days).toBe(2);
  });
  it('born today is 0 days old', () =>
    expect(run({ dob: '2026-11-24' }).outputs.age).toBe('0 years, 0 months, 0 days'));
  it('a birth date after the as-of date is rejected', () =>
    expect(run({ dob: '2027-01-01' }).warnings[0]?.key).toBe('warn.future'));
  it('next birthday and days until it', () => {
    const r = run({ dob: '1990-12-25' });
    expect(r.outputs.next).toBe('2026-12-25');
    expect(r.outputs.until).toBe(31);
  });
  it('on the birthday itself, the next birthday is a year away', () => {
    const r = run({ dob: '1990-11-24' });
    expect(r.outputs.next).toBe('2027-11-24');
    expect(r.outputs.until).toBe(365);
    expect(r.explain?.key).toBe('explain.birthday');
  });
  it('weeks and days', () =>
    expect(run({ dob: '2026-11-01' }).outputs.weeks).toBe('3 weeks and 2 days'));
});

describe('age: invariants', () => {
  it('total days = days between dates for any pair', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 80000 }),
        fc.integer({ min: 0, max: 40000 }),
        (a, span) => {
          const d0 = new Date(Date.UTC(1850, 0, 1) + a * 864e5);
          const d1 = new Date(d0.getTime() + span * 864e5);
          const iso = (d: Date) => d.toISOString().slice(0, 10);
          expect(run({ dob: iso(d0), asOf: iso(d1) }).outputs.days).toBe(span);
        },
      ),
      { numRuns: 200 },
    );
  });
});

describe('age: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run({ ...e.inputs });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
