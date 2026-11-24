import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-24', fmt: makeFmt('en') });
const ke = (mass: number, speed: number, extra: Record<string, unknown> = {}) =>
  run({ find: 'energy', mass, massUnit: 'kg', speed, speedUnit: 'ms', ...extra }).outputs
    .result as number;
const sig3 = (x: number) => Number(x.toPrecision(3));

describe('kinetic-energy: references', () => {
  it('OpenStax College Physics 2e Ex 7.2: 30.0 kg at 0.500 m/s = 3.75 J', () =>
    expect(ke(30, 0.5)).toBe(3.75));
  it('Ex 7.4: 95.75 J on 30.0 kg → 2.53 m/s (exact 2.5265…, Python)', () => {
    const v = run({ find: 'speed', mass: 30, massUnit: 'kg', energy: 95.75 }).outputs
      .result as number;
    expect(sig3(v)).toBe(2.53);
  });
  it('University Physics Vol. 1 Ex 7.6a: 80 kg at 10 m/s = 4.0 kJ', () =>
    expect(ke(80, 10)).toBe(4000));
  it('Ex 7.6b: 4.2 × 10²³ J at 22 km/s → 1.7 × 10¹⁵ kg', () => {
    const m = run({ find: 'mass', energy: 4.2e23, speed: 79200, speedUnit: 'kmh' }).outputs
      .result as number;
    expect(Number(m.toPrecision(2))).toBe(1.7e15);
  });
  it('Ex 7.7a: 75.0 kg at 1.50 m/s = 84.4 J (exact 84.375); 7.7b: 13.5 and 16.5 m/s → 6.83 kJ and 10.2 kJ', () => {
    expect(ke(75, 1.5)).toBe(84.375);
    expect(sig3(ke(75, 13.5))).toBe(6830);
    expect(sig3(ke(75, 16.5))).toBe(10200);
  });
  it('Ex 7.8a: 0.624 kg at 7.5 m/s = 17.6 J (exact 17.55; the book rounds half up)', () =>
    expect(ke(0.624, 7.5)).toBe(17.55));
});

describe('kinetic-energy: behaviour', () => {
  it('units: 624 g, and 2.2046 lb ≈ 1 kg; 36 km/h = 10 m/s', () => {
    expect(
      run({ find: 'energy', mass: 624, massUnit: 'g', speed: 7.5, speedUnit: 'ms' }).outputs.result,
    ).toBe(17.55);
    expect(
      run({ find: 'energy', mass: 80, massUnit: 'kg', speed: 36, speedUnit: 'kmh' }).outputs.result,
    ).toBe(4000);
    expect(
      run({ find: 'energy', mass: 1 / 0.45359237, massUnit: 'lb', speed: 2, speedUnit: 'ms' })
        .outputs.result,
    ).toBe(2);
  });
  it('doubling speed quadruples energy', () => expect(ke(1000, 40) / ke(1000, 20)).toBe(4));
  it('zero divisors are rejected; near-light speeds are flagged', () => {
    expect(run({ find: 'mass', energy: 10, speed: 0 }).warnings[0]?.key).toBe('warn.speed');
    expect(run({ find: 'speed', energy: 10, mass: 0 }).warnings[0]?.key).toBe('warn.mass');
    expect(run({ find: 'energy', mass: 1, speed: 1e8, speedUnit: 'ms' }).warnings[0]?.key).toBe(
      'warn.relativistic',
    );
  });
});

describe('kinetic-energy: properties', () => {
  it('energy → speed and energy → mass round-trip', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 0.001, max: 1e6, noNaN: true }),
        fc.double({ min: 0.001, max: 1e5, noNaN: true }),
        (mass, speed) => {
          const k = ke(mass, speed);
          const v = run({ find: 'speed', mass, massUnit: 'kg', energy: k }).outputs
            .result as number;
          const m = run({ find: 'mass', speed, speedUnit: 'ms', energy: k }).outputs
            .result as number;
          return Math.abs(v - speed) <= 1e-9 * speed && Math.abs(m - mass) <= 1e-9 * mass;
        },
      ),
    ));
});

describe('kinetic-energy: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run(e.inputs);
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
