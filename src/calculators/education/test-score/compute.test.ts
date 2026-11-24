import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-24', fmt: makeFmt('en') });

describe('test-score: references', () => {
  it('OpenStax Prealgebra 2e Ex 6.54: 9 of 72 = 12.5%', () =>
    expect(run({ total: 72, mode: 'right', n: 9 }).outputs.percent).toBe(12.5));
  it('OpenStax Prealgebra 2e Ex 6.51: 36 of 80 = 45%', () =>
    expect(run({ total: 80, mode: 'right', n: 36 }).outputs.percent).toBe(45));
  it('CSU Chico: 50 of 60 = 83.3%', () =>
    expect(run({ total: 60, mode: 'right', n: 50 }).outputs.percent).toBe(83.3333));
});

describe('test-score: behaviour', () => {
  it('3 wrong of 40 = 92.5%, an A; 2.5 points per question', () => {
    const r = run({ total: 40, mode: 'wrong', n: 3 });
    expect([r.outputs.percent, r.outputs.letter, r.outputs.perItem]).toEqual([92.5, 'A', 2.5]);
  });
  it('FAQ: 7 wrong of 50 = 86%; 18 of 20 = 90%', () => {
    expect(run({ total: 50, mode: 'wrong', n: 7 }).outputs.percent).toBe(86);
    expect(run({ total: 20, mode: 'right', n: 18 }).outputs.percent).toBe(90);
  });
  it('FAQ: 51 of 60 points = 85%', () =>
    expect(run({ total: 60, mode: 'right', n: 51 }).outputs.percent).toBe(85));
  it('FAQ: 3 misses of 25 = 88%', () =>
    expect(run({ total: 25, mode: 'wrong', n: 3 }).outputs.percent).toBe(88));
  it('partial credit with decimals', () =>
    expect(run({ total: 20, mode: 'wrong', n: 1.5 }).outputs.percent).toBe(92.5));
  it('too many wrong and zero totals are rejected', () => {
    expect(run({ total: 10, n: 11 }).warnings[0]?.key).toBe('warn.tooManyWrong');
    expect(run({ total: 0 }).warnings[0]?.key).toBe('warn.total');
  });
  it('bonus points above 100% are noted', () =>
    expect(run({ total: 50, mode: 'right', n: 52 }).warnings[0]?.key).toBe('warn.extra'));
});

describe('test-score: properties', () => {
  it('right and wrong modes agree', () =>
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 500 }), fc.integer({ min: 0, max: 500 }), (t, w) => {
        fc.pre(w <= t);
        return (
          run({ total: t, mode: 'wrong', n: w }).outputs.percent ===
          run({ total: t, mode: 'right', n: t - w }).outputs.percent
        );
      }),
    ));
});

describe('test-score: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run({ ...e.inputs });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
