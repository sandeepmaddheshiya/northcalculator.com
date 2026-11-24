import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';
import { content } from './content.en';
import { fill } from '@/lib/fill';

const base = defaultValues(definition, '2026-11-24');
const r = (v: number, from: string, to: string) =>
  compute({ ...base, v, from, to } as never, {
    today: '2026-11-24',
    fmt: makeFmt('en'),
    t: (k, vals) => fill(content.ui[k] ?? k, vals ?? {}),
  });
const run = (v: number, from: string, to: string) => r(v, from, to).outputs.result as number;

describe('temperature-converter: references (NIST SP 811 §4.2.1.1 and App. B.9)', () => {
  it('0 °C = 273.15 K; 0 °C = 32 °F; 100 °C = 212 °F', () => {
    expect(run(0, 'c', 'k')).toBe(273.15);
    expect(run(0, 'c', 'f')).toBe(32);
    expect(run(100, 'c', 'f')).toBe(212);
  });
  it('°R = °F + 459.67; absolute zero is −459.67 °F', () => {
    expect(run(0, 'f', 'r')).toBe(459.67);
    expect(run(0, 'k', 'f')).toBe(-459.67);
  });
});

describe('temperature-converter: behaviour', () => {
  it('98.6 °F = 37 °C; −40 °C = −40 °F', () => {
    expect(run(98.6, 'f', 'c')).toBe(37);
    expect(run(-40, 'c', 'f')).toBe(-40);
  });
  it('FAQ and tips: 68 °F = 20 °C, 25 °C = 77 °F, 350 °F = 176.67 °C', () => {
    expect(run(68, 'f', 'c')).toBe(20);
    expect(run(25, 'c', 'f')).toBe(77);
    expect(run(350, 'f', 'c')).toBeCloseTo(176.6667, 4);
  });
  it('below absolute zero warns', () =>
    expect(r(-500, 'f', 'c').warnings[0]?.key).toBe('warn.belowZero'));
  it('shows the formula', () =>
    expect(r(98.6, 'f', 'c').outputs.relation).toBe('°C = (°F − 32) × 5/9'));
});

describe('temperature-converter: properties', () => {
  it('F → C → F round trips', () =>
    fc.assert(
      fc.property(
        fc.double({ min: -400, max: 5000, noNaN: true }),
        (x) => Math.abs(run(run(x, 'f', 'c'), 'c', 'f') - x) < 1e-8,
      ),
    ));
  it('a 1 °C difference is a 1.8 °F difference', () =>
    fc.assert(
      fc.property(
        fc.integer({ min: -200, max: 1000 }),
        (c) => Math.abs(run(c + 1, 'c', 'f') - run(c, 'c', 'f') - 1.8) < 1e-9,
      ),
    ));
});

describe('temperature-converter: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const res = compute({ ...base, ...e.inputs } as never, {
      today: '2026-11-24',
      fmt: makeFmt('en'),
    });
    for (const [k, val] of Object.entries(e.expect)) expect(res.outputs[k]).toBe(val);
  });
});
