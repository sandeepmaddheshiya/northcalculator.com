import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { fill } from '@/lib/fill';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const ui: Record<string, string> = {
  'fmt.d': '{n} d',
  'fmt.h': '{n} h',
  'fmt.m': '{n} min',
  'fmt.s': '{n} s',
};
const run = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, {
    today: '2026-11-24',
    fmt: makeFmt('en'),
    t: (k, v) => fill(ui[k] ?? k, v ?? {}),
  });
const zero = { aD: 0, aH: 0, aM: 0, aS: 0, bD: 0, bH: 0, bM: 0, bS: 0 };

describe('time: references', () => {
  it('OpenStax Prealgebra 2e Ex 7.46: 9 weeks (63 days) = 90,720 minutes', () =>
    expect(run({ ...zero, aD: 63 }).outputs.minutes).toBe(90720));
  it('BIPM SI Brochure Table 8: 1 d = 86 400 s, 1 h = 3600 s', () => {
    expect(run({ ...zero, aD: 1 }).outputs.seconds).toBe(86400);
    expect(run({ ...zero, aH: 1 }).outputs.seconds).toBe(3600);
  });
});

describe('time: behaviour', () => {
  it('2 h 45 min + 1 h 30 min = 4 h 15 min = 4.25 h', () => {
    const r = run({});
    expect(r.outputs.result).toBe('4 h 15 min');
    expect(r.outputs.hours).toBe(4.25);
  });
  it('borrowing: 8 h − 3 h 25 min 40 s = 4 h 34 min 20 s', () =>
    expect(run({ ...zero, aH: 8, op: 'sub', bH: 3, bM: 25, bS: 40 }).outputs.result).toBe(
      '4 h 34 min 20 s',
    ));
  it('carries into days', () =>
    expect(run({ ...zero, aH: 20, bH: 7, bM: 5 }).outputs.result).toBe('1 d 3 h 5 min'));
  it('normalizes oversized fields: 0 h 90 min = 1 h 30 min', () =>
    expect(run({ ...zero, aM: 90 }).outputs.result).toBe('1 h 30 min'));
  it('negative results are signed and flagged', () => {
    const r = run({ ...zero, aH: 1, op: 'sub', bH: 2, bM: 15 });
    expect(r.outputs.result).toBe('−1 h 15 min');
    expect(r.outputs.minutes).toBe(-75);
    expect(r.warnings[0]?.key).toBe('warn.negative');
  });
  it('decimal inputs: 1.5 h + 0.25 h = 1 h 45 min', () =>
    expect(run({ ...zero, aH: 1.5, bH: 0.25 }).outputs.result).toBe('1 h 45 min'));
  it('fractional seconds stay exact to the millisecond', () =>
    expect(run({ ...zero, aS: 0.1, bS: 0.2 }).outputs.seconds).toBe(0.3));
  it('zero is shown as 0 s', () => expect(run(zero).outputs.result).toBe('0 s'));
  it('the explanation gives h:mm:ss', () => expect(run({}).explain?.values.hms).toBe('4:15:00'));
});

describe('time: properties', () => {
  const t = fc.record({
    aH: fc.integer({ min: 0, max: 500 }),
    aM: fc.integer({ min: 0, max: 59 }),
    aS: fc.integer({ min: 0, max: 59 }),
    bH: fc.integer({ min: 0, max: 500 }),
    bM: fc.integer({ min: 0, max: 59 }),
    bS: fc.integer({ min: 0, max: 59 }),
  });
  it('adding then subtracting the second time returns the first', () =>
    fc.assert(
      fc.property(t, (x) => {
        const sum = run({ ...zero, ...x }).outputs.seconds as number;
        const first = x.aH * 3600 + x.aM * 60 + x.aS;
        const diff = run({ ...zero, aS: sum, op: 'sub', bH: x.bH, bM: x.bM, bS: x.bS }).outputs
          .seconds;
        return diff === first;
      }),
    ));
  it('addition is commutative', () =>
    fc.assert(
      fc.property(t, (x) => {
        const ab = run({ ...zero, ...x }).outputs.result;
        const ba = run({ ...zero, aH: x.bH, aM: x.bM, aS: x.bS, bH: x.aH, bM: x.aM, bS: x.aS })
          .outputs.result;
        return ab === ba;
      }),
    ));
});

describe('time: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run({ ...e.inputs });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
