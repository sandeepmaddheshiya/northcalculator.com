import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-25');
const solve = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-25', fmt: makeFmt('en') });
const out = (inputs: Record<string, unknown>) =>
  solve(inputs).outputs as Record<string, number | string>;
const sig = (x: unknown, d: number) => Number((x as number).toPrecision(d));

describe('molarity: references (OpenStax Chemistry 2e §3.3)', () => {
  it('Ex 3.14: 0.133 mol in 355 mL → 0.375 M', () =>
    expect(
      sig(out({ find: 'molarity', amount: 0.133, au: 'mol', volume: 355, vu: 'mL' }).M, 3),
    ).toBe(0.375));
  it('Ex 3.16: 25.2 g acetic acid (60.052) in 0.500 L → 0.839 M', () =>
    expect(
      sig(out({ find: 'molarity', amount: 25.2, au: 'g', mm: 60.052, volume: 0.5, vu: 'L' }).M, 3),
    ).toBe(0.839));
  it('Ex 3.17: 0.250 L of 5.30 M NaCl (58.44) → 77.4 g', () =>
    expect(
      sig(
        out({ find: 'amount', molarity: 5.3, volume: 0.25, vu: 'L', au: 'g', mm: 58.44 }).grams,
        3,
      ),
    ).toBe(77.4));
  it('Ex 3.18: 75.6 g acetic acid at 0.839 M → 1.50 L', () =>
    expect(
      sig(
        out({ find: 'volume', amount: 75.6, au: 'g', mm: 60.052, molarity: 0.839, vu: 'L' }).L,
        3,
      ),
    ).toBe(1.5));
});

describe('molarity: references (LibreTexts Introductory Chemistry §13.6)', () => {
  it('Ex 13.6.1: 42.23 g NH₄Cl (53.50) in 500.0 mL → 1.579 M', () =>
    expect(
      sig(out({ find: 'molarity', amount: 42.23, au: 'g', mm: 53.5, volume: 500, vu: 'mL' }).M, 4),
    ).toBe(1.579));
  it('Ex 13.6.3: 4.88 mol at 2.35 M → 2.08 L', () =>
    expect(
      sig(out({ find: 'volume', amount: 4.88, au: 'mol', molarity: 2.35, vu: 'L' }).L, 3),
    ).toBe(2.08));
  it('Ex 13.6.4: 3.00 L of 0.250 M KMnO₄ (158.04) → 119 g', () =>
    expect(
      sig(
        out({ find: 'amount', molarity: 0.25, volume: 3, vu: 'L', au: 'g', mm: 158.04 }).grams,
        3,
      ),
    ).toBe(119));
  it('text: 1.5 mol in 0.500 L → 3.0 M; 22.4 g HCl (36.5) in 1.56 L → 0.393 M (printed 0.394)', () => {
    expect(out({ find: 'molarity', amount: 1.5, au: 'mol', volume: 0.5, vu: 'L' }).M).toBe(3);
    // ADR-022: the page rounds to 0.614 mol before dividing and gets 0.394; exact is 0.3934.
    expect(
      sig(out({ find: 'molarity', amount: 22.4, au: 'g', mm: 36.5, volume: 1.56, vu: 'L' }).M, 3),
    ).toBe(0.393);
    expect(sig(0.614 / 1.56, 3)).toBe(0.394);
  });
});

describe('molarity: behaviour', () => {
  it('summary: 0.250 L of 1.00 M NaCl needs about 14.6 g', () =>
    expect(
      sig(out({ find: 'amount', molarity: 1, volume: 250, vu: 'mL', au: 'g', mm: 58.44 }).grams, 3),
    ).toBe(14.6));
  it('grams without a molar mass are rejected', () =>
    expect(solve({ find: 'molarity', amount: 1, au: 'g', mm: 0, volume: 1 }).warnings[0]?.key).toBe(
      'warn.mm',
    ));
});

describe('molarity: properties', () => {
  it('molarity → amount → volume round-trips', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 0.001, max: 1000, noNaN: true }),
        fc.double({ min: 0.01, max: 1000, noNaN: true }),
        fc.double({ min: 1, max: 1000, noNaN: true }),
        (g, ml, mm) => {
          const M = out({ find: 'molarity', amount: g, au: 'g', mm, volume: ml, vu: 'mL' })
            .M as number;
          const back = out({ find: 'amount', molarity: M, volume: ml, vu: 'mL', au: 'g', mm })
            .grams as number;
          const v = out({ find: 'volume', amount: g, au: 'g', mm, molarity: M, vu: 'mL' })
            .L as number;
          return Math.abs(back - g) <= 1e-9 * g && Math.abs(v * 1000 - ml) <= 1e-9 * ml;
        },
      ),
    ));
});

describe('molarity: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = out(e.inputs);
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
