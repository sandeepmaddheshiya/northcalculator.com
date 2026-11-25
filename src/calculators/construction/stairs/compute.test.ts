import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute, layout, LIMITS, stairAngle } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-25');
const solve = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-25', fmt: makeFmt('en') });
type Out = Record<'riser' | 'risers' | 'treads' | 'run' | 'angle' | 'stringer' | 'runFt', number>;
const out = (inputs: Record<string, unknown>) => solve(inputs).outputs as unknown as Out;
const dm = (deg: number) =>
  `${Math.floor(deg)}°${String(Math.round((deg % 1) * 60)).padStart(2, '0')}′`;

describe('stairs: references (IRC R311.7.5 via City of Boise handout #437)', () => {
  it('limits: riser ≤ 7¾ in, tread ≥ 10 in', () =>
    expect(LIMITS.irc).toEqual({ riser: 7.75, tread: 10 }));
  it('a stair at the IRC limits is 7¾ / 10', () => {
    const o = out({ code: 'irc', unit: 'in', rise: 7.75 * 12, tread: 10 });
    expect([o.risers, o.riser]).toEqual([12, 7.75]);
  });
  it('treads under 10 in are flagged; under 11 in need a nosing', () => {
    const w = solve({ code: 'irc', unit: 'in', rise: 100, tread: 9.5 }).warnings.map((x) => x.key);
    expect(w).toEqual(expect.arrayContaining(['warn.tread.irc', 'warn.nosing']));
    expect(solve({ code: 'irc', unit: 'in', rise: 100, tread: 11 }).warnings).toEqual([]);
  });
});

describe('stairs: references (OSHA 29 CFR 1910.25 and Table D-1)', () => {
  it('limits: riser ≤ 9.5 in, tread ≥ 9.5 in', () =>
    expect(LIMITS.osha).toEqual({ riser: 9.5, tread: 9.5 }));
  it.each([
    [6.5, 11, '30°35′'],
    [7, 10.5, '33°41′'],
    [7.5, 10, '36°52′'],
    [7.75, 9.75, '38°29′'],
    [8.75, 8.75, '45°00′'],
    [9.25, 8.25, '48°16′'],
  ])('Table D-1: %s in rise, %s in tread → %s', (r, t, want) =>
    expect(dm(stairAngle(r, t))).toBe(want),
  );
  it('Table D-1 prints 40°08′ for 8 / 9½; tan⁻¹(8 ÷ 9.5) is 40°06′ (ADR-022)', () =>
    expect(dm(stairAngle(8, 9.5))).toBe('40°06′'));
  it('angles outside 30°–50° are flagged', () =>
    expect(
      solve({ code: 'osha', unit: 'in', rise: 100, tread: 20 }).warnings.map((x) => x.key),
    ).toContain('warn.angle'));
});

describe('stairs: behaviour', () => {
  it('108 in at the IRC limit → 14 risers of 7.714 in, 13 treads, 130 in run', () => {
    const o = out({ code: 'irc', unit: 'in', rise: 108, tread: 10 });
    expect([o.risers, Number(o.riser.toFixed(3)), o.treads, o.run]).toEqual([14, 7.714, 13, 130]);
    expect(Number(o.stringer.toFixed(2))).toBe(Number(Math.hypot(108, 130).toFixed(2)));
  });
  it('centimetres: 274.32 cm rise (108 in) and 25.4 cm treads give the same layout', () => {
    const o = out({ code: 'irc', unit: 'cm', rise: 274.32, tread: 25.4 });
    expect([o.risers, o.treads, Number(o.riser.toFixed(4))]).toEqual([
      14,
      13,
      Number(((108 / 14) * 2.54).toFixed(4)),
    ]);
    expect(o.runFt).toBeNull();
  });
  it('custom maximum riser; an exact multiple does not add a riser', () => {
    expect(out({ code: 'custom', unit: 'in', rise: 105, tread: 11, maxRiser: 7 }).risers).toBe(15);
    expect(out({ code: 'irc', unit: 'in', rise: 93, tread: 10 }).risers).toBe(12);
  });
});

describe('stairs: properties', () => {
  it('every riser is within the limit and the risers add up to the rise', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 1, max: 1000, noNaN: true }),
        fc.double({ min: 2, max: 12, noNaN: true }),
        fc.double({ min: 5, max: 20, noNaN: true }),
        (rise, max, tread) => {
          const L = layout(rise, max, tread);
          return (
            L.riser <= max * (1 + 1e-9) &&
            Math.abs(L.riser * L.n - rise) <= 1e-9 * rise &&
            (L.n === 1 || L.riser > (max * (L.n - 1)) / L.n - 1e-9) &&
            L.treads === L.n - 1
          );
        },
      ),
    ));
});

describe('stairs: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = solve(e.inputs).outputs;
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
