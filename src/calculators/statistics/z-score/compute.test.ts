import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { normalCdf, normalInv } from '@/engine/stats';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-24', fmt: makeFmt('en') });

describe('z-score: references', () => {
  it('OpenStax Intro Stats 2e Ex 6.1: x = 17, N(5, 6) → z = 2', () =>
    expect(run({ mode: 'z', x: 17, mean: 5, sd: 6 }).outputs.result).toBe(2));
  it('Ex 6.3: 168 cm, N(170, 6.28) → −0.32 (book rounds; exact −0.318471…)', () => {
    const z = run({ mode: 'z', x: 168, mean: 170, sd: 6.28 }).outputs.result as number;
    expect(Math.round(z * 100) / 100).toBe(-0.32);
  });
  it('Ex 6.3: z = 1.27 → 177.98 cm (exact 177.9756)', () =>
    expect(run({ mode: 'x', x: 1.27, mean: 170, sd: 6.28 }).outputs.result).toBe(177.9756));
  // NIST/SEMATECH 1.3.6.7.1 table: area from 0 to z, 5 decimals (also Python erf).
  it.each([
    [0.5, 0.19146],
    [1, 0.34134],
    [1.28, 0.39973],
    [1.64, 0.4495],
    [1.65, 0.45053],
    [1.96, 0.475],
    [2, 0.47725],
    [2.33, 0.4901],
    [2.58, 0.49506],
    [3, 0.49865],
  ])('NIST table: Φ(%s) − 0.5 = %s', (z, area) =>
    expect(Math.round((normalCdf(z) - 0.5) * 1e5) / 1e5).toBe(area),
  );
});

describe('z-score: behaviour', () => {
  it('percent below, above and between for z = 1 (68% rule)', () => {
    const r = run({ mode: 'z', x: 1, mean: 0, sd: 1 }).outputs;
    expect([r.below, r.above, r.between]).toEqual([84.1345, 15.8655, 68.2689]);
  });
  it('z = −1.5 has 6.68% below (Python erf 0.0668072)', () =>
    expect(run({ mode: 'z', x: -1.5, mean: 0, sd: 1 }).outputs.below).toBe(6.6807));
  it('zero or negative σ is rejected; |z| > 3 is flagged', () => {
    expect(run({ sd: 0 }).warnings[0]?.key).toBe('warn.sd');
    expect(run({ mode: 'z', x: 4, mean: 0, sd: 1 }).warnings[0]?.key).toBe('warn.extreme');
  });
});

describe('z-score: properties', () => {
  it('x → z → x round-trips', () =>
    fc.assert(
      fc.property(
        fc.double({ min: -1e6, max: 1e6, noNaN: true }),
        fc.double({ min: -1e6, max: 1e6, noNaN: true }),
        fc.double({ min: 0.001, max: 1e6, noNaN: true }),
        (x, mean, sd) => {
          const z = run({ mode: 'z', x, mean, sd }).outputs.result as number;
          const back = run({ mode: 'x', x: z, mean, sd }).outputs.result as number;
          return (
            Math.abs(back - x) <= 1e-9 * Math.max(1, Math.abs(x), Math.abs(mean), sd * Math.abs(z))
          );
        },
      ),
    ));
  it('Φ is symmetric and normalInv inverts it', () =>
    fc.assert(
      fc.property(fc.double({ min: -6, max: 6, noNaN: true }), (z) => {
        const p = normalCdf(z);
        return (
          Math.abs(p + normalCdf(-z) - 1) < 1e-12 &&
          (p < 1e-9 || p > 1 - 1e-9 || Math.abs(normalInv(p) - z) < 1e-5)
        );
      }),
    ));
});

describe('z-score: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run(e.inputs);
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
