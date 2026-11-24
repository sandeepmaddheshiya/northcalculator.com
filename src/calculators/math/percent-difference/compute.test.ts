import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-24', fmt: makeFmt('en') });

describe('percent-difference: references', () => {
  it('LibreTexts CK-12 §3.13: aluminium 2.45 vs accepted 2.70 g/cm³ → 9.26%', () =>
    expect(run({ mode: 'error', a: 2.45, b: 2.7 }).outputs.result).toBe(9.2593));
  it('TAMUCC symmetric formula on the same values: 0.25 ÷ 2.575 = 9.7087% (Python decimal)', () =>
    expect(run({ a: 2.45, b: 2.7 }).outputs.result).toBe(9.7087));
  it('TAMUCC: percent difference uses the average as the denominator', () => {
    const r = run({ a: 45, b: 55 });
    expect(r.outputs.mean).toBe(50);
    expect(r.outputs.result).toBe(20);
  });
});

describe('percent-difference: behaviour', () => {
  it('tennis balls 2.58 vs 2.61 → 1.1561%', () =>
    expect(run({ a: 2.58, b: 2.61 }).outputs.result).toBe(1.1561));
  it('80 vs 100 → 22.22%, the same in either order', () => {
    expect(run({ a: 80, b: 100 }).outputs.result).toBe(22.2222);
    expect(run({ a: 100, b: 80 }).outputs.result).toBe(22.2222);
  });
  it('percent error is not symmetric', () => {
    expect(run({ mode: 'error', a: 80, b: 100 }).outputs.result).toBe(20);
    expect(run({ mode: 'error', a: 100, b: 80 }).outputs.result).toBe(25);
  });
  it('percent error hides the mean', () =>
    expect(run({ mode: 'error', a: 1, b: 2 }).outputs.mean).toBeNull());
  it('zero accepted value and zero mean are undefined', () => {
    expect(run({ mode: 'error', a: 3, b: 0 }).warnings[0]?.key).toBe('warn.zeroAccepted');
    expect(run({ a: -5, b: 5 }).warnings[0]?.key).toBe('warn.zeroMean');
  });
  it('negative values are flagged', () =>
    expect(run({ a: -4, b: 10 }).warnings[0]?.key).toBe('warn.negative'));
  it('identical values give 0%', () => expect(run({ a: 7, b: 7 }).outputs.result).toBe(0));
});

describe('percent-difference: properties', () => {
  const pos = fc.double({ min: 0.001, max: 1e6, noNaN: true });
  it('percent difference is symmetric and at most 200% for positive values', () =>
    fc.assert(
      fc.property(pos, pos, (a, b) => {
        const x = run({ a, b }).outputs.result as number;
        return x === run({ a: b, b: a }).outputs.result && x <= 200;
      }),
    ));
  it('percent difference lies between the two percent errors', () =>
    fc.assert(
      fc.property(pos, pos, (a, b) => {
        const d = run({ a, b }).outputs.result as number;
        const e1 = run({ mode: 'error', a, b }).outputs.result as number;
        const e2 = run({ mode: 'error', a: b, b: a }).outputs.result as number;
        return d >= Math.min(e1, e2) - 1e-3 && d <= Math.max(e1, e2) + 1e-3;
      }),
    ));
});

describe('percent-difference: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run({ ...e.inputs });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
