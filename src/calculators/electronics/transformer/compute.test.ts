import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { content } from './content.en';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-25');
const solve = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, {
    today: '2026-11-25',
    fmt: makeFmt('en'),
    t: (k) => content.ui[k] ?? k,
  });
type Out = Record<'result' | 'ratio' | 'vs' | 'ns' | 'ip' | 'is' | 'power', number>;
const out = (inputs: Record<string, unknown>) => solve(inputs).outputs as unknown as Out;
const sig = (x: number, d: number) => Number(x.toPrecision(d));

describe('transformer: references (OpenStax College Physics 2e §23.7)', () => {
  it('Ex 23.5: 120 V → 100 kV, 50 loops, 10.00 A → 4.17 × 10⁴ loops, 12.0 mA, 1.20 kW', () => {
    const o = out({ find: 'ns', vp: 120, np: 50, vs: 100000, side: 'p', current: 10 });
    expect([sig(o.result, 3), sig(o.is, 3), o.power]).toEqual([41700, 0.012, 1200]);
    expect(
      solve({ find: 'ns', vp: 120, np: 50, vs: 100000, side: 'p', current: 10 }).outputs.kind,
    ).toBe('Step-up');
  });
  it('Ex 23.6: 120 V → 15.0 V, 200 loops, 16.0 A → 25 loops, 2.00 A, 240 W', () => {
    const o = out({ find: 'ns', vp: 120, np: 200, vs: 15, side: 's', current: 16 });
    expect([o.result, o.ip, o.power]).toEqual([25, 2, 240]);
  });
});

describe('transformer: references (OpenStax University Physics Vol. 2 §15.6)', () => {
  it('Ex 15.6: 12 kV → 240 V is 1/50; 2.0 A in → 100 A out; loss 800 W vs 2 × 10⁶ W', () => {
    const o = out({ find: 'ns', vp: 12000, np: 50, vs: 240, side: 'p', current: 2 });
    expect([o.ratio, o.is]).toEqual([0.02, 100]);
    expect([o.ip ** 2 * 200, o.is ** 2 * 200]).toEqual([800, 2e6]);
  });
});

describe('transformer: behaviour', () => {
  it('secondary voltage from turns; step-down label', () => {
    const r = solve({ find: 'vs', vp: 240, np: 1000, ns: 50, side: 'p', current: 1 });
    expect([r.outputs.result, r.outputs.kind]).toEqual([12, 'Step-down']);
  });
  it('fractional turns are flagged; non-positive inputs explained', () => {
    expect(solve({ find: 'ns', vp: 120, np: 50, vs: 100000 }).warnings[0]?.key).toBe('warn.whole');
    expect(solve({ find: 'vs', vp: 0, np: 10, ns: 5 }).warnings[0]?.key).toBe('warn.positive');
  });
});

describe('transformer: properties', () => {
  it('power is conserved and V/N is the same on both sides', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 1, max: 1e5, noNaN: true }),
        fc.double({ min: 1, max: 1e5, noNaN: true }),
        fc.double({ min: 1, max: 1e5, noNaN: true }),
        fc.double({ min: 0.001, max: 1000, noNaN: true }),
        (vp, np, ns, i) => {
          const o = out({ find: 'vs', vp, np, ns, side: 'p', current: i });
          return (
            Math.abs(o.is * o.vs - o.ip * vp) <= 1e-9 * o.ip * vp &&
            Math.abs(o.vs / ns - vp / np) <= 1e-9 * (vp / np)
          );
        },
      ),
    ));
});

describe('transformer: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = solve(e.inputs).outputs;
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
