import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const solve = (find: string, v: Record<string, number>) =>
  compute({ ...base, find, ...v } as never, { today: '2026-11-24', fmt: makeFmt('en') });
const res = (find: string, v: Record<string, number>) => solve(find, v).outputs.result as number;
const sig3 = (x: number) => Number(x.toPrecision(3));

describe('dilution: references', () => {
  it('OpenStax Chemistry 2e Ex 3.19: 0.850 L of 5.00 M to 1.80 L → 2.36 M', () =>
    expect(sig3(res('c2', { c1: 5, v1: 0.85, v2: 1.8 }))).toBe(2.36));
  it('Ex 3.19 check: 25.0 mL of 2.04 M to 500.0 mL → 0.102 M', () =>
    expect(res('c2', { c1: 2.04, v1: 25, v2: 500 })).toBe(0.102));
  it('Ex 3.20: 0.011 L of 0.45 M to 0.12 M → 0.041 L (exact 0.04125)', () => {
    expect(res('v2', { c1: 0.45, v1: 0.011, c2: 0.12 })).toBe(0.04125);
    expect(Number((0.04125).toPrecision(2))).toBe(0.041);
  });
  it('Ex 3.21: 5.00 L of 0.100 M from 1.59 M → 0.314 L', () =>
    expect(sig3(res('v1', { c1: 1.59, c2: 0.1, v2: 5 }))).toBe(0.314));
  it('LibreTexts §13.7: 100. mL of 2.0 M HCl to 500. mL → 0.40 M', () =>
    expect(res('c2', { c1: 2, v1: 100, v2: 500 })).toBe(0.4));
  it('LibreTexts Ex 13.7.1: 8.00 L of 0.50 M from 16 M → 0.25 L', () =>
    expect(res('v1', { c1: 16, c2: 0.5, v2: 8 })).toBe(0.25));
  it('LibreTexts Exercise 13.7.1: 76.5 mL of 0.885 M to 0.500 M → 135.4 mL (exact 135.405)', () =>
    expect(res('v2', { c1: 0.885, v1: 76.5, c2: 0.5 })).toBe(135.405));
});

describe('dilution: behaviour', () => {
  it('solvent to add and dilution factor: 100 mL of 2.0 M to 500 mL → add 400, factor 5', () => {
    const r = solve('c2', { c1: 2, v1: 100, v2: 500 }).outputs;
    expect([r.solvent, r.factor]).toEqual([400, 5]);
  });
  it('FAQ: 2.5 L of 0.400 M from 3.00 M ≈ 0.333 L; 50 mL of 10% to 200 mL = 2.5%', () => {
    expect(sig3(res('v1', { c1: 3, c2: 0.4, v2: 2.5 }))).toBe(0.333);
    expect(res('c2', { c1: 10, v1: 50, v2: 200 })).toBe(2.5);
  });
  it('solving for C₁ works too', () => expect(res('c1', { v1: 0.25, c2: 0.5, v2: 8 })).toBe(16));
  it('a "dilution" that concentrates is flagged; zeros are rejected', () => {
    expect(solve('c2', { c1: 1, v1: 500, v2: 100 }).warnings[0]?.key).toBe('warn.concentrating');
    expect(solve('v1', { c1: 0, c2: 1, v2: 1 }).warnings[0]?.key).toBe('warn.zero');
  });
});

describe('dilution: properties', () => {
  it('solving for each unknown in turn recovers the same four values', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 0.001, max: 1000, noNaN: true }),
        fc.double({ min: 0.001, max: 1000, noNaN: true }),
        fc.double({ min: 0.001, max: 1000, noNaN: true }),
        (c1, v1, v2) => {
          const c2 = res('c2', { c1, v1, v2 });
          const close = (a: number, b: number) => Math.abs(a - b) <= 1e-9 * Math.abs(b);
          return (
            close(res('c1', { v1, c2, v2 }), c1) &&
            close(res('v1', { c1, c2, v2 }), v1) &&
            close(res('v2', { c1, v1, c2 }), v2)
          );
        },
      ),
    ));
});

describe('dilution: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const { find, ...v } = e.inputs as Record<string, number> & { find: string };
    const r = solve(find, v);
    for (const [k, val] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(val);
  });
});
