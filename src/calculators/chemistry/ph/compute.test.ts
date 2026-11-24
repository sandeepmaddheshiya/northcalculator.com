import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { content } from './content.en';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (known: string, value: number) =>
  compute({ ...base, known, value } as never, {
    today: '2026-11-24',
    fmt: makeFmt('en'),
    t: (k) => content.ui[k] ?? k,
  }).outputs as Record<string, number | string>;
const r = (x: unknown, d: number) => Math.round((x as number) * 10 ** d) / 10 ** d;
const sig = (x: unknown, d: number) => Number((x as number).toPrecision(d));

describe('ph: references (OpenStax Chemistry 2e §14.2)', () => {
  it('Ex 14.4: 1.2 × 10⁻³ M → 2.92; check: 2.0 × 10⁻⁶ M → 5.70', () => {
    expect(r(run('h', 1.2e-3).ph, 2)).toBe(2.92);
    expect(r(run('h', 2e-6).ph, 2)).toBe(5.7);
  });
  it('Ex 14.5: pH 7.3 → 5 × 10⁻⁸ M; check: pH −1.07 → 12 M', () => {
    expect(sig(run('ph', 7.3).h, 1)).toBe(5e-8);
    expect(sig(run('ph', -1.07).h, 2)).toBe(12);
  });
  it('Ex 14.6: 0.0125 M OH⁻ → pOH 1.903, pH 12.10; check: pH 2.4 ↔ pOH 11.6', () => {
    const o = run('oh', 0.0125);
    expect([r(o.poh, 3), r(o.ph, 2)]).toEqual([1.903, 12.1]);
    expect(r(run('ph', 2.4).poh, 1)).toBe(11.6);
  });
  it('neutral water: 1.0 × 10⁻⁷ M → 7.00, neutral', () => {
    const o = run('h', 1e-7);
    expect([o.ph, o.nature]).toEqual([7, 'Neutral']);
  });
});

describe('ph: references (LibreTexts Introductory Chemistry §14.9)', () => {
  it('Ex 14.9.2: 1 × 10⁻³ → 3.0; 2.5 × 10⁻¹¹ → 10.60 (the page’s 4.7 × 10⁻⁹ → 8.30 should be 8.33)', () => {
    expect(r(run('h', 1e-3).ph, 1)).toBe(3);
    expect(r(run('h', 2.5e-11).ph, 2)).toBe(10.6);
    expect(r(run('h', 4.7e-9).ph, 2)).toBe(8.33);
  });
  it('Ex 14.9.3: pH 12.6 → 2.5 × 10⁻¹³ M; pH 8.3 → 5.0 × 10⁻⁹', () => {
    expect(sig(run('ph', 12.6).h, 2)).toBe(2.5e-13);
    expect(sig(run('ph', 8.3).h, 2)).toBe(5e-9);
  });
  it('Ex 14.9.4: pH 4.42 → pOH 9.58; exercise 8.22 → 5.78', () => {
    expect(r(run('ph', 4.42).poh, 2)).toBe(9.58);
    expect(r(run('ph', 8.22).poh, 2)).toBe(5.78);
  });
  it('Ex 14.9.1: 10.5 basic, 7 neutral, 3.0 acidic', () =>
    expect([run('ph', 10.5).nature, run('ph', 7).nature, run('ph', 3).nature]).toEqual([
      'Basic',
      'Neutral',
      'Acidic',
    ]));
});

describe('ph: behaviour', () => {
  it('pOH input works; non-positive concentrations are rejected', () => {
    expect(run('poh', 9.58).ph).toBe(4.42);
    expect(
      compute({ ...base, known: 'h', value: 0 } as never, { today: '', fmt: makeFmt('en') })
        .warnings[0]?.key,
    ).toBe('warn.conc');
  });
});

describe('ph: properties', () => {
  it('[H₃O⁺][OH⁻] = 10⁻¹⁴ and pH → [H₃O⁺] → pH round-trips', () =>
    fc.assert(
      fc.property(fc.double({ min: -1, max: 15, noNaN: true }), (ph) => {
        const o = run('ph', ph);
        const back = run('h', o.h as number).ph as number;
        return (
          Math.abs(((o.h as number) * (o.oh as number)) / 1e-14 - 1) < 1e-9 &&
          Math.abs(back - Math.round(ph * 1e4) / 1e4) < 2e-4
        );
      }),
    ));
});

describe('ph: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = run(String(e.inputs.known), Number(e.inputs.value));
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
