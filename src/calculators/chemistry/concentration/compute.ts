import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Solution concentration in several units from the masses of solute and solvent (OpenStax
 * Chemistry 2e §3.4 and §11.4; LibreTexts Introductory Chemistry §13.5):
 *   mass % = solute ÷ solution × 100, ppm = × 10⁶, ppb = × 10⁹,
 *   molality = mol solute ÷ kg solvent, mole fraction = mol solute ÷ (mol solute + mol solvent),
 *   molarity = mol solute ÷ L solution, with L = solution mass ÷ density (if a density is given).
 * The second mass may be the solvent or the whole solution.
 */
export const compute: ComputeFn = (inputs, { fmt }) => {
  const num = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const none = (key?: string): ComputeResult => ({
    outputs: { pct: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const g = num('solute');
  const other = num('other');
  if (g === null || other === null) return none();
  if (g < 0 || !(other > 0)) return none('warn.mass');
  const isSolution = inputs.basis === 'solution';
  const solution = isSolution ? other : g + other;
  const solvent = isSolution ? other - g : other;
  if (!(solvent >= 0)) return none('warn.order');
  const mm = num('mm');
  const mmSolvent = num('mmSolvent');
  const density = num('density');
  const s = (x: number) => fmt.sig(clean(x), 6);
  const frac = g / solution;
  const mol = mm !== null && mm > 0 ? g / mm : null;
  const molSolvent = mmSolvent !== null && mmSolvent > 0 ? solvent / mmSolvent : null;
  const molality = mol !== null && solvent > 0 ? mol / (solvent / 1000) : null;
  const x =
    mol !== null && molSolvent !== null && mol + molSolvent > 0 ? mol / (mol + molSolvent) : null;
  const litres = density !== null && density > 0 ? solution / density / 1000 : null;
  const molarity = mol !== null && litres !== null ? mol / litres : null;
  const steps: ComputeResult['steps'] = [
    { key: 'step.pct', math: `${s(g)} ÷ ${s(solution)} × 100 = ${s(frac * 100)}%` },
  ];
  if (mol !== null)
    steps.push({ key: 'step.mol', math: `${s(g)} g ÷ ${s(mm!)} g/mol = ${s(mol)} mol` });
  if (molality !== null)
    steps.push({
      key: 'step.molality',
      math: `${s(mol!)} mol ÷ ${s(solvent / 1000)} kg = ${s(molality)} mol/kg`,
    });
  if (x !== null)
    steps.push({ key: 'step.x', math: `${s(mol!)} ÷ (${s(mol!)} + ${s(molSolvent!)}) = ${s(x)}` });
  if (molarity !== null)
    steps.push({
      key: 'step.molarity',
      math: `${s(mol!)} mol ÷ ${s(litres!)} L = ${s(molarity)} mol/L`,
    });

  return {
    outputs: {
      pct: clean(frac * 100),
      ppm: clean(frac * 1e6),
      ppb: clean(frac * 1e9),
      molality: molality === null ? null : clean(molality),
      x: x === null ? null : clean(x),
      molarity: molarity === null ? null : clean(molarity),
      solution: clean(solution),
      solvent: clean(solvent),
    },
    explain: { key: 'explain', values: { p: s(frac * 100), m: s(solution) } },
    steps,
    warnings: [],
  };
};
