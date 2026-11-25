import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute, F, R } from './compute';
import { content } from './content.en';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-25');
const solve = (inputs: Record<string, unknown>) =>
  compute({ ...base, t: 25, ...inputs } as never, {
    today: '2026-11-25',
    fmt: makeFmt('en'),
    t: (k) => content.ui[k] ?? k,
  });
type Out = Record<'result' | 'dG' | 'dG0' | 'log10K', number>;
const out = (inputs: Record<string, unknown>) => solve(inputs).outputs as unknown as Out;
const sig = (x: number, d: number) => Number(x.toPrecision(d));
const cell = (e0: number, n: number, q: number) => out({ mode: 'e', e0, n, q });
const eq = (e0: number, n: number) => out({ mode: 'k', e0, n });

describe('nernst: references (OpenStax Chemistry 2e §17.4)', () => {
  it('the 25 °C slope RT ln 10 / F is 0.0592 V', () =>
    expect(sig((R * 298.15 * Math.LN10) / F, 3)).toBe(0.0592));
  it('Ex 17.7: E° −0.17 V, n 2, Q 0.15/1.94 → −0.14 V, not spontaneous', () => {
    expect(sig(cell(-0.17, 2, 0.15 / 1.94).result, 2)).toBe(-0.14);
    expect(solve({ mode: 'e', e0: -0.17, n: 2, q: 0.15 / 1.94 }).outputs.verdict).toBe(
      'Not spontaneous',
    );
  });
  it('Ex 17.8: zinc concentration cell, Q 0.10/0.50 → +0.021 V', () =>
    expect(sig(cell(0, 2, 0.1 / 0.5).result, 2)).toBe(0.021));
  it('Ex 17.6: E° +1.247 V, n 2 → ΔG° −240.6 kJ/mol; K 1.4 × 10⁴² (printed 1.3 with 0.0592 V)', () => {
    const o = eq(1.247, 2);
    expect(sig(o.dG0, 4)).toBe(-240.6);
    expect(sig(o.result, 2)).toBe(1.4e42);
    // ADR-022: with the rounded 0.0592 V, K = 10^42.128 = 1.3 × 10⁴².
    expect(sig(10 ** ((2 * 1.247) / 0.0592), 2)).toBe(1.3e42);
  });
  it('check: E° +0.291 V, n 2 → ΔG° −56.2 kJ/mol; K 6.9 × 10⁹ (printed 6.8 × 10⁹)', () => {
    const o = eq(0.291, 2);
    expect(sig(o.dG0, 3)).toBe(-56.2);
    expect(sig(o.result, 2)).toBe(6.9e9);
    expect(sig(10 ** ((2 * 0.291) / 0.0592), 2)).toBe(6.8e9);
  });
});

describe('nernst: references (LibreTexts Nernst Equation)', () => {
  it('Zn–Cu cell: E° 1.10 V, Q 1.95/0.05 → 1.05 V', () =>
    expect(sig(cell(1.1, 2, 1.95 / 0.05).result, 3)).toBe(1.05));
  it('K = 10^37.2: log K = 2 × 1.10 ÷ 0.0592 (exact slope gives 37.19)', () => {
    expect(sig(eq(1.1, 2).log10K, 3)).toBe(37.2);
    // ADR-022: the page rounds log K to 37.2 before raising 10, printing 1.58 × 10³⁷ (exact 1.54 × 10³⁷).
    expect(sig(eq(1.1, 2).result, 3)).toBe(1.54e37);
  });
});

describe('nernst: behaviour', () => {
  it('Q = 1 gives E = E°; Q = K gives E = 0', () => {
    expect(cell(0.5, 1, 1).result).toBe(0.5);
    const K = eq(0.1, 2).result;
    expect(Math.abs(cell(0.1, 2, K).result)).toBeLessThan(1e-12);
  });
  it('temperature enters through RT/nF; huge K reports log only', () => {
    const hot = out({ mode: 'e', e0: 0.1, n: 1, q: 10, t: 100 }).result;
    expect(sig(hot, 10)).toBe(sig(0.1 - ((R * 373.15) / F) * Math.log(10), 10));
    expect(solve({ mode: 'k', e0: 10, n: 4 }).warnings[0]?.key).toBe('warn.huge');
    expect(solve({ mode: 'e', e0: 1, n: 1.5, q: 1 }).warnings[0]?.key).toBe('warn.n');
  });
});

describe('nernst: properties', () => {
  it('each factor of 10 in Q shifts E by 0.05916 V ÷ n at 25 °C; ΔG = −nFE', () =>
    fc.assert(
      fc.property(
        fc.double({ min: -3, max: 3, noNaN: true }),
        fc.integer({ min: 1, max: 6 }),
        fc.double({ min: 1e-6, max: 1e6, noNaN: true }),
        (e0, n, q) => {
          const a = cell(e0, n, q);
          const b = cell(e0, n, q * 10);
          const step = (R * 298.15 * Math.LN10) / (n * F);
          return (
            Math.abs(a.result - b.result - step) <= 1e-10 &&
            Math.abs(a.dG - (-n * F * a.result) / 1000) <= 1e-9 * (Math.abs(a.dG) + 1)
          );
        },
      ),
    ));
});

describe('nernst: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = solve(e.inputs).outputs;
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
