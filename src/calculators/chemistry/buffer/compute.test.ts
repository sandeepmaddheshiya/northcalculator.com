import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute, pKaOf } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-25');
const solve = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-25', fmt: makeFmt('en') });
const out = (inputs: Record<string, unknown>) => solve(inputs).outputs as Record<string, number>;
const r2 = (x: number | undefined) => Number(x!.toFixed(2));
const ph = (kt: string, k: number, acid: number, b: number, extra: Record<string, unknown> = {}) =>
  out({ find: 'ph', kt, k, acid, base: b, added: 'none', ...extra });

describe('buffer: references (OpenStax Chemistry 2e §14.6)', () => {
  it('Ex 14.20(a): 0.10 M acetic acid and acetate, Ka 1.8 × 10⁻⁵ → pH 4.74', () =>
    expect(r2(ph('ka', 1.8e-5, 0.1, 0.1).result)).toBe(4.74));
  it('Ex 14.20(b): 1.0 × 10⁻⁴ mol NaOH into 1.00 × 10⁻² mol each → 0.99 and 1.01 × 10⁻² mol, pH 4.75', () => {
    const o = ph('ka', 1.8e-5, 0.01, 0.01, { added: 'base', amount: 1e-4 });
    expect([r2(o.before), r2(o.result)]).toEqual([4.74, 4.75]);
    expect(Number(o.ratio!.toPrecision(3))).toBe(Number((0.0101 / 0.0099).toPrecision(3)));
  });
  it('Ex 14.20(b) by concentration: 0.098 M acid and 0.100 M acetate → 4.75', () =>
    expect(r2(ph('ka', 1.8e-5, 0.098, 0.1).result)).toBe(4.75));
  it('blood: pKa 6.4, 0.024 M base, 0.0012 M acid → 7.7', () =>
    expect(Number(ph('pka', 6.4, 0.0012, 0.024).result!.toFixed(1))).toBe(7.7));
});

describe('buffer: references (LibreTexts Henderson–Hasselbalch Approximation)', () => {
  it('Ex 1: 1.0 M HNO₂, 0.225 M NaNO₂, pKa 3.14 → 2.492 (the page inverts the ratio and prints 3.788)', () => {
    expect(Number(ph('pka', 3.14, 1, 0.225).result!.toFixed(3))).toBe(2.492);
    // ADR-022: the printed 3.788 is 3.14 + log(1 ÷ 0.225), the acid-to-base ratio by mistake.
    expect(Number(ph('pka', 3.14, 0.225, 1).result!.toFixed(3))).toBe(3.788);
  });
  it('Ex 2: pKa 4.74, pH 5.0 → ratio 1.8', () =>
    expect(Number(out({ find: 'ratio', kt: 'pka', k: 4.74, target: 5 }).result!.toFixed(1))).toBe(
      1.8,
    ));
  it('Ex 3: NH₃ pKb 4.74 → pKa 9.26; 0.323 M NH₃ at pH 8.6 → 1.48 M NH₄⁺', () => {
    const o = out({ find: 'ratio', kt: 'pkb', k: 4.74, target: 8.6 });
    expect(Number(o.pKa!.toFixed(2))).toBe(9.26);
    expect(Number((0.323 / o.result!).toFixed(2))).toBe(1.48);
  });
  it('Ex 5: pKa 4.756 → effective range 3.75 to 5.75 (printed to 2 decimals)', () => {
    const o = out({ find: 'ratio', kt: 'pka', k: 4.756, target: 4.756 });
    expect([Math.floor(o.low! * 100) / 100, Math.floor(o.high! * 100) / 100]).toEqual([3.75, 5.75]);
  });
  it('blood (Fundamentals of GOB Chemistry 10.10): pKa 6.1 → 7.4', () =>
    expect(Number(ph('pka', 6.1, 0.0012, 0.024).result!.toFixed(1))).toBe(7.4));
});

describe('buffer: behaviour', () => {
  it('Ka and pKb forms convert', () => {
    expect(pKaOf('ka', 1e-5)).toBe(5);
    expect(pKaOf('pkb', 4.74)).toBeCloseTo(9.26, 12);
    expect(pKaOf('ka', 0)).toBeNull();
  });
  it('strong acid lowers pH; exceeding the capacity is flagged', () => {
    const o = ph('pka', 4.75, 0.5, 0.5, { added: 'acid', amount: 0.35 });
    expect(r2(o.result)).toBe(4.0);
    expect(
      solve({ find: 'ph', kt: 'pka', k: 4.75, acid: 0.5, base: 0.5, added: 'acid', amount: 0.6 })
        .warnings[0]?.key,
    ).toBe('warn.exceeded');
  });
  it('ratios outside 0.1–10 warn', () =>
    expect(
      solve({ find: 'ph', kt: 'pka', k: 4.74, acid: 1, base: 0.05, added: 'none' }).warnings[0]
        ?.key,
    ).toBe('warn.range'));
});

describe('buffer: properties', () => {
  it('pH − pKa = log ratio, and the ratio solver inverts it', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 1, max: 13, noNaN: true }),
        fc.double({ min: 0.001, max: 10, noNaN: true }),
        fc.double({ min: 0.001, max: 10, noNaN: true }),
        (pKa, a, b) => {
          const p = ph('pka', pKa, a, b).result!;
          const ratio = out({ find: 'ratio', kt: 'pka', k: pKa, target: p }).result!;
          return Math.abs(ratio - b / a) <= 1e-9 * (b / a);
        },
      ),
    ));
});

describe('buffer: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = solve(e.inputs).outputs;
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
