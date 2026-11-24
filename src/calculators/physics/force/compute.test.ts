import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { content } from './content.en';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, {
    today: '2026-11-24',
    fmt: makeFmt('en'),
    t: (k) => content.ui[k] ?? k,
  }).outputs as Record<string, number | string>;
const sig = (x: unknown, d: number) => Number((x as number).toPrecision(d));

describe('force: references', () => {
  it('OpenStax College Physics 2e Ex 4.1 / University Physics Ex 5.2: 51 N on 24 kg → 2.1 m/s²', () =>
    expect(sig(run({ find: 'accel', force: 51, mass: 24 }).ms2, 2)).toBe(2.1));
  it('University Physics Ex 5.6: 600.0 N at 0.2 m/s² → 3000 kg', () =>
    expect(run({ find: 'mass', force: 600, accel: 0.2 }).kg).toBe(3000));
  it('Ex 5.5: 0.400 kg at |a| = √(3² + 7²) → 3.05 N', () =>
    expect(sig(run({ find: 'force', mass: 0.4, accel: Math.hypot(3, 7) }).N, 3)).toBe(3.05));
  it('Ex 4.2 / 5.4: (2100 × 49 + 650) ÷ 4 = 25,887.5 N → 2.6 × 10⁴ (College Physics; University Physics prints 2.5)', () => {
    const f = run({ find: 'force', mass: 2100, accel: 49 }).N as number;
    expect((f + 650) / 4).toBe(25887.5);
    expect(sig((f + 650) / 4, 2)).toBe(26000);
  });
  it('§4.3: w = mg = 1.0 kg × 9.80 m/s² = 9.8 N', () =>
    expect(sig(run({ find: 'force', mass: 1, accel: 9.8 }).N, 2)).toBe(9.8));
});

describe('force: behaviour', () => {
  it('NIST SP 811: 1 lb at 1 g = 1 lbf = 4.4482216 N', () => {
    const o = run({ find: 'force', mass: 1, mu: 'lb', accel: 1, au: 'g', fu: 'lbf' });
    expect(o.result).toBe('1 lbf');
    expect(sig(o.N, 8)).toBe(4.4482216);
  });
  it('weight output uses gₙ: 70 kg → 686.4655 N', () =>
    expect(run({ find: 'accel', force: 1, mass: 70 }).weight).toBe(686.4655));
  it('zero divisors are rejected', () => {
    const w = (i: Record<string, unknown>) =>
      compute({ ...base, ...i } as never, { today: '', fmt: makeFmt('en') }).warnings[0]?.key;
    expect(w({ find: 'mass', force: 1, accel: 0 })).toBe('warn.accel');
    expect(w({ find: 'accel', force: 1, mass: 0 })).toBe('warn.mass');
  });
});

describe('force: properties', () => {
  it('F → a → m round-trips', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 0.001, max: 1e6, noNaN: true }),
        fc.double({ min: 0.001, max: 1e4, noNaN: true }),
        (m, a) => {
          const f = run({ find: 'force', mass: m, accel: a }).N as number;
          const a2 = run({ find: 'accel', force: f, mass: m }).ms2 as number;
          const m2 = run({ find: 'mass', force: f, accel: a }).kg as number;
          return Math.abs(a2 - a) <= 1e-9 * a && Math.abs(m2 - m) <= 1e-9 * m;
        },
      ),
    ));
});

describe('force: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = run(e.inputs);
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
