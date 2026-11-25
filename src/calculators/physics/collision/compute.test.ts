import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { collide, compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-25');
const solve = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-25', fmt: makeFmt('en') });
type Out = Record<
  'v1f' | 'v2f' | 'keBefore' | 'keAfter' | 'keChange' | 'lostPct' | 'momentum',
  number
>;
const out = (inputs: Record<string, unknown>) => solve(inputs).outputs as unknown as Out;
const sig = (x: number, d: number) => Number(x.toPrecision(d));

describe('collision: references (OpenStax College Physics 2e §8.4–8.5)', () => {
  it('Ex 8.4: 0.500 kg at 4.00 m/s, 3.50 kg at rest, elastic → −3.00 and 1.00 m/s; 4.00 J kept', () => {
    const o = out({ kind: 'elastic', m1: 0.5, v1: 4, m2: 3.5, v2: 0 });
    expect([o.v1f, o.v2f, o.keBefore, o.keAfter, o.keChange]).toEqual([-3, 1, 4, 4, 0]);
  });
  it('Ex 8.5: puck 0.150 kg at 35.0 m/s, goalie 70.0 kg → 7.48 × 10⁻² m/s; 91.9 J → 0.196 J (−91.7 J)', () => {
    const o = out({ kind: 'inelastic', m1: 0.15, v1: 35, m2: 70, v2: 0 });
    expect([sig(o.v1f, 3), sig(o.keBefore, 3), sig(o.keAfter, 3), sig(o.keChange, 3)]).toEqual([
      0.0748, 91.9, 0.196, -91.7,
    ]);
  });
  it('Ex 8.6: 0.350 kg at 2.00, 0.500 kg at −0.500, v₁′ −4.00 → v₂′ 3.70 m/s; 0.763 J → 6.22 J', () => {
    const o = out({ kind: 'known', m1: 0.35, v1: 2, m2: 0.5, v2: -0.5, v1f: -4 });
    // KE before is exactly 0.7625 J, printed 0.763.
    expect([sig(o.v2f, 3), sig(o.keBefore, 4), sig(o.keAfter, 3), sig(o.keChange, 3)]).toEqual([
      3.7, 0.7625, 6.22, 5.46,
    ]);
  });
});

describe('collision: references (OpenStax University Physics Vol. 1 §9.4)', () => {
  it('Ex 9.10: proton +7.0 × 10⁶, neutron −4.0 × 10⁶ m/s, equal masses, stick → 1.5 × 10⁶ m/s', () =>
    expect(
      sig(out({ kind: 'inelastic', m1: 1.67e-27, v1: 7e6, m2: 1.67e-27, v2: -4e6 }).v1f, 2),
    ).toBe(1.5e6));
  it('Ex 9.11: 15 g at rest, 12 g at 2.5 m/s, elastic → 2.22 and −0.28 m/s', () => {
    const o = out({ kind: 'elastic', m1: 0.015, v1: 0, m2: 0.012, v2: 2.5 });
    expect([sig(o.v1f, 3), sig(o.v2f, 2)]).toEqual([2.22, -0.28]);
  });
});

describe('collision: behaviour', () => {
  it('equal masses swap velocities elastically', () =>
    expect(collide('elastic', 2, 3, 2, -1)).toEqual([-1, 3]));
  it('energy gain and impossible pass-through are flagged', () => {
    expect(
      solve({ kind: 'known', m1: 0.35, v1: 2, m2: 0.5, v2: -0.5, v1f: -4 }).warnings[0]?.key,
    ).toBe('warn.gain');
    expect(
      solve({ kind: 'known', m1: 1, v1: 2, m2: 1, v2: 0, v1f: 1.5 }).warnings.map((w) => w.key),
    ).toContain('warn.pass');
    expect(solve({ kind: 'elastic', m1: 0, v1: 1, m2: 1, v2: 0 }).warnings[0]?.key).toBe(
      'warn.mass',
    );
  });
});

describe('collision: properties', () => {
  const m = fc.double({ min: 0.01, max: 1000, noNaN: true });
  const v = fc.double({ min: -100, max: 100, noNaN: true });
  it('momentum is conserved; elastic keeps kinetic energy; sticking never gains it', () =>
    fc.assert(
      fc.property(m, v, m, v, (m1, v1, m2, v2) => {
        const e = out({ kind: 'elastic', m1, v1, m2, v2 });
        const i = out({ kind: 'inelastic', m1, v1, m2, v2 });
        const p = m1 * v1 + m2 * v2;
        const scale = Math.abs(m1 * v1) + Math.abs(m2 * v2) + 1;
        const ke = e.keBefore + 1;
        return (
          Math.abs(m1 * e.v1f + m2 * e.v2f - p) <= 1e-9 * scale &&
          Math.abs(e.keAfter - e.keBefore) <= 1e-9 * ke &&
          i.keAfter <= i.keBefore * (1 + 1e-12) + 1e-12
        );
      }),
    ));
});

describe('collision: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = solve(e.inputs).outputs;
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
