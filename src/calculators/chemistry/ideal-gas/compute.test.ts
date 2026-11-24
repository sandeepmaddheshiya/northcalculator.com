import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute, R } from './compute';
import { content } from './content.en';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, {
    today: '2026-11-24',
    fmt: makeFmt('en'),
    t: (k) => content.ui[k] ?? k,
  }).outputs as Record<string, number | string>;
const sig = (x: unknown, d: number) => Number((x as number).toPrecision(d));

describe('ideal-gas: references', () => {
  it('NIST CODATA: R = 8.314462618 J/(mol·K); OpenStax 0.08206 L·atm/(mol·K)', () => {
    expect(R).toBe(8.314462618);
    expect(Number((R / 101.325).toFixed(5))).toBe(0.08206);
  });
  it('OpenStax Chemistry 2e Ex 9.9: 40.8 mol, 298 K, 0.980 atm → 1.02 × 10³ L', () => {
    expect(sig(run({ find: 'v', n: 40.8, t: 298, tu: 'K', p: 0.98, pu: 'atm' }).L, 3)).toBe(1020);
    expect(sig(run({ find: 'v', n: 40.8, t: 25, tu: 'C', p: 745, pu: 'torr' }).L, 3)).toBe(1020);
  });
  it('§9.2 check: 2520 mol at 27 °C in 180 L → 350 bar', () =>
    expect(
      sig((run({ find: 'p', n: 2520, t: 27, tu: 'C', v: 180, vu: 'L' }).kPa as number) / 100, 2),
    ).toBe(350));
  it('§9.2: one mole at STP (273.15 K, 1 atm) ≈ 22.4 L', () =>
    expect(sig(run({ find: 'v', n: 1, t: 273.15, tu: 'K', p: 1, pu: 'atm' }).L, 3)).toBe(22.4));
});

describe('ideal-gas: behaviour', () => {
  it('FAQ molar volumes: 22.711 L at 0 °C and 1 bar, 24.465 L at 25 °C and 1 atm', () => {
    expect(sig(run({ find: 'v', n: 1, t: 0, tu: 'C', p: 1, pu: 'bar' }).L, 5)).toBe(22.711);
    expect(sig(run({ find: 'v', n: 1, t: 25, tu: 'C', p: 1, pu: 'atm' }).L, 5)).toBe(24.465);
  });
  it('solves for n and T; °F converts through kelvin', () => {
    expect(
      sig(run({ find: 'n', p: 1, pu: 'atm', v: 22.413969545, vu: 'L', t: 0, tu: 'C' }).mol, 9),
    ).toBe(1);
    // Use the unrounded molar volume so the temperature lands exactly on the ice point.
    const v = (R * 273.15) / 101.325;
    expect(sig(run({ find: 't', p: 1, pu: 'atm', v, vu: 'L', n: 1, tu: 'K' }).K, 12)).toBe(273.15);
    const f = run({ find: 't', p: 1, pu: 'atm', v, vu: 'L', n: 1, tu: 'F' }).result;
    expect(Math.abs(Number(String(f).replace(' °F', '')) - 32)).toBeLessThan(1e-9);
  });
  it('below absolute zero or zero amounts are rejected', () => {
    const w = (i: Record<string, unknown>) =>
      compute({ ...base, ...i } as never, { today: '', fmt: makeFmt('en') }).warnings[0]?.key;
    expect(w({ find: 'v', t: -300, tu: 'C', p: 1, n: 1 })).toBe('warn.kelvin');
    expect(w({ find: 'v', t: 20, tu: 'C', p: 1, n: 0 })).toBe('warn.zero');
  });
});

describe('ideal-gas: properties', () => {
  it('solving for each variable recovers the others', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 1, max: 10000, noNaN: true }),
        fc.double({ min: 0.01, max: 10000, noNaN: true }),
        fc.double({ min: 1, max: 2000, noNaN: true }),
        (pKpa, vL, tK) => {
          const n = run({ find: 'n', p: pKpa, pu: 'kPa', v: vL, vu: 'L', t: tK, tu: 'K' })
            .mol as number;
          const p = run({ find: 'p', n, v: vL, vu: 'L', t: tK, tu: 'K', pu: 'kPa' }).kPa as number;
          const k = run({ find: 't', n, v: vL, vu: 'L', p: pKpa, pu: 'kPa', tu: 'K' }).K as number;
          return Math.abs(p - pKpa) <= 1e-9 * pKpa && Math.abs(k - tK) <= 1e-9 * tK;
        },
      ),
    ));
});

describe('ideal-gas: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = run(e.inputs);
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
