import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (known: string, vals: Record<string, number>) =>
  compute({ ...base, known, ...vals } as never, { today: '2026-11-24', fmt: makeFmt('en') })
    .outputs as Record<string, number>;
const sig3 = (x: number) => Number(x.toPrecision(3));

describe('ohms-law: references', () => {
  it('OpenStax College Physics 2e Ex 20.4: 12.0 V, 2.50 A → 4.80 Ω', () =>
    expect(run('vi', { v: 12, i: 2.5 }).r).toBe(4.8));
  it('Ex 20.7a: 2.50 A × 12.0 V = 30.0 W; 12.0² ÷ 0.350 = 411 W (exact 411.43)', () => {
    expect(run('vi', { v: 12, i: 2.5 }).p).toBe(30);
    expect(sig3(run('vr', { v: 12, r: 0.35 }).p!)).toBe(411);
  });
  it('Ex 20.7b: I = √(411 W ÷ 0.350 Ω) = 34.3 A', () =>
    expect(sig3(run('pr', { p: 411, r: 0.35 }).i!)).toBe(34.3));
  it('§20.4: 20 A × 12 V = 240 W', () => expect(run('vi', { v: 12, i: 20 }).p).toBe(240));
  it('University Physics Vol. 2 Ex 9.8: 9.00 V at 3.00 mA → 3.00 kΩ; at 2.94 kΩ → 3.06 mA', () => {
    expect(run('vi', { v: 9, i: 0.003 }).r).toBe(3000);
    expect(sig3(run('vr', { v: 9, r: 2940 }).i! * 1000)).toBe(3.06);
  });
  it('Ex 9.9: 20.00 A × 115 V = 2300 W; 666.67 W at 20.00 A → 1.67 Ω', () => {
    expect(run('vi', { v: 115, i: 20 }).p).toBe(2300);
    expect(sig3(run('pi', { p: 666.67, i: 20 }).r!)).toBe(1.67);
  });
});

describe('ohms-law: behaviour', () => {
  it('FAQ: 1,500 W on 230 V ≈ 6.52 A, on 120 V = 12.5 A; 60 W at 120 V → 240 Ω', () => {
    expect(sig3(run('pv', { p: 1500, v: 230 }).i!)).toBe(6.52);
    expect(run('pv', { p: 1500, v: 120 }).i).toBe(12.5);
    expect(run('pv', { p: 60, v: 120 }).r).toBe(240);
  });
  it('the primary result is the first unknown for each pair', () => {
    expect(run('ir', { i: 2, r: 5 }).result).toBe(10);
    expect(run('pi', { p: 30, i: 2.5 }).result).toBe(12);
    expect(run('pr', { p: 30, r: 4.8 }).result).toBe(12);
  });
  it('a zero divisor is rejected', () => {
    const r = compute({ ...base, known: 'vi', v: 12, i: 0 } as never, {
      today: '2026-11-24',
      fmt: makeFmt('en'),
    });
    expect(r.warnings[0]?.key).toBe('warn.zero');
  });
});

describe('ohms-law: properties', () => {
  it('every pair reproduces the same circuit', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 1e-3, max: 1e4, noNaN: true }),
        fc.double({ min: 1e-3, max: 1e4, noNaN: true }),
        (i, r) => {
          const c = run('ir', { i, r });
          const close = (a: number, b: number) => Math.abs(a - b) <= 1e-9 * Math.abs(b);
          return (['vi', 'vr', 'pv', 'pi', 'pr'] as const).every((pair) => {
            const x = run(pair, { [pair[0]!]: c[pair[0]!]!, [pair[1]!]: c[pair[1]!]! });
            return close(x.v!, c.v!) && close(x.i!, c.i!) && close(x.r!, c.r!) && close(x.p!, c.p!);
          });
        },
      ),
    ));
});

describe('ohms-law: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const { known, ...vals } = e.inputs as Record<string, number> & { known: string };
    const r = run(known, vals);
    for (const [k, v] of Object.entries(e.expect)) expect(r[k]).toBe(v);
  });
});
