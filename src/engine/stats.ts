/**
 * Standard normal distribution. Φ(z) = ½ erfc(−z/√2), with erf from its all-positive series
 * erf x = (2/√π) e^(−x²) Σ 2ⁿ x^(2n+1) / (1·3·…·(2n+1)) for x < 3 and erfc from its continued
 * fraction for x ≥ 3; both are accurate to about 1e−15, far beyond the 5-decimal NIST/SEMATECH
 * table. The inverse uses Acklam's rational approximation refined by one Halley step against Φ.
 */
function erfcPos(x: number): number {
  if (x < 3) {
    let term = x;
    let sum = x;
    for (let n = 1; n < 200 && term > 1e-17 * sum; n++) {
      term *= (2 * x * x) / (2 * n + 1);
      sum += term;
    }
    return 1 - (2 / Math.sqrt(Math.PI)) * Math.exp(-x * x) * sum;
  }
  let f = x;
  for (let n = 60; n >= 1; n--) f = x + n / 2 / f;
  return Math.exp(-x * x) / Math.sqrt(Math.PI) / f;
}

export function normalCdf(z: number): number {
  if (Number.isNaN(z)) return NaN;
  if (!Number.isFinite(z)) return z > 0 ? 1 : 0;
  if (z === 0) return 0.5;
  const tail = 0.5 * erfcPos(Math.abs(z) / Math.SQRT2);
  return z > 0 ? 1 - tail : tail;
}

export function normalInv(p: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  const a = [
    -39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716,
    2.506628277459239,
  ];
  const b = [
    -54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972,
    -13.28068155288572,
  ];
  const c = [
    -0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734,
    4.374664141464968, 2.938163982698783,
  ];
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
  const lo = 0.02425;
  let x: number;
  if (p < lo) {
    const q = Math.sqrt(-2 * Math.log(p));
    x =
      (((((c[0]! * q + c[1]!) * q + c[2]!) * q + c[3]!) * q + c[4]!) * q + c[5]!) /
      ((((d[0]! * q + d[1]!) * q + d[2]!) * q + d[3]!) * q + 1);
  } else if (p > 1 - lo) {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    x =
      -(((((c[0]! * q + c[1]!) * q + c[2]!) * q + c[3]!) * q + c[4]!) * q + c[5]!) /
      ((((d[0]! * q + d[1]!) * q + d[2]!) * q + d[3]!) * q + 1);
  } else {
    const q = p - 0.5;
    const r = q * q;
    x =
      ((((((a[0]! * r + a[1]!) * r + a[2]!) * r + a[3]!) * r + a[4]!) * r + a[5]!) * q) /
      (((((b[0]! * r + b[1]!) * r + b[2]!) * r + b[3]!) * r + b[4]!) * r + 1);
  }
  const e = normalCdf(x) - p;
  const u = e * Math.sqrt(2 * Math.PI) * Math.exp((x * x) / 2);
  return x - u / (1 + (x * u) / 2);
}

/** ln Γ(x) for x > 0, Lanczos approximation (g = 7, n = 9), about 15 significant digits. */
export function lnGamma(x: number): number {
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];
  if (x < 0.5) return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * x))) - lnGamma(1 - x);
  x -= 1;
  let a = c[0]!;
  const t = x + 7.5;
  for (let i = 1; i < 9; i++) a += c[i]! / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

/** Continued fraction for the incomplete beta function (modified Lentz). */
function betaCf(x: number, a: number, b: number): number {
  const tiny = 1e-300;
  let c = 1;
  let d = 1 - ((a + b) * x) / (a + 1);
  if (Math.abs(d) < tiny) d = tiny;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= 300; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((a + m2 - 1) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < tiny) d = tiny;
    c = 1 + aa / c;
    if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (a + b + m) * x) / ((a + m2) * (a + m2 + 1));
    d = 1 + aa * d;
    if (Math.abs(d) < tiny) d = tiny;
    c = 1 + aa / c;
    if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 1e-15) break;
  }
  return h;
}

/** Regularized incomplete beta function I_x(a, b). */
export function betaInc(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(
    lnGamma(a + b) - lnGamma(a) - lnGamma(b) + a * Math.log(x) + b * Math.log(1 - x),
  );
  return x < (a + 1) / (a + b + 2)
    ? (bt * betaCf(x, a, b)) / a
    : 1 - (bt * betaCf(1 - x, b, a)) / b;
}

/** Student’s t CDF with ν degrees of freedom: 1 − ½ I_{ν/(ν+t²)}(ν/2, ½) for t ≥ 0. */
export function tCdf(t: number, nu: number): number {
  const tail = 0.5 * betaInc(nu / (nu + t * t), nu / 2, 0.5);
  return t >= 0 ? 1 - tail : tail;
}

/** Inverse of the t CDF by bisection (monotone, so it always converges); matches the NIST table. */
export function tInv(p: number, nu: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  if (p < 0.5) return -tInv(1 - p, nu);
  if (p === 0.5) return 0;
  let lo = 0;
  let hi = Math.max(1, normalInv(p) * 2);
  while (tCdf(hi, nu) < p) hi *= 2;
  for (let i = 0; i < 200 && hi - lo > 1e-15 * hi; i++) {
    const mid = (lo + hi) / 2;
    if (tCdf(mid, nu) < p) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** Alternative hypothesis for a t-test. */
export type Tail = 'two' | 'right' | 'left';

/** P(T > t) for Student's t with ν degrees of freedom. */
export function upperTail(t: number, nu: number): number {
  const half = 0.5 * betaInc(nu / (nu + t * t), nu / 2, 0.5);
  return t >= 0 ? half : 1 - half;
}

export function pValue(t: number, nu: number, tail: Tail): number {
  if (tail === 'right') return upperTail(t, nu);
  if (tail === 'left') return upperTail(-t, nu);
  return Math.min(1, 2 * upperTail(Math.abs(t), nu));
}
