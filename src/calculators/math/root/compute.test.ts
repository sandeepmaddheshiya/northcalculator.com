import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute, simplifyRadical } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (x: number, n = 2) =>
  compute({ ...base, x, n } as never, { today: '2026-11-24', fmt: makeFmt('en') });

describe('root: references (OpenStax Intermediate Algebra 2e §8.1)', () => {
  it('Ex 8.1: √144 = 12', () => expect(run(144).outputs.root).toBe(12));
  it('Ex 8.3: ∛64 = 4, ⁴√81 = 3, ⁵√32 = 2', () => {
    expect(run(64, 3).outputs.root).toBe(4);
    expect(run(81, 4).outputs.root).toBe(3);
    expect(run(32, 5).outputs.root).toBe(2);
  });
  it('Ex 8.4: ∛−125 = −5, ⁵√−243 = −3, ⁴√−16 not real', () => {
    expect(run(-125, 3).outputs.root).toBe(-5);
    expect(run(-243, 5).outputs.root).toBe(-3);
    expect(run(-16, 4).warnings[0]?.key).toBe('warn.notReal');
  });
  it('Ex 8.5: √105 between 10 and 11; ∛43 between 3 and 4', () => {
    expect(run(105).outputs.between).toBe('10 and 11');
    expect(run(43, 3).outputs.between).toBe('3 and 4');
  });
  it('Ex 8.6: √17 ≈ 4.12, ∛49 ≈ 3.66, ⁴√51 ≈ 2.67', () => {
    expect(run(17).outputs.root as number).toBeCloseTo(4.12, 2);
    expect(run(49, 3).outputs.root as number).toBeCloseTo(3.66, 2);
    expect(run(51, 4).outputs.root as number).toBeCloseTo(2.67, 2);
  });
});

describe('root: behaviour', () => {
  it('simplifies radicals: √72 = 6√2, √200 = 10√2, ∛54 = 3∛2', () => {
    expect(run(72).outputs.simplified).toBe('6√2');
    expect(run(200).outputs.simplified).toBe('10√2');
    expect(run(54, 3).outputs.simplified).toBe('3∛2');
  });
  it('already simplest: √15', () => expect(run(15).outputs.simplified).toBe('√15'));
  it('perfect powers have no "between"', () => expect(run(144).outputs.between).toBeNull());
  it('negative odd roots lie between negative integers', () =>
    expect(run(-17, 3).outputs.between).toBe('-3 and -2'));
  it('decimals get a decimal root only', () => {
    const r = run(2.25);
    expect(r.outputs.root).toBe(1.5);
    expect(r.outputs.simplified).toBeNull();
  });
  it('high index symbol', () => expect(run(96, 5).outputs.simplified).toBe('2⁵√3'));
  it('√0 = 0', () => expect(run(0).outputs.root).toBe(0));
});

describe('root: properties', () => {
  it('out^n × inside reconstructs the number', () =>
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 1e9 }), fc.integer({ min: 2, max: 6 }), (x, n) => {
        const { out, inside } = simplifyRadical(x, n);
        return out ** n * inside === x;
      }),
    ));
  it('root^n returns the number', () =>
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 1e9 }), fc.integer({ min: 2, max: 5 }), (x, n) => {
        const r = run(x, n).outputs.root as number;
        return Math.abs(r ** n - x) <= 1e-9 * x;
      }),
    ));
});

describe('root: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = compute({ ...base, ...e.inputs } as never, {
      today: '2026-11-24',
      fmt: makeFmt('en'),
    });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
