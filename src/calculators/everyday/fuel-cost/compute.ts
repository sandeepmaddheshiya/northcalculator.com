import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { fromMinor, minorDigits, roundHalfUp, roundTo, toMinor } from '@/engine/money';

/**
 * Trip fuel cost = fuel used × price per unit of fuel, where fuel used = distance ÷ efficiency
 * (or distance × consumption). Everything is converted through litres and kilometres with the
 * exact factors in NIST SP 811 Appendix B: 1 mi = 1.609344 km, 1 US gal = 3.785411784 L,
 * 1 UK gal = 4.54609 L. The cost is rounded half-up to the smallest currency unit.
 */
const KM_PER = { km: 1, mi: 1.609344 } as const;
const L_PER = { L: 1, galUS: 3.785411784, galUK: 4.54609 } as const;

/** Litres used per kilometre for an efficiency figure in the given unit. */
export function litresPerKm(value: number, unit: string): number | null {
  if (!(value > 0)) return null;
  switch (unit) {
    case 'mpgUS':
      return L_PER.galUS / (KM_PER.mi * value);
    case 'mpgUK':
      return L_PER.galUK / (KM_PER.mi * value);
    case 'l100':
      return value / 100;
    case 'kml':
      return 1 / value;
    default:
      return null;
  }
}

export const compute: ComputeFn = (inputs, ctx) => {
  const { fmt } = ctx;
  const t = ctx.t ?? ((k: string) => k);
  const num = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const distance = num('distance');
  const eff = num('efficiency');
  const price = num('price');
  const people = Math.max(1, Math.round(num('people') ?? 1));
  const distUnit = inputs.distUnit === 'km' ? 'km' : 'mi';
  const priceUnit =
    inputs.priceUnit === 'L' || inputs.priceUnit === 'galUK' ? inputs.priceUnit : 'galUS';
  const effUnit = String(inputs.effUnit ?? 'mpgUS');
  const none = (key?: string): ComputeResult => ({
    outputs: { cost: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  if (distance === null || eff === null || price === null) return none();
  const lpk = litresPerKm(eff, effUnit);
  if (lpk === null) return none('warn.efficiency');

  const trips = inputs.roundTrip === true ? 2 : 1;
  const km = distance * trips * KM_PER[distUnit];
  const litres = km * lpk;
  const fuel = litres / L_PER[priceUnit];
  const d = minorDigits(fmt.currency);
  const costMinor = roundHalfUp(roundTo(fuel, 9) * toMinor(price, d));
  const cost = fromMinor(costMinor, d);
  const dist = distance * trips;
  return {
    outputs: {
      cost,
      fuel: roundTo(fuel, 6),
      perDistance: dist > 0 ? roundTo(cost / dist, 6) : null,
      each: people > 1 ? fromMinor(roundHalfUp(costMinor / people), d) : null,
      l100: effUnit === 'l100' ? null : roundTo(lpk * 100, 4),
    },
    explain: {
      key: people > 1 ? 'explain.split' : 'explain',
      values: {
        dist: fmt.num(dist, 2),
        unit: t(`word.${distUnit}`),
        fuelUnit: t(`word.${priceUnit}`),
        fuel: fmt.num(roundTo(fuel, 2), 2),
        cost: fmt.money(cost),
        each: fmt.money(fromMinor(roundHalfUp(costMinor / people), d)),
        n: people,
      },
    },
    steps: [
      ...(trips === 2
        ? [{ key: 'step.roundTrip', math: `${fmt.num(distance, 4)} × 2 = ${fmt.num(dist, 4)}` }]
        : []),
      {
        key: 'step.fuel',
        math:
          effUnit === 'l100'
            ? `${fmt.num(km, 4)} km × ${fmt.num(eff, 4)} ÷ 100 = ${fmt.num(roundTo(litres, 4), 4)} L`
            : effUnit === 'kml'
              ? `${fmt.num(km, 4)} km ÷ ${fmt.num(eff, 4)} = ${fmt.num(roundTo(litres, 4), 4)} L`
              : `${fmt.num(roundTo(km / KM_PER.mi, 4), 4)} mi ÷ ${fmt.num(eff, 4)} = ${fmt.num(roundTo(km / KM_PER.mi / eff, 4), 4)} gal`,
      },
      {
        key: 'step.cost',
        math: `${fmt.num(roundTo(fuel, 4), 4)} × ${fmt.money(price)} = ${fmt.money(cost)}`,
      },
    ],
    warnings: [],
  };
};
