import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { roundTo } from '@/engine/money';
import { CBSE_GRADES } from './definition';

/**
 * CBSE indicative percentage (FAQ 2015/2016; CCE Manual 2011): overall % = 9.5 × CGPA, where CGPA
 * is the average grade point of the main subjects (the additional 6th subject is excluded).
 * Subject-wise % = 9.5 × grade point. Grade points from the nine-point scale (A1 = 10 … E2 = 2).
 */
export const compute: ComputeFn = (inputs, { fmt }) => {
  const none = (key?: string): ComputeResult => ({
    outputs: { percent: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  let cgpa: number;
  const steps: ComputeResult['steps'] = [];
  let table: ComputeResult['table'];
  if (inputs.mode === 'grades') {
    const rows = Array.isArray(inputs.subjects)
      ? (inputs.subjects as readonly Record<string, unknown>[])
      : [];
    const gps = rows
      .map((r) => CBSE_GRADES[String(r.grade)]?.[0])
      .filter((x): x is number => x !== undefined);
    if (!gps.length) return none('warn.empty');
    cgpa = roundTo(gps.reduce((a, b) => a + b, 0) / gps.length, 4);
    steps.push({
      key: 'step.average',
      math: `(${gps.join(' + ')}) ÷ ${gps.length} = ${fmt.num(cgpa, 2)}`,
    });
    table = {
      captionKey: 'table.caption',
      columns: [
        { key: 'table.n', format: 'integer' },
        { key: 'table.grade', format: 'text' },
        { key: 'table.gp', format: 'number' },
        { key: 'table.pct', format: 'percent' },
      ],
      rows: rows
        .map((r, i) => [i + 1, String(r.grade)] as const)
        .filter(([, g]) => g in CBSE_GRADES)
        .map(([i, g]) => [
          i,
          `grade.${g}`,
          CBSE_GRADES[g]![0],
          roundTo(9.5 * CBSE_GRADES[g]![0], 2),
        ]),
    };
  } else {
    const c = typeof inputs.cgpa === 'number' ? inputs.cgpa : null;
    if (c === null) return none();
    if (c < 0 || c > 10) return none('warn.range');
    cgpa = c;
  }
  const percent = roundTo(9.5 * cgpa, 4);
  steps.push({ key: 'step.multiply', math: `9.5 × ${fmt.num(cgpa, 4)} = ${fmt.num(percent, 4)}%` });
  const warnings: ComputeResult['warnings'] = [];
  if (inputs.mode === 'grades' && Array.isArray(inputs.subjects) && inputs.subjects.length > 5)
    warnings.push({ key: 'warn.sixth', level: 'info' });
  return {
    outputs: { percent, cgpaOut: cgpa },
    explain: { key: 'explain', values: { c: fmt.num(cgpa, 2), p: fmt.pct(percent, 1) } },
    steps,
    ...(table ? { table } : {}),
    warnings,
  };
};
