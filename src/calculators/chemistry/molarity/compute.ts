import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Molarity M = moles of solute ÷ litres of solution (OpenStax Chemistry 2e §3.3; LibreTexts
 * Introductory Chemistry §13.6), solved for the molarity, the amount of solute (moles, or grams
 * via the molar mass) or the volume of solution. Volume is the total solution, not the solvent.
 */
export const compute: ComputeFn = (inputs, { fmt }) => {
  const val = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const find = inputs.find === 'amount' || inputs.find === 'volume' ? inputs.find : 'molarity';
  const grams = inputs.au !== 'mol';
  const mm = val('mm');
  const toL = (v: number) => (inputs.vu === 'L' ? v : v / 1000);
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  if (grams && !(mm !== null && mm > 0)) return none('warn.mm');
  const toMol = (a: number) => (grams ? a / mm! : a);
  let mol: number;
  let L: number;
  let M: number;
  if (find === 'molarity') {
    const a = val('amount');
    const v = val('volume');
    if (a === null || v === null) return none();
    if (!(v > 0)) return none('warn.volume');
    mol = toMol(a);
    L = toL(v);
    M = mol / L;
  } else if (find === 'amount') {
    const m = val('molarity');
    const v = val('volume');
    if (m === null || v === null) return none();
    M = m;
    L = toL(v);
    mol = M * L;
  } else {
    const a = val('amount');
    const m = val('molarity');
    if (a === null || m === null) return none();
    if (!(m > 0)) return none('warn.molarity');
    mol = toMol(a);
    M = m;
    L = mol / M;
  }
  const g = mm !== null && mm > 0 ? mol * mm : null;
  const s = (x: number) => fmt.sig(clean(x), 8);
  const result =
    find === 'molarity'
      ? `${s(M)} M`
      : find === 'amount'
        ? grams && g !== null
          ? `${s(g)} g`
          : `${s(mol)} mol`
        : inputs.vu === 'L'
          ? `${s(L)} L`
          : `${s(L * 1000)} mL`;
  return {
    outputs: {
      result,
      M: clean(M),
      mol: clean(mol),
      grams: grams && g !== null ? clean(g) : null,
      L: clean(L),
    },
    explain: { key: 'explain', values: { mol: s(mol), L: s(L), M: s(M) } },
    steps: [
      ...(grams
        ? [{ key: 'step.mol', math: `${s(g ?? 0)} g ÷ ${s(mm!)} g/mol = ${s(mol)} mol` }]
        : []),
      find === 'molarity'
        ? { key: 'step.molarity', math: `${s(mol)} mol ÷ ${s(L)} L = ${s(M)} M` }
        : find === 'amount'
          ? { key: 'step.amount', math: `${s(M)} M × ${s(L)} L = ${s(mol)} mol` }
          : { key: 'step.volume', math: `${s(mol)} mol ÷ ${s(M)} M = ${s(L)} L` },
    ],
    warnings: [],
  };
};
