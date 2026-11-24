import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-24', fmt: makeFmt('en') });
const rolls = (r: ReturnType<typeof run>) => String(r.outputs.rolls).split(', ').map(Number);

describe('dice: references', () => {
  it('OpenStax Introductory Statistics §3.1: P(at least five on a d6) = 2/6 — 30,000 rolls land within 1% of it', () => {
    const r = rolls(run({ dice: 100, sides: '6', seed: 'a' }));
    let hits = 0;
    let n = 0;
    for (let i = 0; i < 300; i++) {
      for (const v of rolls(run({ dice: 100, sides: '6', seed: `s${i}` }))) {
        n++;
        if (v >= 5) hits++;
      }
    }
    expect(r).toHaveLength(100);
    expect(Math.abs(hits / n - 2 / 6)).toBeLessThan(0.01);
  });
  it('two dice: 6 of 36 outcomes sum to 7 (exhaustive enumeration)', () => {
    let sevens = 0;
    for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (a + b === 7) sevens++;
    expect(sevens).toBe(6);
    expect(run({ dice: 2, sides: '6' }).outputs.expected).toBe(7);
  });
});

describe('dice: behaviour', () => {
  it('range and average with a modifier', () => {
    const r = run({ dice: 1, sides: '20', modifier: 5 });
    expect(r.outputs.range).toBe('6–25');
    expect(r.outputs.expected).toBe(15.5);
  });
  it('negative modifier', () =>
    expect(run({ dice: 3, sides: '8', modifier: -2 }).outputs.range).toBe('1–22'));
  it('total = sum of rolls + modifier', () => {
    const r = run({ dice: 5, sides: '12', modifier: 3, seed: 'z' });
    expect(r.outputs.total).toBe(rolls(r).reduce((a, b) => a + b, 0) + 3);
  });
  it('the same seed rolls the same', () =>
    expect(run({ dice: 10, seed: 'k' }).outputs.rolls).toBe(
      run({ dice: 10, seed: 'k' }).outputs.rolls,
    ));
  it('d100 averages 50.5', () =>
    expect(run({ dice: 1, sides: '100' }).outputs.expected).toBe(50.5));
  it('out-of-range dice count gives no result', () =>
    expect(run({ dice: 0 }).outputs.total).toBeNull());
});

describe('dice: properties', () => {
  it('every die is between 1 and s', () =>
    fc.assert(
      fc.property(
        fc.string(),
        fc.constantFrom('4', '6', '8', '10', '12', '20', '100'),
        fc.integer({ min: 1, max: 100 }),
        (seed, sides, dice) =>
          rolls(run({ seed, sides, dice })).every((v) => v >= 1 && v <= Number(sides)),
      ),
    ));
});

describe('dice: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run({ ...e.inputs });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
