import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute, offsetMinutes, wallToUtc } from './compute';
import { definition } from './definition';
import { ZONES } from './zones';

const base = defaultValues(definition, '2026-11-24');
const run = (date: string, time: string, from: string, to: string) =>
  compute({ ...base, date, time, from, to } as never, { today: '2026-11-24', fmt: makeFmt('en') });

describe('time-zone: references', () => {
  it('NIST: US DST 2026 starts Sun 8 Mar at 2:00 (second Sunday) and ends Sun 1 Nov (first Sunday)', () => {
    expect(offsetMinutes(Date.UTC(2026, 2, 8, 6, 59), 'America/New_York')).toBe(-300); // 01:59 EST
    expect(offsetMinutes(Date.UTC(2026, 2, 8, 7, 0), 'America/New_York')).toBe(-240); // 03:00 EDT
    expect(offsetMinutes(Date.UTC(2026, 10, 1, 5, 59), 'America/New_York')).toBe(-240);
    expect(offsetMinutes(Date.UTC(2026, 10, 1, 6, 0), 'America/New_York')).toBe(-300);
  });
  it('NIST: Hawaii and Arizona do not observe DST', () => {
    for (const z of ['Pacific/Honolulu', 'America/Phoenix'])
      expect(offsetMinutes(Date.UTC(2026, 0, 15), z)).toBe(offsetMinutes(Date.UTC(2026, 6, 15), z));
  });
  it('IANA tz: India is UTC+05:30 and Nepal UTC+05:45', () => {
    expect(offsetMinutes(Date.UTC(2026, 6, 1), 'Asia/Kolkata')).toBe(330);
    expect(offsetMinutes(Date.UTC(2026, 6, 1), 'Asia/Kathmandu')).toBe(345);
  });
});

describe('time-zone: behaviour', () => {
  it('New York → London in January: +5 h', () => {
    const r = run('2026-01-15', '09:00', 'America/New_York', 'Europe/London');
    expect([r.outputs.diff, r.outputs.utc]).toEqual(['+5 h', '2026-01-15 14:00']);
  });
  it('India → Los Angeles in July: −12 h 30 min', () =>
    expect(run('2026-07-01', '10:00', 'Asia/Kolkata', 'America/Los_Angeles').outputs.utc).toBe(
      '2026-07-01 04:30',
    ));
  it('US and EU switch on different dates: New York–London is 4 h on 20 March 2026', () =>
    expect(run('2026-03-20', '09:00', 'America/New_York', 'Europe/London').outputs.diff).toBe(
      '+4 h',
    ));
  it('spring-forward gap is flagged', () =>
    expect(run('2026-03-08', '02:30', 'America/New_York', 'UTC').warnings[0]?.key).toBe(
      'warn.gap',
    ));
  it('fall-back repeat is flagged and uses the first occurrence', () => {
    const r = run('2026-11-01', '01:30', 'America/New_York', 'UTC');
    expect(r.warnings[0]?.key).toBe('warn.repeat');
    expect(r.outputs.utc).toBe('2026-11-01 05:30');
  });
  it('crossing the date line changes the date', () =>
    expect(run('2026-07-01', '20:00', 'America/Los_Angeles', 'Asia/Tokyo').outputs.utc).toBe(
      '2026-07-02 03:00',
    ));
  it('every listed zone is valid', () => {
    for (const [id] of ZONES) expect(() => offsetMinutes(Date.UTC(2026, 0, 1), id)).not.toThrow();
  });
  it('invalid input gives no result', () =>
    expect(run('2026-02-30', '09:00', 'UTC', 'UTC').outputs.result).toBeNull());
});

describe('time-zone: properties', () => {
  const zone = fc.constantFrom(...ZONES.map(([id]) => id));
  it('converting to UTC and back gives the original wall time (outside DST gaps)', () =>
    fc.assert(
      fc.property(
        zone,
        fc.integer({ min: 0, max: 364 }),
        fc.integer({ min: 0, max: 1439 }),
        (z, dayIdx, minute) => {
          const date = new Date(Date.UTC(2026, 0, 1 + dayIdx)).toISOString().slice(0, 10);
          const time = `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
          const conv = wallToUtc(date, time, z)!;
          if (conv.status === 'gap') return true;
          const back = new Date(conv.utc + offsetMinutes(conv.utc, z) * 60000).toISOString();
          return back.slice(0, 10) === date && back.slice(11, 16) === time;
        },
      ),
    ));
});

describe('time-zone: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = compute({ ...base, ...e.inputs } as never, {
      today: '2026-11-24',
      fmt: makeFmt('en'),
    });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
