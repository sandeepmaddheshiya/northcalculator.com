import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-25');
const solve = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-25', fmt: makeFmt('en') });
type Out = Record<'result' | 'ea' | 'k2' | 'A' | 'ratio', number>;
const out = (inputs: Record<string, unknown>) => solve(inputs).outputs as unknown as Out;
const sig = (x: number, d: number) => Number(x.toPrecision(d));
const ea = (k1: number, T1: number, k2: number, T2: number, tu = 'K') =>
  out({ find: 'ea', tu, k1, T1, k2, T2 }).result;

describe('arrhenius: references (OpenStax Chemistry 2e §12.5)', () => {
  it('Check Your Learning: N₂O₅ 1.66 at 650 K, 7.39 at 700 K → 1.1 × 10⁵ J/mol', () =>
    expect(sig(ea(1.66, 650, 7.39, 700), 2)).toBe(110));
  it('Ex 12.13: HI 3.52 × 10⁻⁷ at 555 K, 3.95 × 10⁻² at 781 K → 185 kJ/mol (printed 180)', () => {
    // ADR-022: the book rounds 1/T to 1.80 and 1.28 × 10⁻³ and gets 1.8 × 10⁵ J/mol.
    expect(sig(ea(3.52e-7, 555, 3.95e-2, 781), 3)).toBe(185);
    // The book's printed slope, −2.2 × 10⁴ K, times R gives its 1.8 × 10⁵ J/mol.
    expect(sig(2.2e4 * 8.314, 2)).toBe(1.8e5);
  });
});

describe('arrhenius: references (Stephen Lower, LibreTexts Arrhenius Equation)', () => {
  it('Example 3: egg 3.0 min at 373 K, 4.5 min at 365 K → 57.4 kJ/mol', () =>
    expect(sig(ea(1, 365, 1.5, 373), 3)).toBe(57.4));
  it('Example 2: ten-degree rule, doubling from 295 to 305 K → 51.9 kJ/mol (printed 52.4)', () =>
    // ADR-022: the page rounds 1/295 and 1/305 to 0.00339 and 0.00328.
    expect(sig(ea(1, 295, 2, 305), 3)).toBe(51.9));
  it('P2: A 9, Ea 200 kJ/mol, 289 K → 6.40 × 10⁻³⁶ (printed 6.37 with R = 8.314)', () => {
    // ADR-022: with Ea/RT ≈ 83, R = 8.314 instead of 8.314462618 shifts k by 0.5%.
    expect(sig(out({ find: 'k', tu: 'K', A: 9, ea: 200, T1: 289 }).result, 3)).toBe(6.4e-36);
    expect(sig(9 * Math.exp(-200000 / (8.314 * 289)), 3)).toBe(6.37e-36);
  });
  it('P3: 7 at 370 K, Ea 900 kJ/mol → 1.794 × 10⁻²⁴ at 310 K (printed 1.788 with R = 8.314)', () => {
    expect(sig(out({ find: 'k2', tu: 'K', k1: 7, T1: 370, ea: 900, T2: 310 }).result, 4)).toBe(
      1.794e-24,
    );
    expect(sig(7 * Math.exp((-900000 / 8.314) * (1 / 310 - 1 / 370)), 4)).toBe(1.788e-24);
  });
  it('P4: A 15, k 12 at 22 K → Ea 40.82 J/mol (inverting the A form)', () => {
    const k = out({ find: 'k', tu: 'K', A: 15, ea: 0.04082, T1: 22 }).result;
    expect(sig(k, 3)).toBe(12);
  });
  it('P5: 7 at 389 K, Ea 600 kJ/mol → 15 at 390.6 K', () =>
    expect(sig(out({ find: 'k2', tu: 'K', k1: 7, T1: 389, ea: 600, T2: 390.6 }).result, 2)).toBe(
      15,
    ));
});

describe('arrhenius: behaviour', () => {
  it('°C converts; A is recovered in Ea mode', () => {
    expect(ea(1.66, 376.85, 7.39, 426.85, 'C')).toBe(ea(1.66, 650, 7.39, 700));
    const o = out({ find: 'ea', tu: 'K', k1: 1.66, T1: 650, k2: 7.39, T2: 700 });
    expect(sig(out({ find: 'k', tu: 'K', A: o.A, ea: o.ea, T1: 700 }).result, 9)).toBe(7.39);
  });
  it('bad inputs are explained', () => {
    expect(solve({ find: 'ea', tu: 'K', k1: 1, T1: 300, k2: 2, T2: 300 }).warnings[0]?.key).toBe(
      'warn.sameT',
    );
    expect(solve({ find: 'ea', tu: 'K', k1: 0, T1: 300, k2: 2, T2: 310 }).warnings[0]?.key).toBe(
      'warn.k',
    );
    expect(solve({ find: 'ea', tu: 'C', k1: 1, T1: -300, k2: 2, T2: 310 }).warnings[0]?.key).toBe(
      'warn.kelvin',
    );
    expect(solve({ find: 'ea', tu: 'K', k1: 2, T1: 300, k2: 1, T2: 310 }).warnings[0]?.key).toBe(
      'warn.negative',
    );
  });
});

describe('arrhenius: properties', () => {
  it('Ea from two points, then k₂ from Ea, round-trips', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 1e-6, max: 1e6, noNaN: true }),
        fc.double({ min: 200, max: 1000, noNaN: true }),
        fc.double({ min: 1.01, max: 1e4, noNaN: true }),
        fc.double({ min: 5, max: 300, noNaN: true }),
        (k1, T1, ratio, dT) => {
          const T2 = T1 + dT;
          const e = ea(k1, T1, k1 * ratio, T2);
          const k2 = out({ find: 'k2', tu: 'K', k1, T1, ea: e, T2 }).result;
          return Math.abs(k2 / (k1 * ratio) - 1) <= 1e-8;
        },
      ),
    ));
});

describe('arrhenius: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = solve(e.inputs).outputs;
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
