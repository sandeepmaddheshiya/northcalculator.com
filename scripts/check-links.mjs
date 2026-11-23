#!/usr/bin/env node
/**
 * Source link check (BRIEF §12: broken links). Requests every source URL cited in a calculator
 * definition and fails on 404/410 or network errors. Sites that block automated clients (403/429)
 * are reported as warnings, not failures, because they work in a browser.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const files = (d) =>
  readdirSync(d).flatMap((f) =>
    statSync(path.join(d, f)).isDirectory()
      ? files(path.join(d, f))
      : f === 'definition.ts'
        ? [path.join(d, f)]
        : [],
  );
const urls = new Set(
  files('src/calculators').flatMap((f) =>
    [...readFileSync(f, 'utf8').matchAll(/url: '(https:\/\/[^']+)'/g)].map((m) => m[1]),
  ),
);
const UA = 'Mozilla/5.0 (compatible; NorthCalculator link check)';

let failed = 0;
await Promise.all(
  [...urls].map(async (u) => {
    try {
      const r = await fetch(u, {
        redirect: 'follow',
        headers: { 'User-Agent': UA },
        signal: AbortSignal.timeout(20000),
      });
      const tag = r.ok ? 'ok  ' : r.status === 403 || r.status === 429 ? 'warn' : 'FAIL';
      if (tag === 'FAIL') failed++;
      console.log(`${tag} ${r.status} ${u}`);
    } catch (e) {
      failed++;
      console.log(`FAIL ERR ${u} (${e.message})`);
    }
  }),
);
console.log(`\n${urls.size} source links checked, ${failed} broken.`);
process.exit(failed ? 1 : 0);
