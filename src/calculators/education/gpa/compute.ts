import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { roundTo } from '@/engine/money';
import { GRADE_POINTS } from './definition';

/**
 * Grade point average: Σ(grade points × credits) ÷ Σ credits (UC Berkeley registrar; College Board).
 * Weighted GPA adds a bonus per credit for honors and AP/IB courses, which schools set themselves;
 * the bonus is not added to an F. Cumulative GPA combines earlier credits with this term,
 * using the unweighted GPA. Results are rounded to 4 decimals and shown to 2.
 */
export const compute: ComputeFn = (inputs, { fmt }) => {
  const rows = Array.isArray(inputs.courses)
    ? (inputs.courses as readonly Record<string, unknown>[])
    : [];
  const num = (v: unknown) =>
    typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN;
  const aplus = inputs.aplus === '4.3' ? 4.3 : 4.0;
  const honors = typeof inputs.honors === 'number' ? inputs.honors : 0.5;
  const apBonus = typeof inputs.apBonus === 'number' ? inputs.apBonus : 1;

  let credits = 0;
  let points = 0;
  let weightedPoints = 0;
  let anyWeighted = false;
  let skipped = 0;
  const table: (readonly (string | number)[])[] = [];
  rows.forEach((r, i) => {
    const grade = String(r.grade ?? '');
    const c = num(r.credits);
    const base = grade === 'A+' ? aplus : GRADE_POINTS[grade];
    if (base === undefined || !Number.isFinite(c) || c <= 0) {
      skipped++;
      return;
    }
    const type = r.type === 'honors' || r.type === 'ap' ? r.type : 'regular';
    const bonus = base > 0 ? (type === 'honors' ? honors : type === 'ap' ? apBonus : 0) : 0;
    if (bonus > 0) anyWeighted = true;
    credits += c;
    points += base * c;
    weightedPoints += (base + bonus) * c;
    table.push([i + 1, `grade.${grade}`, c, base, base * c, `type.${type}`]);
  });

  if (credits === 0) {
    const none: ComputeResult = {
      outputs: { gpa: null },
      steps: [],
      warnings: [{ key: rows.length ? 'warn.noCredits' : 'warn.empty', level: 'warn' }],
    };
    return none;
  }

  const gpa = roundTo(points / credits, 4);
  const weighted = anyWeighted ? roundTo(weightedPoints / credits, 4) : null;
  const priorCredits = typeof inputs.priorCredits === 'number' ? inputs.priorCredits : 0;
  const priorGpa = typeof inputs.priorGpa === 'number' ? inputs.priorGpa : 0;
  const cumulative =
    priorCredits > 0
      ? roundTo((priorGpa * priorCredits + points) / (priorCredits + credits), 4)
      : null;

  const warnings: ComputeResult['warnings'] = [];
  if (skipped > 0) warnings.push({ key: 'warn.skipped', values: { n: skipped }, level: 'info' });
  if (priorGpa > 4.0 && priorCredits > 0)
    warnings.push({ key: 'warn.priorWeighted', level: 'info' });

  const steps = [
    {
      key: 'step.points',
      math:
        table
          .map((t) => `${fmt.num(t[3] as number, 2)} × ${fmt.num(t[2] as number, 2)}`)
          .join(' + ') + ` = ${fmt.num(points, 2)}`,
    },
    {
      key: 'step.credits',
      math: `${table.map((t) => fmt.num(t[2] as number, 2)).join(' + ')} = ${fmt.num(credits, 2)}`,
    },
    {
      key: 'step.gpa',
      math: `${fmt.num(points, 2)} ÷ ${fmt.num(credits, 2)} = ${fmt.num(gpa, 4)}`,
    },
  ];
  if (weighted !== null)
    steps.push({
      key: 'step.weighted',
      math: `${fmt.num(weightedPoints, 2)} ÷ ${fmt.num(credits, 2)} = ${fmt.num(weighted, 4)}`,
    });
  if (cumulative !== null)
    steps.push({
      key: 'step.cumulative',
      math: `(${fmt.num(priorGpa, 2)} × ${fmt.num(priorCredits, 2)} + ${fmt.num(points, 2)}) ÷ (${fmt.num(priorCredits, 2)} + ${fmt.num(credits, 2)}) = ${fmt.num(cumulative, 4)}`,
    });

  return {
    outputs: { gpa, weighted, cumulative, credits, points: roundTo(points, 4) },
    explain: {
      key: 'explain',
      values: { gpa: fmt.num(gpa, 2), credits: fmt.num(credits, 2), n: table.length },
    },
    steps,
    table: {
      captionKey: 'table.caption',
      columns: [
        { key: 'table.n', format: 'integer' },
        { key: 'table.grade', format: 'text' },
        { key: 'table.credits', format: 'number' },
        { key: 'table.gp', format: 'number' },
        { key: 'table.qp', format: 'number' },
        { key: 'table.type', format: 'text' },
      ],
      rows: table,
    },
    warnings,
  };
};
