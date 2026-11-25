import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-25');
const solve = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-25', fmt: makeFmt('en') });
const res = (inputs: Record<string, unknown>) => solve(inputs).outputs.result as number;
const sig = (x: number, d: number) => Number(x.toPrecision(d));

describe('pendulum: references', () => {
  it('College Physics 2e Ex 16.5 / University Physics Ex 15.3: 0.75000 m, 1.7357 s → g = 9.8281 m/s²', () =>
    expect(sig(res({ find: 'g', length: 0.75, period: 1.7357 }), 5)).toBe(9.8281));
  it('and back: g = 9.8281, L = 0.75 → T = 1.7357 s', () =>
    expect(sig(res({ find: 'period', length: 0.75, g: 9.8281 }), 5)).toBe(1.7357));
});

describe('pendulum: behaviour', () => {
  it('FAQ: 0.25 m → 1.0 s; 4 m → 4.0 s', () => {
    expect(sig(res({ find: 'period', length: 0.25, g: 9.80665 }), 2)).toBe(1);
    expect(sig(res({ find: 'period', length: 4, g: 9.80665 }), 2)).toBe(4);
  });
  it('a 2 s period needs 0.99362 m at gₙ; frequency and swings per minute', () => {
    expect(sig(res({ find: 'length', period: 2, g: 9.80665 }), 5)).toBe(0.99362);
    const o = solve({ find: 'period', length: 0.993621385566, g: 9.80665 }).outputs;
    expect([sig(o.frequency as number, 6), sig(o.perMinute as number, 6)]).toEqual([0.5, 30]);
  });
  it('zero g or period is rejected', () => {
    expect(solve({ find: 'period', length: 1, g: 0 }).warnings[0]?.key).toBe('warn.g');
    expect(solve({ find: 'g', length: 1, period: 0 }).warnings[0]?.key).toBe('warn.period');
  });
});

describe('pendulum: properties', () => {
  it('period → length → g round-trips; four times the length doubles the period', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 0.001, max: 1000, noNaN: true }),
        fc.double({ min: 0.1, max: 30, noNaN: true }),
        (l, g) => {
          const t = res({ find: 'period', length: l, g });
          const l2 = res({ find: 'length', period: t, g });
          const g2 = res({ find: 'g', length: l, period: t });
          const t4 = res({ find: 'period', length: 4 * l, g });
          return (
            Math.abs(l2 - l) <= 1e-9 * l &&
            Math.abs(g2 - g) <= 1e-9 * g &&
            Math.abs(t4 - 2 * t) <= 1e-9 * t
          );
        },
      ),
    ));
});

describe('pendulum: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = solve(e.inputs).outputs;
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
