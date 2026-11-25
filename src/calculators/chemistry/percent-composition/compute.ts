import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean, roundTo } from '@/engine/money';
import { WEIGHTS } from '@/calculators/chemistry/molar-mass/elements';
import { parseFormula } from '@/calculators/chemistry/molar-mass/parse';

/**
 * Percent composition by mass (OpenStax Chemistry 2e §3.2; LibreTexts Introductory Chemistry
 * §6.7): % element = mass of the element ÷ mass of the compound × 100. From a formula, the masses
 * are atoms × standard atomic weight (CIAAW abridged 2024, shared with the molar mass calculator);
 * from measured masses, each element's mass is divided by their total. Optionally, a sample mass
 * gives the grams of each element in it.
 */
export interface Part {
  el: string;
  n: number | null;
  mass: number;
  pct: number;
}

/** "C 7.34, H 1.85; N 2.85" → element masses (repeats are added). */
export function parseMasses(text: string): { masses: Map<string, number>; bad: number } {
  const masses = new Map<string, number>();
  let bad = 0;
  for (const chunk of text.split(/[,;\n]+/)) {
    const c = chunk.trim();
    if (!c) continue;
    const m =
      /^([A-Z][a-z]?)\s*[:=]?\s*(\d+(?:\.\d+)?)\s*g?$/.exec(c) ??
      /^(\d+(?:\.\d+)?)\s*g?\s+([A-Z][a-z]?)$/.exec(c);
    if (!m) {
      bad++;
      continue;
    }
    const [el, v] = /^\d/.test(m[1]!) ? [m[2]!, Number(m[1])] : [m[1]!, Number(m[2])];
    if (!(el in WEIGHTS)) {
      bad++;
      continue;
    }
    masses.set(el, (masses.get(el) ?? 0) + v);
  }
  return { masses, bad };
}

export const compute: ComputeFn = (inputs, { fmt }) => {
  const none = (key?: string, values?: Record<string, string>): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn', values }] : [],
  });
  const fromMasses = inputs.mode === 'masses';
  const warnings: ComputeResult['warnings'] = [];
  let parts: Part[];
  let total: number;
  if (fromMasses) {
    const { masses, bad } = parseMasses(String(inputs.masses ?? ''));
    if (bad) warnings.push({ key: 'warn.bad', level: 'info', values: { n: String(bad) } });
    total = [...masses.values()].reduce((a, b) => a + b, 0);
    if (!(total > 0)) {
      const empty = none();
      empty.warnings.push(...warnings, { key: 'warn.noMasses', level: 'warn' });
      return empty;
    }
    parts = [...masses].map(([el, mass]) => ({ el, n: null, mass, pct: (mass / total) * 100 }));
  } else {
    const formula = String(inputs.formula ?? '');
    if (!formula.trim()) return none();
    const parsed = parseFormula(formula);
    if (!(parsed instanceof Map)) return none(`warn.${parsed.error}`, { at: parsed.at ?? '' });
    const missing = [...parsed.keys()].filter((el) => WEIGHTS[el] === null);
    if (missing.length) return none('warn.unstable', { at: missing.join(', ') });
    const raw = [...parsed].map(([el, n]) => ({ el, n, mass: n * WEIGHTS[el]! }));
    total = roundTo(
      raw.reduce((a, p) => a + p.mass, 0),
      6,
    );
    if (!(total > 0)) return none('warn.syntax');
    parts = raw.map((p) => ({ ...p, mass: roundTo(p.mass, 6), pct: (p.mass / total) * 100 }));
  }
  const sample = !fromMasses && typeof inputs.sample === 'number' ? inputs.sample : null;
  // Four significant figures, keeping trailing zeros (60.00%), as chemistry texts print them.
  const four = new Intl.NumberFormat(fmt.locale, {
    minimumSignificantDigits: 4,
    maximumSignificantDigits: 4,
  });
  const pctText = (p: number) => `${four.format(clean(p))}%`;
  const top = [...parts].sort((a, b) => b.pct - a.pct)[0]!;

  return {
    outputs: {
      result: parts.map((p) => `${p.el} ${pctText(p.pct)}`).join(', '),
      molarMass: fromMasses ? null : total,
      total: fromMasses ? clean(total) : null,
      elements: parts.length,
    },
    explain: {
      key: fromMasses ? 'explain.masses' : 'explain.formula',
      values: { el: top.el, pct: pctText(top.pct), m: fmt.num(total, 4) },
    },
    steps: [
      ...parts.map((p) => ({
        key: 'step.element',
        values: { el: p.el },
        math: `${p.n === null ? fmt.num(p.mass, 6) : `${p.n} × ${WEIGHTS[p.el]}`} ÷ ${fmt.num(total, 6)} × 100 = ${pctText(p.pct)}`,
      })),
    ],
    table: {
      captionKey: 'table.caption',
      columns: [
        { key: 'table.element', format: 'text' },
        ...(fromMasses ? [] : [{ key: 'table.atoms', format: 'integer' as const }]),
        { key: fromMasses ? 'table.mass' : 'table.molar', format: 'sig' },
        { key: 'table.pct', format: 'sig' },
        ...(sample === null ? [] : [{ key: 'table.grams', format: 'sig' as const }]),
      ],
      rows: parts.map((p) => [
        p.el,
        ...(fromMasses ? [] : [p.n!]),
        clean(p.mass),
        clean(p.pct),
        ...(sample === null ? [] : [clean((sample * p.pct) / 100)]),
      ]),
    },
    warnings,
  };
};
