import { lnGamma } from './stats';

/**
 * Regularized upper incomplete gamma Q(a, x) = Γ(a, x)/Γ(a): the series for P when x < a + 1,
 * otherwise the continued fraction for Q (modified Lentz), each to about 1e−15. Computing Q
 * directly keeps small upper tails (tiny p-values) accurate.
 */
export function gammaQ(a: number, x: number): number {
  if (x <= 0) return 1;
  const lead = Math.exp(-x + a * Math.log(x) - lnGamma(a));
  if (x < a + 1) {
    let ap = a;
    let del = 1 / a;
    let sum = del;
    for (let n = 0; n < 1000; n++) {
      ap += 1;
      del *= x / ap;
      sum += del;
      if (Math.abs(del) < Math.abs(sum) * 1e-16) break;
    }
    return 1 - sum * lead;
  }
  const tiny = 1e-300;
  let b = x + 1 - a;
  let c = 1 / tiny;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i < 1000; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < tiny) d = tiny;
    c = b + an / c;
    if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 1e-16) break;
  }
  return lead * h;
}

/** Chi-square upper tail P(X > x) with k degrees of freedom. */
export function chiSqSf(x: number, k: number): number {
  return gammaQ(k / 2, x / 2);
}

/** Chi-square quantile: the x with P(X > x) = alpha, by bisection (monotone). */
export function chiSqInv(alpha: number, k: number): number {
  let lo = 0;
  let hi = Math.max(1, k);
  while (chiSqSf(hi, k) > alpha) hi *= 2;
  for (let i = 0; i < 200 && hi - lo > 1e-14 * hi; i++) {
    const mid = (lo + hi) / 2;
    if (chiSqSf(mid, k) > alpha) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}
