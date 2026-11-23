/**
 * Loan and growth maths. Amortization runs in integer minor units (ADR-017).
 * Formula sources: standard annuity (present value of an ordinary annuity), e.g. OpenStax
 * Contemporary Mathematics §6.8; compound interest §6.5.
 */
import { roundHalfUp } from './money';

/** Level payment for a loan of `principal` over `n` periods at periodic rate `r` (unrounded). */
export function annuityPayment(principal: number, r: number, n: number): number {
  if (n <= 0) throw new RangeError('n must be positive');
  if (r === 0) return principal / n;
  return (principal * r) / (1 - (1 + r) ** -n);
}

export interface AmortRow {
  period: number;
  payment: number; // minor units, scheduled payment actually paid (incl. extra)
  interest: number;
  principal: number;
  extra: number;
  balance: number;
}

export interface AmortResult {
  /** Rounded level payment (minor units), before extras. */
  payment: number;
  rows: AmortRow[];
  totalInterest: number;
  totalPaid: number;
}

/**
 * Amortization ledger. Payment is rounded half-up to the minor unit; each period's interest is
 * rounded half-up; the final payment absorbs the residual so the balance ends at exactly 0.
 */
export function amortize(
  principalMinor: number,
  r: number,
  n: number,
  opts: { extraMinor?: number; extraFromPeriod?: number } = {},
): AmortResult {
  const payment = roundHalfUp(annuityPayment(principalMinor, r, n));
  const extraMinor = Math.max(0, Math.round(opts.extraMinor ?? 0));
  const from = opts.extraFromPeriod ?? 1;
  let balance = principalMinor;
  const rows: AmortRow[] = [];
  let totalInterest = 0;
  let totalPaid = 0;
  for (let k = 1; balance > 0 && k <= n; k++) {
    const interest = roundHalfUp(balance * r);
    let principal = payment - interest;
    let extra = k >= from ? extraMinor : 0;
    if (k === n || principal + extra >= balance) {
      // Final (or early payoff) period: pay off exactly what's left.
      principal = Math.min(principal, balance);
      extra = Math.max(0, balance - principal);
    }
    if (principal < 0) principal = 0; // negative amortization guard (rate × balance > payment)
    balance -= principal + extra;
    const paid = interest + principal + extra;
    totalInterest += interest;
    totalPaid += paid;
    rows.push({ period: k, payment: paid, interest, principal, extra, balance });
  }
  return { payment, rows, totalInterest, totalPaid };
}

export type Compounding =
  'annual' | 'semiannual' | 'quarterly' | 'monthly' | 'daily' | 'continuous';
export const PERIODS_PER_YEAR: Record<Exclude<Compounding, 'continuous'>, number> = {
  annual: 1,
  semiannual: 2,
  quarterly: 4,
  monthly: 12,
  daily: 365,
};

/** Effective rate per month for a nominal annual rate under a compounding convention. */
export function monthlyEffectiveRate(annualNominal: number, c: Compounding): number {
  if (c === 'continuous') return Math.expm1(annualNominal / 12);
  const m = PERIODS_PER_YEAR[c];
  return (1 + annualNominal / m) ** (m / 12) - 1;
}

/** Effective annual rate (APY) for a nominal annual rate. */
export function effectiveAnnualRate(annualNominal: number, c: Compounding): number {
  if (c === 'continuous') return Math.expm1(annualNominal);
  const m = PERIODS_PER_YEAR[c];
  return (1 + annualNominal / m) ** m - 1;
}

export interface GrowthPoint {
  month: number;
  balance: number;
  contributions: number; // cumulative incl. initial principal
  interest: number; // cumulative
}

/**
 * Month-by-month growth with monthly contributions. Interest compounds at the effective monthly
 * rate equivalent to the chosen convention (exact for whole compounding periods). Values are
 * unrounded doubles; round only for display.
 */
export function growth(
  principal: number,
  annualNominal: number,
  months: number,
  opts: { compounding: Compounding; monthly?: number; timing?: 'end' | 'start' },
): GrowthPoint[] {
  const i = monthlyEffectiveRate(annualNominal, opts.compounding);
  const c = opts.monthly ?? 0;
  let balance = principal;
  let contributions = principal;
  const out: GrowthPoint[] = [{ month: 0, balance, contributions, interest: 0 }];
  for (let k = 1; k <= months; k++) {
    if (opts.timing === 'start') {
      balance += c;
      contributions += c;
      balance *= 1 + i;
    } else {
      balance *= 1 + i;
      balance += c;
      contributions += c;
    }
    out.push({ month: k, balance, contributions, interest: balance - contributions });
  }
  return out;
}
