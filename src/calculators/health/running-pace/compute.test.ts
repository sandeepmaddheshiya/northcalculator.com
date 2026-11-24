import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { fill } from '@/lib/fill';
import { clock, compute, RACES } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const ui: Record<string, string> = {
  'per.km': '/km',
  'per.mi': '/mi',
  'dist.km': '{v} km',
  'dist.mi': '{v} mi',
};
const run = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, {
    today: '2026-11-24',
    fmt: makeFmt('en'),
    t: (k, v) => fill(ui[k] ?? k, v ?? {}),
  });

describe('running-pace: references', () => {
  it('World Athletics: marathon 42.195 km, road mile 1609.344 m', () => {
    expect(RACES.marathon).toBe(42.195);
    expect(RACES.mile).toBe(1.609344);
    expect(RACES.half).toBe(21.0975);
  });
  it('OpenStax Prealgebra 2e Ex 5.63: 525 miles in 9 hours = 58.33 mph', () =>
    expect(
      run({ mode: 'pace', race: 'custom', distance: 525, distUnit: 'mi', h: 9, min: 0, sec: 0 })
        .outputs.mph,
    ).toBe(58.3333));
});

describe('running-pace: behaviour', () => {
  it('3:30 marathon = 4:59 /km = 8:01 /mi', () => {
    const r = run({ mode: 'pace', race: 'marathon', h: 3, min: 30, sec: 0, paceUnit: 'km' });
    expect(r.outputs.result).toBe('4:59 /km');
    expect(r.outputs.perMi).toBe('8:01 /mi');
  });
  it('sub-4 marathon needs 5:41 /km (341.27 s)', () =>
    expect(run({ mode: 'pace', race: 'marathon', h: 4, min: 0, sec: 0 }).outputs.result).toBe(
      '5:41 /km',
    ));
  it('10 km at 5:30 /km = 55:00', () =>
    expect(
      run({ mode: 'time', race: '10k', pmin: 5, psec: 30, paceUnit: 'km' }).outputs.result,
    ).toBe('55:00'));
  it('half marathon at 6:00 /km = 2:06:35', () =>
    expect(
      run({ mode: 'time', race: 'half', pmin: 6, psec: 0, paceUnit: 'km' }).outputs.result,
    ).toBe('2:06:35'));
  it('45 min at 9:00 /mi = 5.00 mi', () =>
    expect(
      run({
        mode: 'distance',
        h: 0,
        min: 45,
        sec: 0,
        pmin: 9,
        psec: 0,
        paceUnit: 'mi',
        distUnit: 'mi',
      }).outputs.result,
    ).toBe('5.00 mi'));
  it('6:00 /km is 9:39 /mi', () =>
    expect(run({ mode: 'time', race: '10k', pmin: 6, psec: 0, paceUnit: 'km' }).outputs.perMi).toBe(
      '9:39 /mi',
    ));
  it('speed: 5:00 /km = 12 km/h', () =>
    expect(run({ mode: 'time', race: '5k', pmin: 5, psec: 0 }).outputs.kmh).toBe(12));
  it('implausibly fast paces are flagged', () =>
    expect(run({ mode: 'pace', race: 'marathon', h: 1, min: 30, sec: 0 }).warnings[0]?.key).toBe(
      'warn.fast',
    ));
  it('zero time or pace is rejected', () => {
    expect(run({ mode: 'pace', h: 0, min: 0, sec: 0 }).warnings[0]?.key).toBe('warn.time');
    expect(run({ mode: 'time', pmin: 0, psec: 0 }).warnings[0]?.key).toBe('warn.pace');
  });
  it('clock formatting', () => {
    expect(clock(59.6)).toBe('1:00');
    expect(clock(3600)).toBe('1:00:00');
  });
});

describe('running-pace: properties', () => {
  it('time from pace, then pace from that time, returns the pace', () =>
    fc.assert(
      fc.property(
        fc.integer({ min: 150, max: 900 }),
        fc.constantFrom('5k', '10k', 'half', 'marathon'),
        (paceS, race) => {
          const time = run({
            mode: 'time',
            race,
            pmin: Math.floor(paceS / 60),
            psec: paceS % 60,
            paceUnit: 'km',
          }).outputs.result as string;
          const parts = time.split(':').map(Number);
          const [h, m, s] = parts.length === 3 ? parts : [0, ...parts];
          const back = run({ mode: 'pace', race, h, min: m, sec: s, paceUnit: 'km' }).outputs
            .result as string;
          const [pm, ps] = back.replace(' /km', '').split(':').map(Number);
          return Math.abs(pm! * 60 + ps! - paceS) <= 1;
        },
      ),
    ));
});

describe('running-pace: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run({ ...e.inputs });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
