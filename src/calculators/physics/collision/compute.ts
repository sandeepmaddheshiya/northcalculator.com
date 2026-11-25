import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * One-dimensional two-body collisions (OpenStax College Physics 2e §8.4–8.5; University Physics
 * Vol. 1 §9.4). Momentum is always conserved: m₁v₁ + m₂v₂ = m₁v₁′ + m₂v₂′.
 *  - elastic (kinetic energy also conserved): v₁′ = ((m₁−m₂)v₁ + 2m₂v₂) ÷ (m₁+m₂),
 *    v₂′ = ((m₂−m₁)v₂ + 2m₁v₁) ÷ (m₁+m₂);
 *  - perfectly inelastic (stick together): v′ = (m₁v₁ + m₂v₂) ÷ (m₁+m₂);
 *  - general: with v₁′ measured, v₂′ = (m₁v₁ + m₂v₂ − m₁v₁′) ÷ m₂.
 * Velocities are signed: choose a positive direction and use negative values for the other.
 */
export type Kind = 'elastic' | 'inelastic' | 'known';

export function collide(
  kind: Kind,
  m1: number,
  v1: number,
  m2: number,
  v2: number,
  v1f = 0,
): [number, number] {
  const M = m1 + m2;
  if (kind === 'elastic')
    return [((m1 - m2) * v1 + 2 * m2 * v2) / M, ((m2 - m1) * v2 + 2 * m1 * v1) / M];
  if (kind === 'inelastic') {
    const v = (m1 * v1 + m2 * v2) / M;
    return [v, v];
  }
  return [v1f, (m1 * v1 + m2 * v2 - m1 * v1f) / m2];
}

export const compute: ComputeFn = (inputs, { fmt }) => {
  const num = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const kind: Kind =
    inputs.kind === 'inelastic' || inputs.kind === 'known' ? inputs.kind : 'elastic';
  const [m1, v1, m2, v2] = ['m1', 'v1', 'm2', 'v2'].map(num);
  const v1fIn = kind === 'known' ? num('v1f') : 0;
  if (m1 == null || v1 == null || m2 == null || v2 == null || v1fIn === null) return none();
  if (!(m1 > 0) || !(m2 > 0)) return none('warn.mass');
  const [a, b] = collide(kind, m1, v1, m2, v2, v1fIn);
  const keBefore = 0.5 * m1 * v1 * v1 + 0.5 * m2 * v2 * v2;
  const keAfter = 0.5 * m1 * a * a + 0.5 * m2 * b * b;
  const change = keAfter - keBefore;
  const p = m1 * v1 + m2 * v2;
  const s = (x: number) => fmt.sig(clean(x), 6);
  const warnings: ComputeResult['warnings'] = [];
  if (kind === 'known' && change > 1e-12 * (keBefore + 1))
    warnings.push({ key: 'warn.gain', level: 'info' });
  if (kind === 'known' && Math.sign(a - b) * Math.sign(v1 - v2) > 0 && v1 !== v2)
    warnings.push({ key: 'warn.pass', level: 'warn' });

  return {
    outputs: {
      result: kind === 'inelastic' ? `${s(a)} m/s` : `${s(a)} m/s, ${s(b)} m/s`,
      v1f: clean(a),
      v2f: clean(b),
      keBefore: clean(keBefore),
      keAfter: clean(keAfter),
      keChange: clean(Math.abs(change) < 1e-12 * (keBefore + 1) ? 0 : change),
      lostPct: keBefore > 0 && change < 0 ? clean((-change / keBefore) * 100) : null,
      momentum: clean(p),
    },
    explain: {
      key: kind === 'inelastic' ? 'explain.stick' : 'explain.two',
      values: { a: s(a), b: s(b), ke: s(Math.abs(change)) },
    },
    steps: [
      { key: 'step.p', math: `${s(m1)} × ${s(v1)} + ${s(m2)} × ${s(v2)} = ${s(p)} kg·m/s` },
      kind === 'elastic'
        ? {
            key: 'step.elastic',
            math: `v₁′ = (${s(m1 - m2)} × ${s(v1)} + 2 × ${s(m2)} × ${s(v2)}) ÷ ${s(m1 + m2)} = ${s(a)}; v₂′ = (${s(m2 - m1)} × ${s(v2)} + 2 × ${s(m1)} × ${s(v1)}) ÷ ${s(m1 + m2)} = ${s(b)}`,
          }
        : kind === 'inelastic'
          ? { key: 'step.inelastic', math: `${s(p)} ÷ ${s(m1 + m2)} = ${s(a)} m/s` }
          : { key: 'step.known', math: `(${s(p)} − ${s(m1)} × ${s(a)}) ÷ ${s(m2)} = ${s(b)} m/s` },
      { key: 'step.ke', math: `${s(keBefore)} J → ${s(keAfter)} J` },
    ],
    warnings,
  };
};
