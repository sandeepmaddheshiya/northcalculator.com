import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { compute, schedule } from './compute';
import { definition } from './definition';

const base = defaultValues(definition, '2026-11-25');
const solve = (inputs: Record<string, unknown>) =>
  compute({ ...base, cur: 'USD', ...inputs } as never, {
    today: '2026-11-25',
    fmt: makeFmt('en', 'USD'),
  });
const deps = (inputs: Record<string, unknown>) =>
  solve(inputs).table!.rows.map((r) => r[1] as number);
const books = (inputs: Record<string, unknown>) =>
  solve(inputs).table!.rows.map((r) => r[3] as number);

describe('depreciation: references (OpenStax Principles of Financial Accounting §11.3)', () => {
  const kenzie = { cost: 58000, salvage: 10000 };
  it('Kenzie straight line: $9,600 a year; book value $48,400, $38,800 … $10,000', () => {
    expect(deps({ ...kenzie, method: 'sl', life: 5 })).toEqual([9600, 9600, 9600, 9600, 9600]);
    expect(books({ ...kenzie, method: 'sl', life: 5 }).slice(0, 2)).toEqual([48400, 38800]);
    expect(solve({ ...kenzie, method: 'sl', life: 5 }).outputs.total).toBe(48000);
  });
  it('Kenzie DDB: $23,200, $13,920, $8,352, $2,528, 0; book $34,800, $20,880, $12,528, $10,000', () => {
    expect(deps({ ...kenzie, method: 'ddb', life: 5 })).toEqual([23200, 13920, 8352, 2528, 0]);
    expect(books({ ...kenzie, method: 'ddb', life: 5 })).toEqual([
      34800, 20880, 12528, 10000, 10000,
    ]);
  });
  it('Kenzie units: $0.05 a page; 180k, 200k, 210k, 190k, 180k → $9,000 … $9,000, total $48,000', () => {
    const r = solve({
      ...kenzie,
      method: 'units',
      totalUnits: 960000,
      used: '180000, 200000, 210000, 190000, 180000',
    });
    expect(r.outputs.perUnit).toBe(0.05);
    expect(r.table!.rows.map((x) => x[1])).toEqual([9000, 10000, 10500, 9500, 9000]);
    expect(r.outputs.total).toBe(48000);
  });
  it('Liam: $10,000, $1,000, 5 years → $1,800 straight line; DDB $4,000, $2,400', () => {
    expect(solve({ method: 'sl', cost: 10000, salvage: 1000, life: 5 }).outputs.first).toBe(1800);
    expect(deps({ method: 'ddb', cost: 10000, salvage: 1000, life: 5 }).slice(0, 2)).toEqual([
      4000, 2400,
    ]);
  });
});

describe('depreciation: references (Jonick, Principles of Financial Accounting §4.5)', () => {
  const machine = { cost: 27000, salvage: 900 };
  it('straight line: $8,700 a year; book value $18,300, $9,600, $900', () =>
    expect(books({ ...machine, method: 'sl', life: 3 })).toEqual([18300, 9600, 900]));
  it('DDB 2/3: $18,000, $6,000, then $3,000 − $900 = $2,100', () =>
    expect(deps({ ...machine, method: 'ddb', life: 3 })).toEqual([18000, 6000, 2100]));
  it('units: $3.00 an hour; 2,100, 2,300, 2,600, 2,400 hours → $6,300, $6,900, $7,800, $5,100', () => {
    const r = solve({ ...machine, method: 'units', totalUnits: 8700, used: '2100 2300 2600 2400' });
    expect(r.table!.rows.map((x) => x[1])).toEqual([6300, 6900, 7800, 5100]);
    expect(r.table!.rows.map((x) => x[2])).toEqual([6300, 13200, 21000, 26100]);
    expect(r.outputs.endBook).toBe(900);
    expect(r.warnings.map((w) => w.key)).toContain('warn.overUnits');
  });
});

describe('depreciation: behaviour', () => {
  it('cents: $1,000 over 3 years splits 333.33, 333.33, 333.34', () =>
    expect(deps({ method: 'sl', cost: 1000, salvage: 0, life: 3 })).toEqual([
      333.33, 333.33, 333.34,
    ]));
  it('yen has no minor unit', () => {
    const r = compute(
      { ...base, method: 'sl', cost: 1000, salvage: 0, life: 3, cur: 'JPY' } as never,
      {
        today: '2026-11-25',
        fmt: makeFmt('en', 'JPY'),
      },
    );
    expect(r.table!.rows.map((x) => x[1])).toEqual([333, 333, 334]);
  });
  it('rejects salvage above cost, zero cost and fractional lives', () => {
    expect(solve({ method: 'sl', cost: 100, salvage: 200, life: 3 }).warnings[0]?.key).toBe(
      'warn.salvage',
    );
    expect(solve({ method: 'sl', cost: 0, salvage: 0, life: 3 }).warnings[0]?.key).toBe(
      'warn.cost',
    );
    expect(solve({ method: 'sl', cost: 100, salvage: 0, life: 2.5 }).warnings[0]?.key).toBe(
      'warn.life',
    );
  });
  it('units short of the total leave a remainder note', () =>
    expect(
      solve({ method: 'units', cost: 1000, salvage: 0, totalUnits: 100, used: '10' }).warnings.map(
        (w) => w.key,
      ),
    ).toContain('warn.remaining'));
});

describe('depreciation: properties', () => {
  it('straight line and DDB always total cost − salvage and never go below salvage', () =>
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1e9 }),
        fc.integer({ min: 0, max: 1e9 }),
        fc.integer({ min: 1, max: 60 }),
        fc.constantFrom('sl', 'ddb') as fc.Arbitrary<'sl' | 'ddb'>,
        (a, b, life, method) => {
          const [cost, salvage] = a >= b ? [a, b] : [b, a];
          const rows = schedule(method, cost, salvage, life);
          return (
            rows.length === life &&
            rows.at(-1)!.accumulated === cost - salvage &&
            rows.every((r) => r.book >= salvage && r.dep >= 0 && Number.isInteger(r.dep))
          );
        },
      ),
    ));
  it('DDB never charges less than straight line in year 1', () =>
    fc.assert(
      fc.property(fc.integer({ min: 100, max: 1e9 }), fc.integer({ min: 2, max: 60 }), (c, n) => {
        return schedule('ddb', c, 0, n)[0]!.dep >= schedule('sl', c, 0, n)[0]!.dep;
      }),
    ));
});

describe('depreciation: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const o = solve(e.inputs).outputs;
    for (const [k, v] of Object.entries(e.expect)) expect(o[k]).toBe(v);
  });
});
