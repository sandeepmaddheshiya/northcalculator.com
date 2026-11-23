import { describe, expect, it } from 'vitest';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-24');
const run = (inputs: Record<string, unknown>) =>
  compute({ ...base, ...inputs } as never, { today: '2026-11-24', fmt: makeFmt('en', 'USD') });

describe('simple interest: OpenStax Contemporary Mathematics §6.3 (verified 2026-11-24)', () => {
  it('Ex 6.27a: $4,000 at 5.5% for 4 years → $880, payoff $4,880', () => {
    const r = run({ principal: 4000, rate: 5.5, time: 4 });
    expect(r.outputs.interest).toBe(880);
    expect(r.outputs.total).toBe(4880);
  });
  it('Ex 6.27b: $14,800 at 7.9% for 7 years → $8,184.40', () =>
    expect(run({ principal: 14800, rate: 7.9, time: 7 }).outputs.interest).toBe(8184.4));
  it('Ex 6.28: $11,995 at 14.9% for 2 years → $3,574.51, $15,569.51', () => {
    const r = run({ principal: 11995, rate: 14.9, time: 2 });
    expect(r.outputs.interest).toBe(3574.51);
    expect(r.outputs.total).toBe(15569.51);
  });
  it('Ex 6.29: $20,000 at 6.75% for 4 months → $450', () =>
    expect(run({ principal: 20000, rate: 6.75, time: 4, unit: 'm' }).outputs.interest).toBe(450));
  it('Ex 6.32: $2,500 CD at 3.25% for 3 years → $2,743.75', () =>
    expect(run({ principal: 2500, rate: 3.25, time: 3 }).outputs.total).toBe(2743.75));
  it('Ex 6.33a: $6,500 at 12.6% for 45 days = $100.9726 (book rounds up to $100.98; we round half-up)', () =>
    expect(run({ principal: 6500, rate: 12.6, time: 45, unit: 'd' }).outputs.interest).toBe(
      100.97,
    ));
});

describe('simple interest: behaviour', () => {
  it('banker’s rule (360-day year) charges more for the same days', () => {
    const a = run({ principal: 10000, rate: 9, time: 90, unit: 'd' }).outputs.interest as number;
    const b = run({ principal: 10000, rate: 9, time: 90, unit: 'd', basis: '360' }).outputs
      .interest as number;
    expect(a).toBe(221.92);
    expect(b).toBe(225);
  });
  it('zero rate or zero time earns nothing', () => {
    expect(run({ rate: 0 }).outputs.interest).toBe(0);
    expect(run({ time: 0 }).outputs.interest).toBe(0);
  });
  it('interest is linear in time', () => {
    const one = run({ time: 1 }).outputs.interest as number;
    expect(run({ time: 10 }).outputs.interest).toBeCloseTo(one * 10, 2);
  });
  it('missing input gives no result', () =>
    expect(run({ rate: null }).outputs.interest).toBeNull());
});

describe('simple interest: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run({ ...e.inputs });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
