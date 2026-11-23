#!/usr/bin/env node
/**
 * Locale readiness report (Phase 4, BRIEF §8). For each locale in src/i18n/locales.ts: UI message
 * coverage against en.json, and how many calculators have content.<locale>.tsx and list the locale
 * in definition.locales. A locale may go live only when everything is translated AND human-reviewed;
 * this report covers the first half. Informational: always exits 0.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const locales = [
  ...readFileSync('src/i18n/locales.ts', 'utf8').matchAll(
    /\{ code: '([^']+)', name: '([^']+)'.*?status: '(\w+)' \}/g,
  ),
].map((m) => ({ code: m[1], name: m[2], status: m[3] }));
const flat = (o, p = '') =>
  Object.entries(o).flatMap(([k, v]) =>
    v && typeof v === 'object' ? flat(v, `${p}${k}.`) : [`${p}${k}`],
  );
const enKeys = flat(JSON.parse(readFileSync('messages/en.json', 'utf8')));
const calcDirs = (d) =>
  readdirSync(d).flatMap((f) => {
    const p = path.join(d, f);
    if (!statSync(p).isDirectory()) return [];
    return existsSync(path.join(p, 'definition.ts')) ? [p] : calcDirs(p);
  });
const calcs = calcDirs('src/calculators');

console.log(`${calcs.length} calculators, ${enKeys.length} UI message keys (en)\n`);
console.log('locale  status   UI keys   calculator content   listed in definition');
for (const l of locales) {
  const file = `messages/${l.code}.json`;
  const keys = existsSync(file) ? new Set(flat(JSON.parse(readFileSync(file, 'utf8')))) : new Set();
  const ui = enKeys.filter((k) => keys.has(k)).length;
  const content = calcs.filter((d) => existsSync(path.join(d, `content.${l.code}.tsx`))).length;
  const listed = calcs.filter((d) =>
    new RegExp(`locales: \\[[^\\]]*'${l.code}'`).test(
      readFileSync(path.join(d, 'definition.ts'), 'utf8'),
    ),
  ).length;
  console.log(
    `${l.code.padEnd(7)} ${l.status.padEnd(8)} ${String(Math.round((ui / enKeys.length) * 100)).padStart(4)}%   ${String(content).padStart(4)} / ${calcs.length}            ${String(listed).padStart(4)} / ${calcs.length}`,
  );
}
console.log(
  '\nGo-live needs 100% UI keys, reviewed content for every listed calculator, and a fluent reviewer’s sign-off (docs/i18n-rollout.md).',
);
