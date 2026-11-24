import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { content } from './content.en';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, {
    today: '2026-11-24',
    fmt: makeFmt('en'),
    t: (k) => content.ui[k] ?? k,
  });
const hms = (h: number, min = 0, sec = 0) => ({ h, min, sec });

describe('speed-distance-time: references', () => {
  it('OpenStax College Physics 2e §2.3: 6 km in 30 min = 12 km/h', () =>
    expect(run({ find: 'speed', distance: 6, distUnit: 'km', ...hms(0, 30) }).outputs.kmh).toBe(
      12,
    ));
  it('§2.3: 4 m in 5 s = 0.8 m/s', () =>
    expect(run({ find: 'speed', distance: 4, distUnit: 'm', ...hms(0, 0, 5) }).outputs.ms).toBe(
      0.8,
    ));
  it('§2.3 Check Your Understanding: 80 mi in 105 min ≈ 20 m/s (exact 20.4361…, Python)', () => {
    const ms = run({ find: 'speed', distance: 80, distUnit: 'mi', ...hms(1, 45) }).outputs
      .ms as number;
    expect(ms).toBe(20.4361142857);
    expect(Math.round(ms / 10) * 10).toBe(20);
  });
  it('OpenStax Elementary Algebra 2e Ex 3.48: 60 mph × 4 h = 240 mi; 48 mph × 5 h = 240 mi', () => {
    expect(
      run({ find: 'distance', speed: 60, speedUnit: 'mph', ...hms(4), distUnit: 'mi' }).outputs.mi,
    ).toBe(240);
    expect(
      run({ find: 'distance', speed: 48, speedUnit: 'mph', ...hms(5), distUnit: 'mi' }).outputs.mi,
    ).toBe(240);
  });
  it('Ex 3.50: 325 mi at a combined 130 mph → 2.5 h', () =>
    expect(
      run({ find: 'time', distance: 325, distUnit: 'mi', speed: 130, speedUnit: 'mph' }).outputs
        .hours,
    ).toBe(2.5));
  it('Ex 3.52: 80 mi at 40 mph → 2:00:00', () =>
    expect(
      run({ find: 'time', distance: 80, distUnit: 'mi', speed: 40, speedUnit: 'mph' }).outputs
        .result,
    ).toBe('2:00:00'));
});

describe('speed-distance-time: behaviour', () => {
  it('NIST SP 811: 60 mph = 96.56064 km/h = 26.8224 m/s', () => {
    const r = run({ find: 'speed', distance: 60, distUnit: 'mi', ...hms(1) }).outputs;
    expect([r.kmh, r.ms]).toEqual([96.56064, 26.8224]);
  });
  it('mixed units: 100 km at 62.137 mph takes about an hour', () =>
    expect(
      run({ find: 'time', distance: 100, distUnit: 'km', speed: 62.1371192237, speedUnit: 'mph' })
        .outputs.result,
    ).toBe('1:00:00'));
  it('zero time or speed is rejected', () => {
    expect(run({ find: 'speed', ...hms(0) }).warnings[0]?.key).toBe('warn.time');
    expect(run({ find: 'time', speed: 0 }).warnings[0]?.key).toBe('warn.speed');
  });
});

describe('speed-distance-time: properties', () => {
  it('distance from (speed, time) then time from (distance, speed) round-trips', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 0.01, max: 1000, noNaN: true }),
        fc.integer({ min: 1, max: 100000 }),
        (speed, secs) => {
          const km = run({ find: 'distance', speed, speedUnit: 'kmh', ...hms(0, 0, secs) }).outputs
            .km as number;
          const h = run({ find: 'time', distance: km, distUnit: 'km', speed, speedUnit: 'kmh' })
            .outputs.hours as number;
          return Math.abs(h * 3600 - secs) <= 1e-8 * secs;
        },
      ),
    ));
});

describe('speed-distance-time: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run(e.inputs);
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
