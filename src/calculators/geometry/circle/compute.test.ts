import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (known: string, value: number) =>
  compute({ ...base, known, value } as never, { today: '2026-11-24', fmt: makeFmt('en') });
const book = (x: number) => Math.round(x * (3.14 / Math.PI) * 1e4) / 1e4;

describe('circle: references (OpenStax Prealgebra 2e §9.5, π ≈ 3.14 in the book)', () => {
  it('Ex 9.41: r = 2.5 → C ≈ 15.7, A ≈ 19.625', () => {
    const r = run('r', 2.5).outputs;
    expect(book(r.circumference as number)).toBe(15.7);
    expect(book(r.area as number)).toBe(19.625);
  });
  it('Ex 9.42: d = 4 → C ≈ 12.56', () =>
    expect(book(run('d', 4).outputs.circumference as number)).toBe(12.56));
  it('Ex 9.43: C = 47.1 → d ≈ 15 (47.1 ÷ 3.14)', () =>
    expect(
      Math.round((run('c', 47.1).outputs.diameter as number) * (Math.PI / 3.14) * 1e6) / 1e6,
    ).toBe(15));
});

describe('circle: behaviour', () => {
  it('from the area: 100 → r ≈ 5.6419', () =>
    expect(run('a', 100).outputs.radius).toBe(5.64189583548));
  it('FAQ: d = 10 → C = 31.4159', () =>
    expect(run('d', 10).outputs.circumference).toBe(31.4159265359));
  it('FAQ: C = 150 → r = 23.873', () => expect(run('c', 150).outputs.radius).toBe(23.8732414638));
  it('shows the 3.14 comparison', () => expect(run('r', 1).warnings[0]?.key).toBe('warn.pi'));
});

describe('circle: properties', () => {
  it('any measurement round-trips through the radius', () =>
    fc.assert(
      fc.property(fc.double({ min: 0.001, max: 1e6, noNaN: true }), (r) => {
        const a = run('r', r).outputs;
        const b = run('a', a.area as number).outputs;
        return Math.abs((b.radius as number) - r) <= 1e-9 * r;
      }),
    ));
});

describe('circle: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run(String(e.inputs.known), Number(e.inputs.value));
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
