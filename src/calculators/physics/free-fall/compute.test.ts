import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-24', fmt: makeFmt('en') })
    .outputs as Record<string, number>;
const sig = (x: number, d: number) => Number(x.toPrecision(d));

describe('free-fall: references', () => {
  it('OpenStax College Physics 2e §2.7: 30.0 m at 9.80 → 2.47 s', () =>
    expect(sig(run({ known: 'height', height: 30, g: 9.8 }).result!, 3)).toBe(2.47));
  it('Ex 2.16: 1.0000 m in 0.45173 s means g = 9.8010', () => {
    const d = run({ known: 'time', time: 0.45173, g: 9.801 }).result!;
    expect(sig(d, 5)).toBe(1);
  });
  it('University Physics Ex 3.14: 98 m, v₀ 4.9, g 9.8 → 4.0 s, 44.1 m/s', () => {
    const o = run({ known: 'height', height: 98, v0: 4.9, g: 9.8 });
    expect([o.result, o.speed]).toEqual([4, 44.1]);
  });
  it('Ex 3.15: 2.5 s from rest → 30.6 m, 24.5 m/s', () => {
    const o = run({ known: 'time', time: 2.5, g: 9.8 });
    expect([sig(o.result!, 3), o.speed]).toEqual([30.6, 24.5]);
  });
  it('Ex 3.16: rising at 200.0 m/s it climbs v₀² ÷ 2g = 2040.8 m, and falls back from rest in the same time', () => {
    const h = 200 ** 2 / (2 * 9.8);
    expect(Math.round(h * 10) / 10).toBe(2040.8);
    expect(sig(run({ known: 'height', height: h, g: 9.8 }).speed!, 10)).toBe(200);
  });
});

describe('free-fall: behaviour', () => {
  it('FAQ: 5, 20 and 100 m at 9.81 → 1.01, 2.02, 4.52 s; 20 m → 19.8 m/s', () => {
    expect(
      [5, 20, 100].map(
        (h) => Math.round(run({ known: 'height', height: h, g: 9.81 }).result! * 100) / 100,
      ),
    ).toEqual([1.01, 2.02, 4.52]);
    expect(sig(run({ known: 'height', height: 20, g: 9.81 }).speed!, 3)).toBe(19.8);
  });
  it('feet: 16.087 ft takes 1 s at standard gravity (½ × 32.174 ft/s²)', () =>
    expect(sig(run({ known: 'height', height: 9.80665 / 2 / 0.3048, hu: 'ft' }).result!, 9)).toBe(
      1,
    ));
  it('a 2 s well drop is 19.6 m at 9.8', () =>
    expect(sig(run({ known: 'time', time: 2, g: 9.8 }).result!, 3)).toBe(19.6));
  it('fast landings carry an air-resistance note', () =>
    expect(
      compute({ ...base, known: 'height', height: 500 } as never, { today: '', fmt: makeFmt('en') })
        .warnings[0]?.key,
    ).toBe('warn.air'));
});

describe('free-fall: properties', () => {
  it('height → time → distance round-trips, and v² = v₀² + 2gh', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 0.01, max: 1e5, noNaN: true }),
        fc.double({ min: 0, max: 500, noNaN: true }),
        fc.double({ min: 0.5, max: 30, noNaN: true }),
        (h, v0, g) => {
          const a = run({ known: 'height', height: h, v0, g });
          const b = run({ known: 'time', time: a.result!, v0, g });
          return (
            Math.abs(b.result! - h) <= 1e-8 * h &&
            Math.abs(a.speed! ** 2 - (v0 * v0 + 2 * g * h)) <= 1e-8 * (v0 * v0 + 2 * g * h)
          );
        },
      ),
    ));
});

describe('free-fall: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = run(e.inputs);
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
