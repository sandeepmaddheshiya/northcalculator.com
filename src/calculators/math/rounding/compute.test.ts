import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute, parseDecimal } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-24', fmt: makeFmt('en') });
const sf = (value: string, digits: number, method = 'halfEven') =>
  run({ value, to: 'sf', digits, method }).outputs.result;
const dp = (value: string, digits: number, method = 'halfUp') =>
  run({ value, to: 'dp', digits, method }).outputs.result;

describe('rounding: references (OpenStax Chemistry 2e §1.5, half to even)', () => {
  it('Example 1.3', () => {
    expect(sf('31.57', 2)).toBe('32');
    expect(sf('8.1649', 3)).toBe('8.16');
    expect(sf('0.051065', 4)).toBe('0.05106');
    expect(sf('0.90275', 4)).toBe('0.9028');
  });
  it('Check Your Learning 1.3', () => {
    expect(sf('0.424', 2)).toBe('0.42');
    expect(sf('0.0038661', 3)).toBe('0.00387');
    expect(sf('421.25', 4)).toBe('421.2');
    expect(sf('28,683.5', 5)).toBe('28684');
  });
  it('rule illustrations: 0.028675, 18.3384, 6.8752, 92.85 to three figures', () => {
    expect(sf('0.028675', 3)).toBe('0.0287');
    expect(sf('18.3384', 3)).toBe('18.3');
    expect(sf('6.8752', 3)).toBe('6.88');
    expect(sf('92.85', 3)).toBe('92.8');
  });
  it('counting: 70.607 → 5, 0.00832407 → 6, 55.0 → 3, 1.30e3 → 3', () => {
    expect(parseDecimal('70.607')?.sig).toBe(5);
    expect(parseDecimal('0.00832407')?.sig).toBe(6);
    expect(parseDecimal('55.0')?.sig).toBe(3);
    expect(parseDecimal('1.30e3')?.sig).toBe(3);
    expect(parseDecimal('1300')?.sig).toBe(2);
  });
});

describe('rounding: references (OpenStax Prealgebra 2e §5.1, half up)', () => {
  it('Ex 5.9–5.10: 18.379 → 18.38, 18.4, 18', () => {
    expect(dp('18.379', 2)).toBe('18.38');
    expect(dp('18.379', 1)).toBe('18.4');
    expect(dp('18.379', 0)).toBe('18');
  });
  it('2.72 → 3 and 2.7; $3.279 → $3.28', () => {
    expect(dp('2.72', 0)).toBe('3');
    expect(dp('2.72', 1)).toBe('2.7');
    expect(dp('3.279', 2)).toBe('3.28');
  });
});

describe('rounding: behaviour', () => {
  it('every method on ±2.5', () => {
    const r = (m: string, v: string) => dp(v, 0, m);
    expect(
      ['halfUp', 'halfEven', 'halfDown', 'up', 'down', 'ceiling', 'floor'].map((m) => r(m, '2.5')),
    ).toEqual(['3', '2', '2', '3', '2', '3', '2']);
    expect(
      ['halfUp', 'halfEven', 'halfDown', 'up', 'down', 'ceiling', 'floor'].map((m) => r(m, '-2.5')),
    ).toEqual(['-3', '-2', '-2', '-3', '-2', '-2', '-3']);
  });
  it('2.675 to 2 places is 2.68 (no binary floating-point surprise)', () =>
    expect(dp('2.675', 2)).toBe('2.68'));
  it('negative places round to tens and hundreds', () => {
    expect(dp('2,749', -2)).toBe('2700');
    expect(dp('2,749', -1)).toBe('2750');
    expect(dp('48,250', -2, 'halfEven')).toBe('48200');
  });
  it('pads to the requested places', () => {
    expect(dp('2.5', 3)).toBe('2.500');
    expect(sf('2.5', 4)).toBe('2.500');
  });
  it('a carry does not add a significant figure: 9.99 → 10 (2 sf)', () =>
    expect(sf('9.99', 2)).toBe('10'));
  it('scientific notation output', () => {
    expect(
      run({ value: '0.051065', to: 'sf', digits: 4, method: 'halfEven' }).outputs.scientific,
    ).toBe('5.106 × 10⁻²');
    expect(run({ value: '1234', to: 'sf', digits: 2 }).outputs.scientific).toBe('1.2 × 10³');
  });
  it('rounding to zero drops the minus sign', () => expect(dp('-0.004', 2)).toBe('0.00'));
  it('exponent input', () => expect(sf('6.02214076e23', 3)).toBe('602000000000000000000000'));
  it('rejects text and zero significant figures', () => {
    expect(run({ value: 'abc' }).warnings[0]?.key).toBe('warn.parse');
    expect(run({ to: 'sf', digits: 0 }).warnings[0]?.key).toBe('warn.sf');
  });
});

describe('rounding: properties', () => {
  it('half-up to whole numbers matches Math.round for positive halves and non-halves', () =>
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1_000_000 }),
        fc.integer({ min: 0, max: 999 }),
        (i, f) => {
          const s = `${i}.${String(f).padStart(3, '0')}`;
          const expected = f >= 500 ? i + 1 : i;
          return dp(s, 0) === String(expected);
        },
      ),
    ));
  it('the rounded value is within half a unit of the input', () =>
    fc.assert(
      fc.property(
        fc.integer({ min: -1e9, max: 1e9 }),
        fc.integer({ min: 0, max: 4 }),
        (n, places) => {
          const s = (n / 1e4).toFixed(4);
          const r = Number(dp(s, places, 'halfEven'));
          return Math.abs(r - Number(s)) <= 0.5 * 10 ** -places + 1e-9;
        },
      ),
    ));
});

describe('rounding: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run({ ...e.inputs });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
