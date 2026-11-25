import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Solves a 2×2 or 3×3 linear system (OpenStax College Algebra 2e §7.2, §7.8). The determinant
 * D decides the case: D ≠ 0 gives one solution, by Cramer’s rule x = Dx/D, …; D = 0 means no
 * solution or infinitely many, which Gaussian elimination with partial pivoting tells apart by
 * comparing the ranks of the coefficient and augmented matrices. With whole-number inputs the
 * answer is shown as exact reduced fractions.
 */
const MINUS = '−';
type M = number[][];

export function det(m: M): number {
  if (m.length === 2) return m[0]![0]! * m[1]![1]! - m[1]![0]! * m[0]![1]!;
  const [[a, b, c], [d, e, f], [g, h, i]] = m as [
    [number, number, number],
    [number, number, number],
    [number, number, number],
  ];
  return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
}

/** Rank of a matrix by elimination with partial pivoting and a relative tolerance. */
export function rank(m: M): number {
  const a = m.map((r) => [...r]);
  const rows = a.length;
  const cols = a[0]!.length;
  const scale = Math.max(1, ...a.flat().map(Math.abs));
  let r = 0;
  for (let c = 0; c < cols && r < rows; c++) {
    let p = r;
    for (let k = r + 1; k < rows; k++) if (Math.abs(a[k]![c]!) > Math.abs(a[p]![c]!)) p = k;
    if (Math.abs(a[p]![c]!) <= 1e-10 * scale) continue;
    [a[r], a[p]] = [a[p]!, a[r]!];
    for (let k = r + 1; k < rows; k++) {
      const f = a[k]![c]! / a[r]![c]!;
      for (let j = c; j < cols; j++) a[k]![j]! -= f * a[r]![j]!;
    }
    r++;
  }
  return r;
}

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
const frac = (p: number, q: number) => {
  if (q < 0) [p, q] = [-p, -q];
  const g = gcd(p, q) || 1;
  const s = q / g === 1 ? String(p / g) : `${p / g}/${q / g}`;
  return s.replace(/^-/, MINUS);
};

export const compute: ComputeFn = (inputs, ctx) => {
  const { fmt } = ctx;
  const t = ctx.t ?? ((k: string) => k);
  const n = inputs.size === '2' ? 2 : 3;
  const none = (key?: string): ComputeResult => ({
    outputs: { solution: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const v = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const cols = n === 2 ? ['a', 'b'] : ['a', 'b', 'c'];
  const A: M = [];
  const B: number[] = [];
  for (let r = 1; r <= n; r++) {
    const row = cols.map((c) => v(`${c}${r}`));
    const d = v(`d${r}`);
    if (row.some((x) => x === null) || d === null) return none();
    A.push(row as number[]);
    B.push(d);
  }
  const D = det(A);
  const names = ['x', 'y', 'z'].slice(0, n);
  const s = (x: number) => fmt.sig(clean(x), 10).replace(/^-/, MINUS);
  const scale = Math.max(1, ...A.flat().map(Math.abs)) ** n;
  if (Math.abs(D) <= 1e-12 * scale) {
    const rA = rank(A);
    const rAug = rank(A.map((row, i) => [...row, B[i]!]));
    const kind = rA < rAug ? 'none' : 'infinite';
    return {
      outputs: { solution: t(`solution.${kind}`), x: null, y: null, z: null, det: 0 },
      explain: { key: `explain.${kind}`, values: {} },
      steps: [{ key: 'step.det', math: `D = 0` }],
      warnings: [],
    };
  }
  const xs = names.map(
    (_, j) => det(A.map((row, i) => row.map((a, k) => (k === j ? B[i]! : a)))) / D,
  );
  const ints = [...A.flat(), ...B].every((x) => Number.isInteger(x) && Math.abs(x) <= 1e6);
  const parts = names.map((name, j) => {
    if (ints) {
      const Dj = det(A.map((row, i) => row.map((a, k) => (k === j ? B[i]! : a))));
      return `${name} = ${frac(Math.round(Dj), Math.round(D))}`;
    }
    return `${name} = ${s(xs[j]!)}`;
  });
  return {
    outputs: {
      solution: parts.join(', '),
      x: clean(xs[0]!),
      y: clean(xs[1]!),
      z: n === 3 ? clean(xs[2]!) : null,
      det: clean(D),
    },
    explain: { key: 'explain.one', values: { sol: parts.join(', ') } },
    steps: [
      { key: 'step.det', math: `D = ${s(D)}` },
      ...names.map((name, j) => ({
        key: 'step.cramer',
        values: { v: name },
        math: `${name} = D${name} ÷ D = ${s(xs[j]! * D)} ÷ ${s(D)} = ${s(xs[j]!)}`,
      })),
    ],
    warnings: [],
  };
};
