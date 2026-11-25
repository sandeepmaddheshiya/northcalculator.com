import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-25');
const solve = (inputs: Record<string, unknown>) =>
  compute({ ...base, g: 9.8, ...inputs } as never, { today: '2026-11-25', fmt: makeFmt('en') });
const out = (inputs: Record<string, unknown>) => solve(inputs).outputs as Record<string, number>;
const sig = (x: number, d: number) => Number(x.toPrecision(d));
const pe = (mass: number, height: number, extra: Record<string, unknown> = {}) =>
  out({ find: 'energy', mass, height, massUnit: 'kg', heightUnit: 'm', ...extra });

describe('potential-energy: references', () => {
  it('College Physics §7.3: 0.500 kg raised 1.00 m → 4.90 J', () =>
    expect(pe(0.5, 1).result).toBe(4.9));
  it('College Physics Ex 7.7: a 20.0 m drop from rest → 19.8 m/s', () =>
    expect(sig(pe(1, 20).speed!, 3)).toBe(19.8));
  it('University Physics Ex 8.2: 75 kg at 147 m → 108 kJ; at −48 m → −35.3 kJ', () => {
    expect(sig(pe(75, 147).kj!, 3)).toBe(108);
    expect(sig(pe(75, -48).kj!, 3)).toBe(-35.3);
    expect(pe(75, -48).speed).toBeNull();
  });
  it('Physics §9.2: 10 kg at 10 m → 980 J; 20 m → 1960 J', () => {
    expect(pe(10, 10).result).toBe(980);
    expect(pe(10, 20).result).toBe(1960);
  });
  it('Physics §9.2 Snap Lab: v = √(2 × 9.80 × h) = 4.43√h', () =>
    expect(sig(pe(1, 4).speed! / 2, 3)).toBe(4.43));
});

describe('potential-energy: behaviour', () => {
  it('solves for height and mass', () => {
    expect(
      out({ find: 'height', energy: 980, mass: 10, massUnit: 'kg', heightUnit: 'm' }).result,
    ).toBe(10);
    expect(out({ find: 'mass', energy: 4.9, height: 1, heightUnit: 'm' }).result).toBe(0.5);
  });
  it('feet and pounds use the exact NIST factors', () => {
    const o = pe(100, 10, { massUnit: 'lb', heightUnit: 'ft' });
    expect(sig(o.result!, 12)).toBe(sig(45.359237 * 9.8 * 3.048, 12));
    const h = out({ find: 'height', energy: 980, mass: 10, massUnit: 'kg', heightUnit: 'ft' });
    expect(sig(h.result!, 12)).toBe(sig(10 / 0.3048, 12));
  });
  it('the Moon: g = 1.62', () => expect(pe(1, 1, { g: 1.62 }).result).toBe(1.62));
  it('rejects a zero height for mass and opposite signs', () => {
    const w = (i: Record<string, unknown>) => solve(i).warnings[0]?.key;
    expect(w({ find: 'mass', energy: 10, height: 0 })).toBe('warn.height');
    expect(w({ find: 'mass', energy: 10, height: -1 })).toBe('warn.sign');
    expect(w({ find: 'height', energy: 10, mass: 0 })).toBe('warn.mass');
  });
});

describe('potential-energy: properties', () => {
  it('energy → height → mass round-trips and the fall speed is mass-independent', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 0.001, max: 1e6, noNaN: true }),
        fc.double({ min: 0.001, max: 1e4, noNaN: true }),
        fc.double({ min: 0.1, max: 100, noNaN: true }),
        (m, h, g) => {
          const e = pe(m, h, { g }).result!;
          const hb = out({
            find: 'height',
            energy: e,
            mass: m,
            massUnit: 'kg',
            heightUnit: 'm',
            g,
          }).result!;
          const mb = out({ find: 'mass', energy: e, height: h, heightUnit: 'm', g }).result!;
          const v1 = pe(m, h, { g }).speed!;
          const v2 = pe(m * 7, h, { g }).speed!;
          return (
            Math.abs(hb - h) <= 1e-9 * h &&
            Math.abs(mb - m) <= 1e-9 * m &&
            Math.abs(v1 - v2) <= 1e-9 * v1
          );
        },
      ),
    ));
  it('½mv² from the fall speed equals mgh', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 0.01, max: 1e4, noNaN: true }),
        fc.double({ min: 0.01, max: 1e4, noNaN: true }),
        (m, h) => {
          const o = pe(m, h);
          const ke = 0.5 * m * o.speed! ** 2;
          return Math.abs(ke - o.result!) <= 1e-9 * o.result!;
        },
      ),
    ));
});

describe('potential-energy: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = solve(e.inputs).outputs;
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
