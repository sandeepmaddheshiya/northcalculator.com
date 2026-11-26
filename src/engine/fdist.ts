import { betaInc } from './stats';

/**
 * F distribution with (d1, d2) degrees of freedom. Upper tail P(F > f) = I_{d2/(d2 + d1 f)}(d2/2, d1/2),
 * the regularized incomplete beta function (NIST/SEMATECH e-Handbook §1.3.6.6.5).
 */
export function fSf(f: number, d1: number, d2: number): number {
  if (!(f > 0)) return 1;
  return betaInc(d2 / (d2 + d1 * f), d2 / 2, d1 / 2);
}

/** Critical value f with P(F > f) = alpha, by bisection (fSf is strictly decreasing). */
export function fInv(alpha: number, d1: number, d2: number): number {
  if (!(alpha > 0 && alpha < 1)) return NaN;
  let lo = 0;
  let hi = 1;
  while (fSf(hi, d1, d2) > alpha && hi < 1e12) hi *= 2;
  for (let i = 0; i < 200 && hi - lo > 1e-13 * hi; i++) {
    const mid = (lo + hi) / 2;
    if (fSf(mid, d1, d2) > alpha) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}
