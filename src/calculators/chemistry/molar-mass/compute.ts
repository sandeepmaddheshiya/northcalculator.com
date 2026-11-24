import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean, roundTo } from '@/engine/money';
import { WEIGHTS } from './elements';
import { parseFormula } from './parse';

/**
 * Molar mass = Σ (atoms of each element × its standard atomic weight), OpenStax Chemistry 2e
 * §3.1, with the CIAAW abridged standard atomic weights 2024 (elements.ts). Moles = mass ÷ molar
 * mass; particles = moles × the Avogadro constant 6.02214076 × 10²³ mol⁻¹ (exact since the 2019
 * SI redefinition). The sum is rounded to 6 decimals to remove binary noise.
 */
export const AVOGADRO = 6.02214076e23;

export const compute: ComputeFn = (inputs, { fmt }) => {
  const formula = String(inputs.formula ?? '');
  const none = (key?: string, values?: Record<string, string>): ComputeResult => ({
    outputs: { molarMass: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn', values }] : [],
  });
  if (!formula.trim()) return none();
  const parsed = parseFormula(formula);
  if (!(parsed instanceof Map)) return none(`warn.${parsed.error}`, { at: parsed.at ?? '' });
  const missing = [...parsed.keys()].filter((el) => WEIGHTS[el] === null);
  if (missing.length) return none('warn.unstable', { at: missing.join(', ') });
  const parts = [...parsed].map(([el, n]) => ({ el, n, mass: n * WEIGHTS[el]! }));
  const molarMass = roundTo(
    parts.reduce((a, p) => a + p.mass, 0),
    6,
  );
  if (!(molarMass > 0)) return none('warn.syntax');
  const g = typeof inputs.mass === 'number' ? inputs.mass : null;
  const moles = g === null ? null : clean(g / molarMass);
  return {
    outputs: {
      molarMass,
      moles,
      particles: moles === null ? null : clean(moles * AVOGADRO),
      atoms: parts.reduce((a, p) => a + p.n, 0),
    },
    explain: { key: 'explain', values: { m: fmt.num(molarMass, 4) } },
    steps: [
      ...parts.map((p) => ({
        key: 'step.element',
        values: { el: p.el },
        math: `${p.n} × ${WEIGHTS[p.el]} = ${fmt.num(roundTo(p.mass, 6), 6)} (${fmt.pct(roundTo((p.mass / molarMass) * 100, 2), 2)})`,
      })),
      { key: 'step.sum', math: `${fmt.num(molarMass, 6)} g/mol` },
      ...(moles === null
        ? []
        : [
            {
              key: 'step.moles',
              math: `${fmt.num(g!, 6)} g ÷ ${fmt.num(molarMass, 6)} g/mol = ${fmt.sig(moles, 8)} mol`,
            },
          ]),
    ],
    warnings: [],
  };
};
