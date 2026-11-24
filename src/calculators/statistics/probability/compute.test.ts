import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (pa: number, pb: number, relation: string, pab?: number) =>
  compute({ ...base, pa, pb, relation, ...(pab === undefined ? {} : { pab }) } as never, {
    today: '2026-11-24',
    fmt: makeFmt('en'),
  });

describe('probability: references', () => {
  it('OpenStax Contemporary Mathematics Ex 7.29: 3/6 + 1/6 = 2/3; 18/36 + 3/36 = 7/12', () => {
    expect(run(3 / 6, 1 / 6, 'exclusive').outputs.or).toBeCloseTo(2 / 3, 12);
    expect(run(18 / 36, 3 / 36, 'exclusive').outputs.or).toBeCloseTo(7 / 12, 12);
  });
  it('Ex 7.30: 0.85, 0.8 and 0.9', () => {
    expect(run(0.45, 0.6, 'given', 0.2).outputs.or).toBe(0.85);
    expect(run(0.45, 0.55, 'given', 0.2).outputs.or).toBe(0.8);
    expect(run(0.6, 0.55, 'given', 0.25).outputs.or).toBe(0.9);
  });
  it('OpenStax Intro Stats 2e Ex 3.14: 0.6 + 0.35 = 0.95', () =>
    expect(run(0.6, 0.35, 'exclusive').outputs.or).toBe(0.95));
  it('Ex 3.15: 0.65 + 0.65 − 0.585 = 0.715', () =>
    expect(run(0.65, 0.65, 'given', 0.585).outputs.or).toBe(0.715));
  it('Ex 3.9: independent 0.6 × 0.5 = 0.3', () =>
    expect(run(0.6, 0.5, 'independent').outputs.and).toBe(0.3));
  it('Ex 3.19: P(B′) = 1 − 0.143 = 0.857; Contemporary Maths Ex 7.22: 1 − 1/6 = 5/6', () => {
    expect(run(0.143, 0.85, 'given', 0.0029).outputs.notA).toBe(0.857);
    expect(run(1 / 6, 0.5, 'independent').outputs.notA).toBeCloseTo(5 / 6, 12);
  });
});

describe('probability: behaviour', () => {
  it('two coin flips: both 0.25, either 0.75, exactly one 0.5', () => {
    const r = run(0.5, 0.5, 'independent').outputs;
    expect([r.and, r.or, r.exactlyOne, r.neither]).toEqual([0.25, 0.75, 0.5, 0.25]);
  });
  it('impossible inputs are rejected', () => {
    expect(run(0.7, 0.6, 'exclusive').warnings[0]?.key).toBe('warn.exclusive');
    expect(run(0.3, 0.4, 'given', 0.5).warnings[0]?.key).toBe('warn.given');
    expect(run(0.8, 0.7, 'given', 0.1).warnings[0]?.key).toBe('warn.given');
    expect(run(1.2, 0.4, 'independent').warnings[0]?.key).toBe('warn.range');
  });
});

describe('probability: properties', () => {
  it('outputs are probabilities and the four regions sum to 1', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 1, noNaN: true }),
        fc.double({ min: 0, max: 1, noNaN: true }),
        (a, b) => {
          const r = run(a, b, 'independent').outputs as Record<string, number>;
          const all = [r.or, r.and, r.notA, r.neither, r.exactlyOne] as number[];
          return (
            all.every((x) => x >= -1e-11 && x <= 1 + 1e-11) &&
            Math.abs(r.and! + r.exactlyOne! + r.neither! - 1) < 1e-10
          );
        },
      ),
    ));
});

describe('probability: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const i = e.inputs;
    const r = run(
      Number(i.pa),
      Number(i.pb),
      String(i.relation),
      i.pab === undefined ? undefined : Number(i.pab),
    );
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
