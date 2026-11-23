import { describe, expect, it } from 'vitest';
import { makeFmt } from '@/calculators/fmt';
import { fill } from '@/lib/fill';
import { minorDigits } from '@/engine/money';
import { compute } from './compute';
import { definition, type RateData } from './definition';
import { content } from './content.en';
import snapshot from './rates.snapshot.json';

/** ECB euro reference rates for 2 January 2024 (data-api.ecb.europa.eu, verified 2026-11-24). */
const ECB: RateData = {
  base: 'EUR',
  time: 1704196800,
  source: 'snapshot',
  rates: { EUR: 1, USD: 1.0956, JPY: 155.68, GBP: 0.86645, INR: 91.285 },
};
const run = (inputs: Record<string, unknown>, data: RateData = ECB) => {
  const to = String(inputs.to ?? 'EUR');
  return compute({ amount: 100, from: 'USD', to, mode: 'ref', rate: 1, ...inputs } as never, {
    today: '2026-11-24',
    fmt: makeFmt('en', to),
    data,
    t: (k, v) => fill(content.ui[k] ?? k, v ?? {}),
  });
};

describe('currency: ECB reference rates, 2 January 2024', () => {
  it('direct quote: 100 EUR = 109.56 USD', () =>
    expect(run({ amount: 100, from: 'EUR', to: 'USD' }).outputs.result).toBe(109.56));
  it('cross rate by triangulation: 1,000 USD → JPY = 1000 × 155.68 ÷ 1.0956 = ¥142,096 (whole yen)', () =>
    expect(run({ amount: 1000, from: 'USD', to: 'JPY' }).outputs.result).toBe(142096));
  it('cross rate: 250 GBP → INR = 250 × 91.285 ÷ 0.86645 = ₹26,338.80 (26,338.796…)', () =>
    expect(run({ amount: 250, from: 'GBP', to: 'INR' }).outputs.result).toBe(26338.8));
  it('inverse rate text', () =>
    expect(run({ amount: 1, from: 'EUR', to: 'USD' }).outputs.inverseText).toBe(
      '1 USD = 0.912742 EUR',
    ));
});

describe('currency: ISO 4217 minor units (via Intl)', () => {
  it('JPY 0, USD 2, BHD 3, KWD 3', () => {
    expect(minorDigits('JPY')).toBe(0);
    expect(minorDigits('USD')).toBe(2);
    expect(minorDigits('BHD')).toBe(3);
    expect(minorDigits('KWD')).toBe(3);
  });
  it('results round to the target currency’s minor unit', () => {
    const r = run(
      { amount: 1, from: 'USD', to: 'BHD' },
      { base: 'USD', time: 1, source: 'snapshot', rates: { USD: 1, BHD: 0.37612345 } },
    );
    expect(r.outputs.result).toBe(0.376);
  });
});

describe('currency: custom rates and markup', () => {
  it('a bank rate below the reference shows a positive markup', () => {
    const r = run(
      { amount: 1000, from: 'USD', to: 'EUR', mode: 'custom', rate: 0.88 },
      { base: 'USD', time: 1, source: 'snapshot', rates: { USD: 1, EUR: 0.92 } },
    );
    expect(r.outputs.result).toBe(880);
    expect(r.outputs.refResult).toBe(920);
    expect(r.outputs.markup as number).toBeCloseTo(4.3478, 3);
  });
  it('a large markup is flagged', () => {
    const r = run(
      { amount: 100, from: 'USD', to: 'EUR', mode: 'custom', rate: 0.7 },
      { base: 'USD', time: 1, source: 'snapshot', rates: { USD: 1, EUR: 0.92 } },
    );
    expect(r.warnings.some((w) => w.key === 'warn.markupLarge')).toBe(true);
  });
  it('custom mode without a rate gives no result', () =>
    expect(run({ mode: 'custom', rate: 0 }).outputs.result).toBeNull());
  it('unknown currencies without data give no result', () =>
    expect(run({ from: 'XXX', to: 'EUR' }).warnings[0]?.key).toBe('warn.noData'));
  it('same currency converts 1:1 with a note', () => {
    const r = run({ from: 'EUR', to: 'EUR' });
    expect(r.outputs.result).toBe(100);
    expect(r.warnings[0]?.key).toBe('warn.same');
  });
});

describe('currency: the build-time snapshot', () => {
  const snap = snapshot as RateData;
  it('covers at least 150 ISO currencies with USD = 1', () => {
    expect(Object.keys(snap.rates).length).toBeGreaterThanOrEqual(150);
    expect(snap.rates.USD).toBe(1);
    for (const [k, v] of Object.entries(snap.rates)) {
      expect(k).toMatch(/^[A-Z]{3}$/);
      expect(v).toBeGreaterThan(0);
    }
  });
});

describe('currency: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = run({ ...e.inputs }, snapshot as RateData);
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
