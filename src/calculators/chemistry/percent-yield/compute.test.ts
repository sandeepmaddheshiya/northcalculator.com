import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const solve = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-24', fmt: makeFmt('en') });
const res = (inputs: Record<string, unknown>) => solve(inputs).outputs.result as number;
const r1 = (x: number) => Math.round(x * 10) / 10;

describe('percent-yield: references', () => {
  it('OpenStax Chemistry 2e Ex 4.13: 0.392 of 0.5072 g → 77.3%', () =>
    expect(r1(res({ find: 'percent', actual: 0.392, theoretical: 0.5072 }))).toBe(77.3));
  it('§4.4 check: 12.5 g CF₂Cl₂ from 32.9 g CCl₄ (153.82 → 120.91 g/mol) → 48.3%', () =>
    expect(r1(res({ find: 'percent', actual: 12.5, theoretical: (32.9 / 153.82) * 120.91 }))).toBe(
      48.3,
    ));
  it('LibreTexts Ex 8.7.1: 14.9 of 15.7 g → 94.9% (95.1% with the unrounded 15.67 g)', () => {
    expect(r1(res({ find: 'percent', actual: 14.9, theoretical: 15.7 }))).toBe(94.9);
    expect(r1(res({ find: 'percent', actual: 14.9, theoretical: (40 / 122.55) * 1.5 * 32 }))).toBe(
      95.1,
    );
  });
});

describe('percent-yield: behaviour', () => {
  it('FAQ: 17.0 of 20.0 g → 85%; solves for actual and theoretical', () => {
    expect(res({ find: 'percent', actual: 17, theoretical: 20 })).toBe(85);
    expect(res({ find: 'actual', theoretical: 25, percent: 80 })).toBe(20);
    expect(res({ find: 'theoretical', actual: 20, percent: 80 })).toBe(25);
  });
  it('over 100% is flagged; zero theoretical is rejected', () => {
    expect(solve({ find: 'percent', actual: 11, theoretical: 10 }).warnings[0]?.key).toBe(
      'warn.over',
    );
    expect(solve({ find: 'percent', actual: 1, theoretical: 0 }).warnings[0]?.key).toBe(
      'warn.theoretical',
    );
  });
});

describe('percent-yield: properties', () => {
  it('percent → actual → theoretical round-trips', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 0.001, max: 1e6, noNaN: true }),
        fc.double({ min: 0.1, max: 150, noNaN: true }),
        (th, p) => {
          const a = res({ find: 'actual', theoretical: th, percent: p });
          const back = res({ find: 'theoretical', actual: a, percent: p });
          const p2 = res({ find: 'percent', actual: a, theoretical: th });
          return Math.abs(back - th) <= 1e-9 * th && Math.abs(p2 - p) <= 1e-9 * p;
        },
      ),
    ));
});

describe('percent-yield: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = solve(e.inputs).outputs;
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
