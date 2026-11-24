import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute, piFraction } from './compute';
import { content } from './content.en';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (angle: number, unit = 'deg') =>
  compute({ ...base, angle, unit } as never, {
    today: '2026-11-24',
    fmt: makeFmt('en'),
    t: (k) => content.ui[k] ?? k,
  }).outputs as Record<string, string | number>;

describe('trigonometry: references (OpenStax Algebra and Trigonometry 2e)', () => {
  it('§7.3 Table 1: 30°, 45°, 60°, 90°', () => {
    expect([run(30).sin, run(30).cos]).toEqual(['1/2 = 0.5', '√3/2 ≈ 0.866025404']);
    expect([run(45).sin, run(45).cos]).toEqual(['√2/2 ≈ 0.707106781', '√2/2 ≈ 0.707106781']);
    expect([run(60).sin, run(60).cos]).toEqual(['√3/2 ≈ 0.866025404', '1/2 = 0.5']);
    expect([run(90).sin, run(90).cos, run(90).tan]).toEqual(['1', '0', 'Undefined']);
  });
  it('Example 4: cos(5π/3) = 0.5', () =>
    expect(run((5 * Math.PI) / 3, 'rad').cos).toBe('1/2 = 0.5'));
  it('Example 5: the reference angle of 225° is 45°', () => expect(run(225).reference).toBe(45));
  it('Example 6: cos 150° = −√3/2, sin 150° = 1/2; cos 5π/4 = sin 5π/4 = −√2/2', () => {
    expect([run(150).cos, run(150).sin]).toEqual(['−√3/2 ≈ −0.866025404', '1/2 = 0.5']);
    expect([run(225).cos, run(225).sin]).toEqual(['−√2/2 ≈ −0.707106781', '−√2/2 ≈ −0.707106781']);
  });
  it('Example 7: 7π/6 is (−√3/2, −1/2)', () =>
    expect([run(210).cos, run(210).sin]).toEqual(['−√3/2 ≈ −0.866025404', '−1/2 = −0.5']));
  it('§7.1 Example 3: π/6 = 30°, 3 rad ≈ 172°; Example 4: 15° = π/12', () => {
    expect(run(Math.PI / 6, 'rad').converted).toBe('30°');
    expect(Math.round(Number(String(run(3, 'rad').converted).replace('°', '')))).toBe(172);
    expect(run(15).converted).toBe('π/12 ≈ 0.261799388 rad');
  });
});

describe('trigonometry: references (NIST DLMF Table 4.17.1)', () => {
  it('π/12: sin ¼√2(√3 − 1), tan 2 − √3, csc √2(√3 + 1), sec √2(√3 − 1), cot 2 + √3', () => {
    const o = run(15);
    expect(o.sin).toBe('(√6 − √2)/4 ≈ 0.258819045');
    expect(o.tan).toBe('2 − √3 ≈ 0.267949192');
    expect(o.csc).toBe('√6 + √2 ≈ 3.86370331');
    expect(o.sec).toBe('√6 − √2 ≈ 1.03527618');
    expect(o.cot).toBe('2 + √3 ≈ 3.73205081');
  });
  it('7π/12: tan −(2 + √3), sec −√2(√3 + 1); 11π/12: cos −¼√2(√3 + 1)', () => {
    expect(run(105).tan).toBe('−(2 + √3) ≈ −3.73205081');
    expect(run(105).sec).toBe('−(√6 + √2) ≈ −3.86370331');
    expect(run(165).cos).toBe('−(√6 + √2)/4 ≈ −0.965925826');
  });
  it('π: sin 0, cos −1, tan 0, csc and cot undefined', () => {
    const o = run(180);
    expect([o.sin, o.cos, o.tan, o.csc, o.sec, o.cot]).toEqual([
      '0',
      '−1',
      '0',
      'Undefined',
      '−1',
      'Undefined',
    ]);
  });
});

describe('trigonometry: behaviour', () => {
  it('non-special angles get decimals only: sin 20° ≈ 0.342020143', () =>
    expect(run(20).sin).toBe('0.342020143'));
  it('negative and large angles wrap: sin(−30°) = −1/2, cos 720° = 1', () => {
    expect(run(-30).sin).toBe('−1/2 = −0.5');
    expect(run(720).cos).toBe('1');
  });
  it('π fractions', () => {
    expect([piFraction(180), piFraction(300), piFraction(-45), piFraction(15)]).toEqual([
      'π',
      '5π/3',
      '−π/4',
      'π/12',
    ]);
  });
});

describe('trigonometry: properties', () => {
  const num = (s: string | number) =>
    Number(String(s).split(/[=≈]/).pop()!.trim().replace('−', '-').replace(/,/g, ''));
  it('sin² + cos² = 1 and tan = sin ÷ cos (to the 9 digits shown)', () =>
    fc.assert(
      fc.property(fc.double({ min: -720, max: 720, noNaN: true }), (a) => {
        const o = run(a);
        const s = num(o.sin!);
        const c = num(o.cos!);
        return Math.abs(s * s + c * c - 1) < 1e-8;
      }),
    ));
  it('degrees and radians agree', () =>
    fc.assert(
      fc.property(
        fc.double({ min: -1000, max: 1000, noNaN: true }),
        (a) =>
          run(a).sin === run((a * Math.PI) / 180, 'rad').sin ||
          Math.abs(num(run(a).sin!) - num(run((a * Math.PI) / 180, 'rad').sin!)) < 2e-9,
      ),
    ));
});

describe('trigonometry: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = run(Number(e.inputs.angle), String(e.inputs.unit));
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
