/**
 * Money in integer minor units (ADR-017). Amounts are integers (cents, paise…); rates are doubles.
 * Rounding to the minor unit is half-up (away from zero for negatives, matching bank statements).
 */

const digitCache = new Map<string, number>();

/** Number of minor-unit digits for an ISO 4217 currency (USD 2, JPY 0, BHD 3). */
export function minorDigits(currency: string): number {
  let d = digitCache.get(currency);
  if (d === undefined) {
    try {
      d =
        new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions()
          .maximumFractionDigits ?? 2;
    } catch {
      d = 2;
    }
    digitCache.set(currency, d);
  }
  return d;
}

/** Round half away from zero to an integer, robust to binary noise (e.g. 1.005 * 100). */
export function roundHalfUp(x: number): number {
  // Collapse binary representation error first (1.005 * 100 = 100.49999999999999 → 100.5).
  const r = Math.abs(clean(x));
  return Math.sign(x) * Math.floor(r + 0.5);
}

/** Banker's rounding (half to even) to an integer. */
export function roundHalfEven(x: number): number {
  const r = clean(x);
  const f = Math.floor(r);
  const diff = r - f;
  if (diff > 0.5) return f + 1;
  if (diff < 0.5) return f;
  return f % 2 === 0 ? f : f + 1;
}

/** Round to `dp` decimal places, half-up. */
export function roundTo(x: number, dp: number): number {
  const m = 10 ** dp;
  return roundHalfUp(x * m) / m;
}

/** Remove floating-point noise for display: keep 12 significant digits. */
export function clean(x: number, sig = 12): number {
  if (!Number.isFinite(x) || x === 0) return x;
  return Number(x.toPrecision(sig));
}

export function toMinor(amount: number, digits: number): number {
  return roundHalfUp(amount * 10 ** digits);
}

export function fromMinor(minor: number, digits: number): number {
  return minor / 10 ** digits;
}
