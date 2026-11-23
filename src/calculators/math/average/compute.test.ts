import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { compute, parseList } from './compute';
import { definition } from './definition';

const run = (values: string, locale = 'en') =>
  compute({ values }, { today: '2026-11-24', fmt: makeFmt(locale) });
const ER =
  '3; 4; 8; 8; 10; 11; 12; 13; 14; 15; 15; 16; 16; 17; 17; 18; 21; 22; 22; 24; 24; 25; 26; 26; 27; 27; 29; 29; 31; 32; 33; 33; 34; 34; 35; 37; 40; 44; 44; 47';

describe('average: OpenStax Introductory Statistics 2e (verified 2026-11-24; Python statistics module)', () => {
  it('Ex 2.26: ER ages → mean 23.575 (book 23.6), median 24', () => {
    const r = run(ER);
    expect(r.outputs.mean).toBe(23.575);
    expect(r.outputs.median).toBe(24);
    expect(r.outputs.count).toBe(40);
  });
  it('Ex 2.27: 49 × $30,000 and one $5,000,000 → mean $129,400, median $30,000', () => {
    const r = run(['5000000', ...Array(49).fill('30000')].join(' '));
    expect(r.outputs.mean).toBe(129400);
    expect(r.outputs.median).toBe(30000);
  });
  it('Ex 2.28: exam scores → mode 72', () =>
    expect(run('50 53 59 59 63 63 72 72 72 72 72 76 78 81 83 84 84 84 90 93').outputs.mode).toBe(
      '72',
    ));
  it('Ex 2.29: 430, 430, 480, 480, 495 is bimodal (430 and 480)', () =>
    expect(run('430, 430, 480, 480, 495').outputs.mode).toBe('430, 480'));
  it('Ex 2.32: fifth-grade ages → mean 10.525, sample SD 0.715891', () => {
    const r = run('9 9.5 9.5 10 10 10 10 10.5 10.5 10.5 10.5 11 11 11 11 11 11 11.5 11.5 11.5');
    expect(r.outputs.mean).toBe(10.525);
    expect(r.outputs.sd as number).toBeCloseTo(0.7158910531638, 10);
    expect(r.outputs.psd as number).toBeCloseTo(0.6977642868476, 10);
  });
});

describe('average: behaviour', () => {
  it('no repeated value means no mode', () => expect(run('1 2 3').outputs.mode).toBe('mode.none'));
  it('even counts average the two middle values', () =>
    expect(run('1, 2, 3, 4').outputs.median).toBe(2.5));
  it('a single value has no sample SD', () => {
    const r = run('42');
    expect(r.outputs.sd).toBeNull();
    expect(r.outputs.mean).toBe(42);
  });
  it('non-numbers are ignored with a note', () => {
    const r = run('1, 2, abc, 3');
    expect(r.outputs.count).toBe(3);
    expect(r.warnings[0]?.key).toBe('warn.ignored');
  });
  it('German input: comma decimals, semicolon or space separators', () =>
    expect(parseList('1,5; 2,5 3,5', 'de').values).toEqual([1.5, 2.5, 3.5]));
  it('negative and huge values', () => {
    expect(run('-5, 5').outputs.mean).toBe(0);
    expect(run('1e15 1e15 1e15').outputs.mean).toBe(1e15);
  });
  it('compensated summation: 0.1 × 10 = 1', () =>
    expect(run(Array(10).fill('0.1').join(' ')).outputs.sum).toBe(1));
  it('empty input', () => expect(run('').warnings.some((w) => w.key === 'warn.empty')).toBe(true));
});

describe('average: invariants', () => {
  it('min ≤ median ≤ max and min ≤ mean ≤ max', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: -1e6, max: 1e6 }), { minLength: 1, maxLength: 60 }),
        (xs) => {
          const r = run(xs.join(' '));
          const [mn, mx] = [r.outputs.min as number, r.outputs.max as number];
          expect(r.outputs.median as number).toBeGreaterThanOrEqual(mn);
          expect(r.outputs.median as number).toBeLessThanOrEqual(mx);
          expect(r.outputs.mean as number).toBeGreaterThanOrEqual(mn - 1e-9);
          expect(r.outputs.mean as number).toBeLessThanOrEqual(mx + 1e-9);
        },
      ),
    );
  });
});

describe('average: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = compute({ ...e.inputs } as never, { today: '2026-11-24', fmt: makeFmt('en') });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
