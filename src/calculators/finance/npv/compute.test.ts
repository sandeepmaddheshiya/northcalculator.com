import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute, irr, npv, payback, parseFlows } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-25');
const solve = (rate: number, flows: string) =>
  compute({ ...base, rate, flows, cur: 'USD' } as never, {
    today: '2026-11-25',
    fmt: makeFmt('en', 'USD'),
  });
const out = (rate: number, flows: string) => solve(rate, flows).outputs as Record<string, number>;
const SAM = '-16000, 2000, 4000, 5000, 5000, 5000, 5000';
const samFlows = parseFlows(SAM).flows;

describe('npv: references (OpenStax Principles of Finance ch. 16)', () => {
  it('§16.2: NPV at 9% = 2,835.62 exact (book 2,835.63 from rounded PV terms)', () => {
    expect(out(9, SAM).npv).toBe(2835.62);
    const terms = [1834.86, 3366.72, 3860.92, 3542.13, 3249.66, 2981.34];
    expect(Math.round((terms.reduce((a, b) => a + b, 0) - 16000) * 100) / 100).toBe(2835.63);
  });
  it('Table 16.6 NPV profile: 10,000 at 0%, 7,231 at 3%, 1,081 at 12%, 42 at 14%, −442 at 15%, −1,773 at 18%, −2,939 at 21%', () =>
    expect([0, 3, 12, 14, 15, 18, 21].map((r) => Math.round(npv(r / 100, samFlows)))).toEqual([
      10000, 7231, 1081, 42, -442, -1773, -2939,
    ]));
  it('§16.3: IRR = 14.09%', () => expect(Math.round(irr(samFlows)! * 10000) / 100).toBe(14.09));
  it('§16.1: payback four years; projects B, C, D five years', () => {
    expect(payback(samFlows)).toBe(4);
    expect(payback([-16000, 1000, 2000, 3000, 4000, 6000])).toBe(5);
    expect(payback([-16000, 6000, 4000, 3000, 2000, 1000])).toBe(5);
    expect(payback([-16000, 1000, 2000, 3000, 4000, 6000, 8000])).toBe(5);
  });
  it('§16.2: second project → 26,946.90', () =>
    expect(out(9, '-30000, 6000, 8000, 10000, 12000, 14000, 16000, 18000').npv).toBe(26946.9));
});

describe('npv: references (OpenStax Principles of Accounting Vol. 2 §11.4, table factors)', () => {
  it('X-ray: 200,000, 40,000 × 10 at 8% → 68,403.26 exact (book 68,400 with factor 6.710); PI 1.342', () => {
    const o = out(8, ['-200000', ...Array(10).fill('40000')].join(' '));
    expect(o.npv).toBe(68403.26);
    expect(Math.round(o.pi! * 1000) / 1000).toBe(1.342);
    expect(6.71 * 40000 - 200000).toBe(68400);
  });
  it('Yellow Industries: 135,000, 40,000 × 5 at 10% → 16,631.47 exact (book 16,640 with factor 3.791)', () => {
    expect(out(10, ['-135000', ...Array(5).fill('40000')].join(' ')).npv).toBe(16631.47);
    expect(Math.round(3.791 * 40000 - 135000)).toBe(16640);
  });
  it('Rayford unequal flows at 5% → negative NPV (−5,021.84 exact; book (5,018))', () =>
    expect(out(5, '-50000 10000 5000 7000 3000 10000 10000 10000').npv).toBe(-5021.84));
});

describe('npv: behaviour', () => {
  it('thousands separators, parentheses and currency symbols parse', () => {
    expect(parseFlows('(16,000) $2,000, 4000').flows).toEqual([-16000, 2000, 4000]);
    expect(parseFlows('-1,2,3').flows).toEqual([-1, 2, 3]);
  });
  it('the two-IRR example is flagged', () =>
    expect(solve(10, '-350 950 -620').warnings.some((w) => w.key === 'warn.multiple')).toBe(true));
  it('never-recovered projects have no payback; too few flows rejected', () => {
    expect(out(5, '-100 10 10').payback).toBeNull();
    expect(solve(5, '-100').warnings[0]?.key).toBe('warn.flows');
  });
});

describe('npv: properties', () => {
  it('NPV at the IRR is zero', () =>
    fc.assert(
      fc.property(
        fc.integer({ min: 100, max: 1e6 }),
        fc.array(fc.integer({ min: 1, max: 1e6 }), { minLength: 1, maxLength: 15 }),
        (cost, ins) => {
          const flows = [-cost, ...ins];
          const r = irr(flows);
          return (
            r === null || Math.abs(npv(r, flows)) <= 1e-6 * (cost + ins.reduce((a, b) => a + b, 0))
          );
        },
      ),
    ));
});

describe('npv: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = out(Number(e.inputs.rate), String(e.inputs.flows));
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
