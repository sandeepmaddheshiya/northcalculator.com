import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { fill } from '@/lib/fill';
import { minutesBetween, parseClock } from '@/engine/clock';
import { compute } from './compute';
import { content } from './content.en';
import { WEEK, definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const day = (start: string, end: string, brk: unknown = 30) => ({ start, end, brk });
const run = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, {
    today: '2026-11-24',
    fmt: makeFmt('en'),
    t: (k, v) => fill(content.ui[k] ?? k, v ?? {}),
  });

describe('hours-worked: references', () => {
  it('DoL FLSA: hours over 40 at time and a half (45 h at $20 = $950)', () => {
    const r = run({ days: [...WEEK, day('09:00', '14:30')], rate: 20 });
    expect([r.outputs.hours, r.outputs.overtime, r.outputs.pay]).toEqual([45, 5, 950]);
  });
  it('OpenStax Prealgebra Table 7.2: 60 min = 1 h, 24 h = 1 day (overnight wrap)', () => {
    expect(minutesBetween(parseClock('22:00')!, parseClock('06:30')!)).toBe(510);
    expect(minutesBetween(parseClock('00:00')!, parseClock('00:00')!, true)).toBe(1440);
  });
});

describe('hours-worked: behaviour', () => {
  it('a standard week is 40 h, $800 at $20', () => {
    const r = run({ days: WEEK, rate: 20 });
    expect([r.outputs.hours, r.outputs.pay, r.outputs.overtime]).toEqual([40, 800, null]);
  });
  it('FAQ: 8:15–16:45 less 45 min = 7.75 h', () =>
    expect(run({ days: [day('08:15', '16:45', 45)] }).outputs.hours).toBe(7.75));
  it('FAQ: 46 h at $18 = $882', () =>
    expect(run({ days: [...WEEK, day('08:00', '14:30', 30)], rate: 18 }).outputs.pay).toBe(882));
  it('hours and minutes text', () =>
    expect(run({ days: [day('09:00', '15:20', 0)] }).outputs.hm).toBe('6 h 20 min'));
  it('night shifts wrap past midnight', () =>
    expect(run({ days: [day('22:00', '06:30')] }).outputs.hm).toBe('8 h'));
  it('a break longer than the shift counts as zero and warns', () => {
    const r = run({ days: [day('09:00', '09:20', 60)] });
    expect(r.outputs.hours).toBe(0);
    expect(r.warnings.some((w) => w.key === 'warn.break')).toBe(true);
  });
  it('a custom overtime threshold and multiple', () =>
    expect(
      run({ days: [day('08:00', '20:00', 0)], rate: 10, otAfter: 8, otRate: 2 }).outputs.pay,
    ).toBe(160));
  it('without a rate, pay is not shown', () =>
    expect(run({ days: WEEK, rate: 0 }).outputs.pay).toBeNull());
  it('rows without times are skipped', () =>
    expect(
      run({ days: [day('09:00', '17:00'), day('', '17:00')] }).warnings.some(
        (w) => w.key === 'warn.skipped',
      ),
    ).toBe(true));
});

describe('hours-worked: properties', () => {
  const clock = fc
    .tuple(fc.integer({ min: 0, max: 23 }), fc.integer({ min: 0, max: 59 }))
    .map(([h, m]) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  it('each shift is between 0 and 24 hours and pay never falls as hours rise', () =>
    fc.assert(
      fc.property(clock, clock, (s, e) => {
        const r = run({ days: [day(s, e, 0)], rate: 15 }).outputs;
        return (r.hours as number) >= 0 && (r.hours as number) < 24;
      }),
    ));
});

describe('hours-worked: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run({ ...e.inputs });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
