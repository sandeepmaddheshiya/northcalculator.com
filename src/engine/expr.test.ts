import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { evaluate, MAX_LENGTH } from './expr';
import { clean } from './money';

const v = (s: string, mode: 'deg' | 'rad' = 'deg', ans?: number) => {
  const r = evaluate(s, { mode, ans });
  if (!r.ok) throw new Error(`${s} → ${r.error}`);
  return clean(r.value);
};
const err = (s: string, mode: 'deg' | 'rad' = 'deg') => {
  const r = evaluate(s, { mode });
  return r.ok ? 'ok' : r.error;
};

describe('expression evaluator', () => {
  it.each([
    ['1+2*3', 7],
    ['(1+2)*3', 9],
    ['2^3^2', 512],
    ['-2^2', -4],
    ['(-2)^2', 4],
    ['2^-1', 0.5],
    ['10/4', 2.5],
    ['7−2', 5],
    ['6÷3×2', 4],
    ['2π', clean(2 * Math.PI)],
    ['3(4+1)', 15],
    ['(1+1)(2+2)', 8],
    ['2sin(30)', 1],
    ['5!', 120],
    ['0!', 1],
    ['3!!', 720],
    ['50%', 0.5],
    ['200*15%', 30],
    ['√16', 4],
    ['√(9)+1', 4],
    ['sqrt(2)^2', 2],
    ['cbrt(-27)', -3],
    ['1e3+1', 1001],
    ['2.5E-3*1000', 2.5],
    ['ln(e)', 1],
    ['log(1000)', 3],
    ['log2(8)', 3],
    ['abs(-3.5)', 3.5],
    ['exp(0)', 1],
    ['ans*2', 84],
    ['  1 +  1 ', 2],
  ])('%s = %s', (expr, expected) => {
    expect(v(expr, 'deg', 42)).toBe(expected);
  });

  it('trigonometry in degrees is exact at special angles', () => {
    expect(v('sin(30)')).toBe(0.5);
    expect(v('cos(60)')).toBe(0.5);
    expect(v('sin(180)')).toBe(0);
    expect(v('cos(90)')).toBe(0);
    expect(v('tan(45)')).toBe(1);
    expect(v('tan(180)')).toBe(0);
    expect(v('sin(-90)')).toBe(-1);
    expect(v('asin(1)')).toBe(90);
    expect(v('atan(1)')).toBe(45);
    expect(err('tan(90)')).toBe('domain');
    expect(err('tan(270)')).toBe('domain');
  });

  it('trigonometry in radians', () => {
    expect(v('sin(pi/2)', 'rad')).toBe(1);
    expect(v('cos(pi)', 'rad')).toBe(-1);
    expect(v('asin(1)', 'rad')).toBe(clean(Math.PI / 2));
  });

  it.each([
    ['', 'empty'],
    ['1+', 'syntax'],
    ['(1+2', 'syntax'],
    ['1+2)', 'syntax'],
    ['2**3', 'syntax'],
    ['1..2', 'syntax'],
    ['foo(2)', 'syntax'],
    ['1 $ 2', 'syntax'],
    ['1/0', 'divzero'],
    ['sqrt(-1)', 'domain'],
    ['ln(0)', 'domain'],
    ['log(-5)', 'domain'],
    ['asin(2)', 'domain'],
    ['(-8)^(1/3)', 'domain'],
    ['2.5!', 'domain'],
    ['(-1)!', 'domain'],
    ['171!', 'overflow'],
    ['10^400', 'overflow'],
  ])('%j → %s', (expr, code) => {
    expect(err(expr)).toBe(code);
  });

  it('enforces input limits (no runaway computation)', () => {
    expect(err('1+'.repeat(MAX_LENGTH))).toBe('tooLong');
    expect(err('('.repeat(150) + '1' + ')'.repeat(150))).toBe('tooDeep');
    expect(err('2^'.repeat(120) + '1')).toBe('tooDeep');
  });

  it('never throws on arbitrary input (property)', () => {
    fc.assert(
      fc.property(
        fc.string({
          maxLength: 120,
          unit: fc.constantFrom(...'0123456789.+-*/^()!%√πe sincotalgqrbxp,'.split('')),
        }),
        (s) => {
          const r = evaluate(s);
          return r.ok ? typeof r.value === 'number' : typeof r.error === 'string';
        },
      ),
      { numRuns: 5000 },
    );
  });

  it('matches JS arithmetic for random + − × expressions (property)', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: -999, max: 999 }), { minLength: 2, maxLength: 8 }),
        fc.array(fc.constantFrom('+', '-', '*'), { minLength: 7, maxLength: 7 }),
        (nums, ops) => {
          const parts = nums.map((n, i) => (i === 0 ? `(${n})` : `${ops[i - 1]}(${n})`)).join('');
          // Reference: left-to-right with × precedence computed independently.
          const terms: number[] = [nums[0]!];
          const signs: string[] = [];
          nums.slice(1).forEach((n, i) => {
            const op = ops[i]!;
            if (op === '*') terms[terms.length - 1] = terms[terms.length - 1]! * n;
            else {
              signs.push(op);
              terms.push(n);
            }
          });
          const expected = terms
            .slice(1)
            .reduce((acc, t, i) => (signs[i] === '+' ? acc + t : acc - t), terms[0]!);
          const r = evaluate(parts);
          return r.ok && r.value === expected;
        },
      ),
      { numRuns: 2000 },
    );
  });
});
