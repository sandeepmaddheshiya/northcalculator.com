import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { fill } from '@/lib/fill';
import { compute } from './compute';
import { content } from './content.en';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (start: string, end: string, nextDay = false) =>
  compute({ ...base, start, end, nextDay } as never, {
    today: '2026-11-24',
    fmt: makeFmt('en'),
    t: (k, v) => fill(content.ui[k] ?? k, v ?? {}),
  });

describe('time-duration: references (OpenStax Prealgebra 2e Table 7.2; BIPM Table 8)', () => {
  it('1 h = 60 min: 09:00 → 10:00 is 60 minutes, 3,600 seconds', () => {
    const r = run('09:00', '10:00');
    expect([r.outputs.minutes, r.outputs.seconds]).toEqual([60, 3600]);
  });
  it('1 d = 24 h: same time on the next day is 1,440 minutes (86,400 s)', () =>
    expect(run('08:00', '08:00', true).outputs.seconds).toBe(86400));
});

describe('time-duration: behaviour', () => {
  it('09:15 → 17:40 = 8 h 25 min = 8.4167 h', () => {
    const r = run('09:15', '17:40');
    expect([r.outputs.hm, r.outputs.hours]).toEqual(['8 h 25 min', 8.4167]);
  });
  it('overnight wraps: 23:00 → 07:00 = 8 h', () =>
    expect(run('23:00', '07:00').outputs.hm).toBe('8 h'));
  it('FAQ: 10:45 → 15:20 = 4 h 35 min; 21:30 → 05:15 = 7 h 45 min; 08:20 → 11:05 = 165 min', () => {
    expect(run('10:45', '15:20').outputs.hm).toBe('4 h 35 min');
    expect(run('21:30', '05:15').outputs.hm).toBe('7 h 45 min');
    expect(run('08:20', '11:05').outputs.minutes).toBe(165);
  });
  it('next-day option adds 24 hours to a later end time', () =>
    expect(run('09:00', '10:00', true).outputs.hm).toBe('25 h'));
  it('equal times without the option are zero', () =>
    expect(run('12:00', '12:00').outputs.hm).toBe('0 min'));
  it('invalid times give no result', () => expect(run('25:00', '10:00').outputs.hm).toBeNull());
});

describe('time-duration: properties', () => {
  const clock = fc
    .tuple(fc.integer({ min: 0, max: 23 }), fc.integer({ min: 0, max: 59 }))
    .map(([h, m]) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  it('A → B plus B → A is 24 hours (or 0 when equal)', () =>
    fc.assert(
      fc.property(clock, clock, (a, b) => {
        const x = (run(a, b).outputs.minutes as number) + (run(b, a).outputs.minutes as number);
        return a === b ? x === 0 : x === 1440;
      }),
    ));
});

describe('time-duration: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run(String(e.inputs.start), String(e.inputs.end));
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
