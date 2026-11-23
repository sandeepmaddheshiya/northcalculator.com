#!/usr/bin/env node
/**
 * Stale-content check (BRIEF §13, docs/editorial-workflow.md). Flags calculators whose content or
 * review is older than 12 months, and regional/tax calculators every January (new tax year).
 * Prints warnings; exits 1 only with --strict (for a scheduled CI job).
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const today = new Date();
const strict = process.argv.includes('--strict');
const files = (d) =>
  readdirSync(d).flatMap((f) =>
    statSync(path.join(d, f)).isDirectory()
      ? files(path.join(d, f))
      : f === 'definition.ts'
        ? [path.join(d, f)]
        : [],
  );
const months = (iso) => (today - new Date(`${iso}T00:00:00Z`)) / (1000 * 60 * 60 * 24 * 30.44);

let stale = 0;
for (const f of files('src/calculators')) {
  const s = readFileSync(f, 'utf8');
  const id = s.match(/id: '([^']+)'/)?.[1];
  const updated = s.match(/contentUpdated: '([\d-]+)'/)?.[1];
  const reviewed = s.match(/review: \{[^}]*date: '([\d-]+)'/)?.[1];
  const regional = /regions: \[/.test(s) || /tags: \[[^\]]*\btax\b/i.test(s);
  const reasons = [];
  if (updated && months(updated) > 12) reasons.push(`content last updated ${updated}`);
  if (reviewed && months(reviewed) > 12) reasons.push(`last reviewed ${reviewed}`);
  if (regional && today.getUTCMonth() === 0)
    reasons.push('regional/tax calculator: check this year’s rates (January review)');
  if (reasons.length) {
    stale++;
    console.log(`⚠ ${id}: ${reasons.join('; ')}`);
  }
}
const snap = JSON.parse(
  readFileSync('src/calculators/conversion/currency-converter/rates.snapshot.json', 'utf8'),
);
const snapDays = (Date.now() / 1000 - snap.time) / 86400;
if (snapDays > 3)
  console.log(
    `⚠ currency snapshot is ${snapDays.toFixed(1)} days old (run pnpm rates or check the daily deploy hook)`,
  );
console.log(stale ? `\n${stale} calculator(s) need review.` : 'No calculators are due for review.');
process.exit(strict && stale ? 1 : 0);
