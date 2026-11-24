import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (x: number, baseKind = '10', b?: number) =>
  compute({ ...base, x, baseKind, ...(b === undefined ? {} : { b }) } as never, {
    today: '2026-11-24',
    fmt: makeFmt('en'),
  });

describe('logarithm: references (OpenStax Intermediate Algebra 2e §10.3)', () => {
  it('Ex 10.21: log₅ 25 = 2, log₉ 3 = 1/2, log₂ (1/16) = −4', () => {
    expect(run(25, 'custom', 5).outputs.result).toBe(2);
    expect(run(3, 'custom', 9).outputs.result).toBe(0.5);
    expect(run(1 / 16, '2').outputs.result).toBe(-4);
  });
  it('Ex 10.20: log_(1/2) (1/8) = 3; log₄ 64 = 3', () => {
    expect(run(0.125, 'custom', 0.5).outputs.result).toBe(3);
    expect(run(64, 'custom', 4).outputs.result).toBe(3);
  });
  it('Ex 10.26: log 10¹⁰ = 10 (decibel model)', () => expect(run(1e10).outputs.result).toBe(10));
  it('Ex 10.25: ln e⁴ = 4', () => expect(run(Math.E ** 4, 'e').outputs.result).toBe(4));
});

describe('logarithm: behaviour', () => {
  it('log 1000 = 3 and ln 1000 = 6.90775527898', () => {
    const r = run(1000);
    expect(r.outputs.result).toBe(3);
    expect(r.outputs.ln).toBe(6.90775527898);
  });
  it('doubling time at 7%: log_1.07 2 = 10.2447683511', () =>
    expect(run(2, 'custom', 1.07).outputs.result).toBe(10.2447683511));
  it('log₂ 1024 = 10', () => expect(run(1024, '2').outputs.result).toBe(10));
  it('log 1 = 0 in any base', () => expect(run(1, 'custom', 7).outputs.result).toBe(0));
  it('invalid inputs', () => {
    expect(run(0).warnings[0]?.key).toBe('warn.x');
    expect(run(5, 'custom', 1).warnings[0]?.key).toBe('warn.base');
    expect(run(5, 'custom', -2).warnings[0]?.key).toBe('warn.base');
  });
  it('fractions give negative logs and a note', () => {
    const r = run(0.01);
    expect(r.outputs.result).toBe(-2);
    expect(r.warnings[0]?.key).toBe('warn.negative');
  });
});

describe('logarithm: properties', () => {
  const pos = fc.double({ min: 1e-6, max: 1e9, noNaN: true });
  it('log(MN) = log M + log N', () =>
    fc.assert(
      fc.property(
        pos,
        pos,
        (m, n) =>
          Math.abs(
            (run(m * n).outputs.result as number) -
              (run(m).outputs.result as number) -
              (run(n).outputs.result as number),
          ) < 1e-9,
      ),
    ));
  it('b^(log_b x) = x', () =>
    fc.assert(
      fc.property(pos, fc.double({ min: 1.01, max: 100, noNaN: true }), (x, b) => {
        const y = run(x, 'custom', b).outputs.result as number;
        return Math.abs(b ** y - x) <= 1e-9 * Math.max(1, x);
      }),
    ));
});

describe('logarithm: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = compute({ ...base, ...e.inputs } as never, {
      today: '2026-11-24',
      fmt: makeFmt('en'),
    });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
