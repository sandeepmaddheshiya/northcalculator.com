import { describe, expect, it } from 'vitest';
import { makeFmt } from '@/calculators/fmt';
import { decodeState, defaultValues, encodeState } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const ctx = { today: '2026-11-24', fmt: makeFmt('en') };
const run = (expr: string, angle = 'deg', ans?: number) =>
  compute({ expr, angle, ...(ans === undefined ? {} : { ans }) }, ctx);
const val = (expr: string, angle = 'deg') => run(expr, angle).outputs.result;

describe('scientific: order of operations, OpenStax Prealgebra 2e §2.1 (verified 2026-11-24)', () => {
  it('Ex 2.7: 3^4 = 81', () => expect(val('3^4')).toBe(81));
  it('Ex 2.8a: 4 + 3·7 = 25', () => expect(val('4 + 3·7')).toBe(25));
  it('Ex 2.8b: (4 + 3)·7 = 49', () => expect(val('(4 + 3)·7')).toBe(49));
  it('Ex 2.9a: 18 ÷ 9 · 2 = 4 (left to right)', () => expect(val('18 ÷ 9 · 2')).toBe(4));
  it('Ex 2.9b: 18 · 9 ÷ 2 = 81', () => expect(val('18 · 9 ÷ 2')).toBe(81));
  it('Ex 2.10: 18 ÷ 6 + 4(5 − 2) = 15', () => expect(val('18 ÷ 6 + 4(5 − 2)')).toBe(15));
  it('Ex 2.11: 5 + 2³ + 3[6 − 3(4 − 2)] = 13 (brackets as parentheses)', () =>
    expect(val('5 + 2^3 + 3(6 − 3(4 − 2))')).toBe(13));
  it('Ex 2.12: 2³ + 3⁴ ÷ 3 − 5² = 10', () => expect(val('2^3 + 3^4 ÷ 3 − 5^2')).toBe(10));
});

describe('scientific: elementary functions (NIST DLMF chapter 4 special values)', () => {
  it('sin 30° = 1/2, cos 60° = 1/2, tan 45° = 1 exactly in degree mode', () => {
    expect(val('sin(30)')).toBe(0.5);
    expect(val('cos(60)')).toBe(0.5);
    expect(val('tan(45)')).toBe(1);
  });
  it('sin(π/6) = 1/2 in radian mode', () => expect(val('sin(π/6)', 'rad')).toBe(0.5));
  it('ln e = 1, log 1000 = 3, e^(ln 2) = 2', () => {
    expect(val('ln(e)')).toBe(1);
    expect(val('log(1000)')).toBe(3);
    expect(val('exp(ln(2))')).toBe(2);
  });
  it('constants to 12 significant digits', () => {
    expect(val('π')).toBe(3.14159265359);
    expect(val('e')).toBe(2.71828182846);
    expect(val('√2')).toBe(1.41421356237);
  });
  it('asin(1) = 90° and π/2 rad', () => {
    expect(val('asin(1)')).toBe(90);
    expect(val('asin(1)', 'rad')).toBe(1.57079632679);
  });
});

describe('scientific: behaviour', () => {
  it('factorials and combinations: C(52,5) = 2,598,960 poker hands', () =>
    expect(val('52! ÷ (5! × 47!)')).toBe(2598960));
  it('170! is the largest factorial a double holds', () => {
    expect(val('170!')).toBe(7.25741561531e306);
    expect(run('171!').warnings[0]?.key).toBe('err.overflow');
  });
  it('percent and implicit multiplication', () => {
    expect(val('200 × 15%')).toBe(30);
    expect(val('2π')).toBe(6.28318530718);
  });
  it('Ans recalls the previous answer', () =>
    expect(run('Ans × 2', 'deg', 21).outputs.result).toBe(42));
  it('binary noise is removed: 0.1 + 0.2 = 0.3', () => expect(val('0.1 + 0.2')).toBe(0.3));
  it('errors are reported with their position', () => {
    expect(run('1/0').warnings[0]?.key).toBe('err.divzero');
    expect(run('sqrt(-1)').warnings[0]?.key).toBe('err.domain');
    expect(run('2 +').warnings[0]?.key).toBe('err.syntax');
    expect(run('tan(90)').warnings[0]?.key).toBe('err.domain');
  });
  it('an empty expression shows nothing, not an error', () =>
    expect(run('').warnings).toHaveLength(0));
  it('expressions survive the URL round trip', () => {
    const d = defaultValues(definition, '2026-11-24');
    const q = encodeState(definition, { expr: '√(2)+3×(4−1)^2', angle: 'rad' }, d);
    expect(decodeState(definition, `?${q}`)).toEqual({ expr: '√(2)+3×(4−1)^2', angle: 'rad' });
  });
});

describe('scientific: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = compute({ angle: 'deg', ...e.inputs } as never, ctx);
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
