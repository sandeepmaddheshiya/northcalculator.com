import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-24', fmt: makeFmt('en') });

describe('percentage-change: references (OpenStax Prealgebra 2e §6.2)', () => {
  it('Ex 6.23: $26 → $36 is a 38.5% increase (exact 38.4615…)', () =>
    expect(run({ from: 26, to: 36 }).outputs.change).toBe(38.4615));
  it('Ex 6.24: $3.71 → $3.64 is a 1.9% decrease (exact 1.8868…)', () =>
    expect(run({ from: 3.71, to: 3.64 }).outputs.change).toBe(-1.8868));
});

describe('percentage-change: behaviour', () => {
  it('80 → 100 is +25%, and 100 → 80 is −20%', () => {
    expect(run({ from: 80, to: 100 }).outputs.change).toBe(25);
    expect(run({ from: 100, to: 80 }).outputs.change).toBe(-20);
  });
  it('the reverse change undoes it: 80 → 60 needs +33.33%', () =>
    expect(run({ from: 80, to: 60 }).outputs.reverse).toBe(33.3333));
  it('FAQ figures', () => {
    expect(run({ from: 1200, to: 1290 }).outputs.change).toBe(7.5);
    expect(run({ from: 900, to: 765 }).outputs.change).toBe(-15);
    expect(run({ from: 20, to: 70 }).outputs.change).toBe(250);
  });
  it('a negative original is measured by its size: −50 → −20 is +60%', () => {
    const r = run({ from: -50, to: -20 });
    expect(r.outputs.change).toBe(60);
    expect(r.warnings[0]?.key).toBe('warn.negative');
  });
  it('zero original is undefined but still reports the change in value', () => {
    const r = run({ from: 0, to: 40 });
    expect(r.outputs.change).toBeNull();
    expect(r.outputs.difference).toBe(40);
    expect(r.warnings[0]?.key).toBe('warn.zero');
  });
  it('falling to zero is −100% and has no reverse', () => {
    const r = run({ from: 50, to: 0 });
    expect(r.outputs.change).toBe(-100);
    expect(r.outputs.reverse).toBeNull();
  });
  it('no change', () => expect(run({ from: 5, to: 5 }).explain?.key).toBe('explain.same'));
  it('difference has no floating-point noise', () =>
    expect(run({ from: 0.1, to: 0.3 }).outputs.difference).toBe(0.2));
});

describe('percentage-change: properties', () => {
  const pos = fc.double({ min: 0.01, max: 1e6, noNaN: true });
  it('(1 + change) × (1 + reverse) = 1 for positive values', () =>
    fc.assert(
      fc.property(pos, pos, (a, b) => {
        const r = run({ from: a, to: b }).outputs;
        const x = (1 + (r.change as number) / 100) * (1 + (r.reverse as number) / 100);
        return Math.abs(x - 1) < 1e-4 * Math.max(1, b / a, a / b);
      }),
    ));
  it('the sign follows the direction of the move', () =>
    fc.assert(
      fc.property(pos, pos, (a, b) => {
        fc.pre(Math.abs(b - a) / a > 1e-5);
        return Math.sign(run({ from: a, to: b }).outputs.change as number) === Math.sign(b - a);
      }),
    ));
});

describe('percentage-change: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run({ ...e.inputs });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
