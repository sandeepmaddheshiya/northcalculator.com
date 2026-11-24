import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { stateFromSeed, uniformBelow, xoshiro128ss } from '@/engine/random';
import { SIDES } from './definition';

/**
 * Rolls k fair dice with s sides: each die is a uniform integer 1…s (xoshiro128**, rejection
 * sampling; seed from crypto.getRandomValues via the island). The expected total of k dice is
 * k × (s + 1) ÷ 2, plus the modifier; the range is k + m to k × s + m.
 */
export const compute: ComputeFn = (inputs, { fmt }) => {
  const k = typeof inputs.dice === 'number' ? Math.round(inputs.dice) : null;
  const s = (SIDES as readonly string[]).includes(String(inputs.sides)) ? Number(inputs.sides) : 6;
  const m = typeof inputs.modifier === 'number' ? Math.round(inputs.modifier) : 0;
  if (k === null || k < 1 || k > 100) {
    const none: ComputeResult = { outputs: { total: null }, steps: [], warnings: [] };
    return none;
  }
  const rng = xoshiro128ss(stateFromSeed(String(inputs.seed ?? '1')));
  const rolls = Array.from({ length: k }, () => 1 + uniformBelow(rng, s));
  const sum = rolls.reduce((a, b) => a + b, 0);
  const total = sum + m;
  const nf = (x: number) => fmt.int(x);
  const mod = m === 0 ? '' : m > 0 ? ` + ${nf(m)}` : ` − ${nf(-m)}`;
  return {
    outputs: {
      total,
      rolls: rolls.map(nf).join(', '),
      range: `${nf(k + m)}–${nf(k * s + m)}`,
      expected: (k * (s + 1)) / 2 + m,
    },
    explain: { key: 'explain', values: { dice: `${k}d${s}${mod}`, total: nf(total) } },
    steps: [
      { key: 'step.rolls', math: `${rolls.map(nf).join(' + ')}${mod} = ${nf(total)}` },
      {
        key: 'step.expected',
        math: `${k} × (${s} + 1) ÷ 2${mod} = ${fmt.num((k * (s + 1)) / 2 + m, 2)}`,
      },
    ],
    warnings: [],
  };
};
