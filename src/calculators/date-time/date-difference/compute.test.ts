import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { fill } from '@/lib/fill';
import { compute } from './compute';
import { definition } from './definition';
import { content } from './content.en';
import fixture from '@/engine/dates.calendar.fixture.json';

const ctx = {
  today: '2026-11-24',
  fmt: makeFmt('en'),
  t: (k: string, v?: Record<string, string | number>) => fill(content.ui[k] ?? k, v ?? {}),
};
const run = (inputs: Record<string, unknown>) =>
  compute({ inclusive: false, ...inputs } as never, ctx);

describe('days between dates: Python datetime reference (30 random spans)', () => {
  it.each(fixture.diff.map((c) => [`${c.start} → ${c.end}`, c] as const))('%s', (_l, c) => {
    const r = run({ start: c.start, end: c.end });
    expect(r.outputs.days).toBe(c.days);
    expect(r.outputs.weekdays).toBe(c.weekdays);
  });
});

describe('days between dates: calendar facts', () => {
  it('2026 has 365 days; 1 Jan → 31 Dec is 364 (end date excluded), 365 inclusive', () => {
    expect(run({ start: '2026-01-01', end: '2026-12-31' }).outputs.days).toBe(364);
    expect(run({ start: '2026-01-01', end: '2026-12-31', inclusive: true }).outputs.days).toBe(365);
  });
  it('February 2028 has 29 days, February 2100 has 28 (USNO rule)', () => {
    expect(run({ start: '2028-02-01', end: '2028-03-01' }).outputs.days).toBe(29);
    expect(run({ start: '2100-02-01', end: '2100-03-01' }).outputs.days).toBe(28);
  });
  it('a Monday-to-Monday week has 5 weekdays', () =>
    expect(run({ start: '2026-11-23', end: '2026-11-30' }).outputs.weekdays).toBe(5));
  it('reversed dates are swapped with a note', () => {
    const r = run({ start: '2026-12-31', end: '2026-01-01' });
    expect(r.outputs.days).toBe(364);
    expect(r.warnings[0]?.key).toBe('warn.swapped');
  });
  it('same day is 0 days, or 1 inclusive', () => {
    expect(run({ start: '2026-05-05', end: '2026-05-05' }).outputs.days).toBe(0);
    expect(run({ start: '2026-05-05', end: '2026-05-05', inclusive: true }).outputs.days).toBe(1);
  });
  it('weeks and years/months/days breakdown', () => {
    const r = run({ start: '2026-01-01', end: '2026-12-31' });
    expect(r.outputs.weeks).toBe('52 weeks and 0 days');
    expect(r.outputs.ymd).toBe('11 months, 30 days');
  });
});

describe('days between dates: invariants', () => {
  it('weekdays + weekend = days, and weekdays ≈ 5/7 of days', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 200000 }),
        fc.integer({ min: 0, max: 5000 }),
        (a, n) => {
          const d0 = new Date(Date.UTC(1700, 0, 1) + a * 864e5);
          const d1 = new Date(d0.getTime() + n * 864e5);
          const iso = (d: Date) => d.toISOString().slice(0, 10);
          const r = run({ start: iso(d0), end: iso(d1) });
          expect((r.outputs.weekdays as number) + (r.outputs.weekend as number)).toBe(n);
          expect(Math.abs((r.outputs.weekdays as number) - (n * 5) / 7)).toBeLessThanOrEqual(2);
        },
      ),
    );
  });
});

describe('days between dates: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run({ ...e.inputs });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
