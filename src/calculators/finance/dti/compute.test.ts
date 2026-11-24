import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-24', fmt: makeFmt('en') });
const zero = { housing: 0, auto: 0, student: 0, cards: 0, other: 0 };

describe('dti: references', () => {
  it('CFPB: $1,500 + $100 + $400 on $6,000 = 33%', () => {
    const r = run({ ...zero, income: 6000, housing: 1500, auto: 100, other: 400 });
    expect(r.outputs.debt).toBe(2000);
    expect(r.outputs.dti).toBe(33.3333);
  });
  it('Fannie Mae B3-6-02 bands: ≤ 36%, ≤ 45%, ≤ 50%, above 50%', () => {
    const band = (d: number) => run({ ...zero, income: 100, other: d }).warnings[0]?.key;
    expect([band(36), band(36.01), band(45), band(50), band(50.01)]).toEqual([
      'info.low',
      'info.mid',
      'info.mid',
      'info.high',
      'info.over',
    ]);
  });
});

describe('dti: behaviour', () => {
  it('yearly income is divided by 12', () => {
    const r = run({
      ...zero,
      income: 84000,
      period: 'year',
      housing: 2100,
      auto: 450,
      student: 300,
      cards: 150,
    });
    expect(r.outputs.monthlyIncome).toBe(7000);
    expect(r.outputs.dti).toBe(42.8571);
  });
  it('front-end ratio uses housing only', () =>
    expect(run({ ...zero, income: 6000, housing: 1500 }).outputs.frontEnd).toBe(25));
  it('room to 36%', () =>
    expect(
      run({ ...zero, income: 7500, auto: 350, student: 250, cards: 100 }).outputs.roomTo36,
    ).toBe(2000));
  it('no room when already above 36%', () =>
    expect(run({ ...zero, income: 1000, other: 500 }).outputs.roomTo36).toBe(0));
  it('zero income is rejected', () =>
    expect(run({ income: 0 }).warnings[0]?.key).toBe('warn.income'));
  it('income is sensitive (kept out of history)', () =>
    expect(definition.inputs.filter((i) => i.sensitive).map((i) => i.id)).toContain('income'));
});

describe('dti: properties', () => {
  it('adding debt never lowers the ratio', () =>
    fc.assert(
      fc.property(
        fc.integer({ min: 1000, max: 50000 }),
        fc.integer({ min: 0, max: 20000 }),
        fc.integer({ min: 1, max: 5000 }),
        (inc, d, extra) =>
          (run({ ...zero, income: inc, other: d + extra }).outputs.dti as number) >=
          (run({ ...zero, income: inc, other: d }).outputs.dti as number),
      ),
    ));
});

describe('dti: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run({ ...zero, ...e.inputs });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
