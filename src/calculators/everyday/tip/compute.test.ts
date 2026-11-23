import { describe, expect, it } from 'vitest';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (inputs: Record<string, unknown>, cur = 'USD') =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-24', fmt: makeFmt('en', cur) });

describe('tip: references', () => {
  it('OpenStax Prealgebra 2e Ex 6.20: 18% of $68.50 is $12.33', () =>
    expect(run({ bill: 68.5, pct: 18 }).outputs.tip).toBe(12.33));
  it('split check (Python decimal): $187.40 + 20% = $224.88, ÷ 4 = $56.22', () => {
    const r = run({ bill: 187.4, pct: 20, people: 4 });
    expect(r.outputs.total).toBe(224.88);
    expect(r.outputs.each).toBe(56.22);
  });
});

describe('tip: behaviour', () => {
  it('round up gives whole-unit shares and a slightly larger tip', () => {
    const r = run({ bill: 187.4, pct: 20, people: 4, round: 'up' });
    expect(r.outputs.each).toBe(57);
    expect(r.outputs.total).toBe(228);
    expect(r.outputs.tip).toBe(40.6);
    expect(r.outputs.effective as number).toBeCloseTo(21.665, 2);
  });
  it('uneven splits never leave the table short', () => {
    const r = run({ bill: 100, pct: 15, people: 3 }); // 115.00 / 3 = 38.333…
    expect((r.outputs.each as number) * 3).toBeGreaterThanOrEqual(115);
  });
  it('0% tip and $0 bill', () => {
    expect(run({ pct: 0 }).outputs.tip).toBe(0);
    expect(run({ bill: 0 }).outputs.total).toBe(0);
  });
  it('half-cent tips round half-up: 15% of $10.10 = $1.515 → $1.52', () =>
    expect(run({ bill: 10.1, pct: 15 }).outputs.tip).toBe(1.52));
  it('zero-decimal currencies tip in whole units (JPY)', () =>
    expect(run({ bill: 8650, pct: 10 }, 'JPY').outputs.tip).toBe(865));
  it('a single diner sees no per-person rows', () => expect(run({}).outputs.each).toBeNull());
  it('very high tips are noted', () => expect(run({ pct: 40 }).warnings[0]?.key).toBe('warn.high'));
  it('missing input gives no result', () => expect(run({ bill: null }).outputs.tip).toBeNull());
  it('large bills stay exact', () =>
    expect(run({ bill: 1234567.89, pct: 18 }).outputs.tip).toBe(222222.22));
});

describe('tip: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run({ ...e.inputs });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
