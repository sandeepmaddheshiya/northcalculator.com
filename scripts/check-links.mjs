#!/usr/bin/env node
/**
 * Source link check (BRIEF §12: broken links). Requests every source URL cited in a calculator
 * definition and fails on 404/410 (gone). Bot blocking (403/429), server errors (5xx) and network
 * timeouts are warnings: they are usually temporary or specific to automated clients.
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
      const tag = r.ok ? 'ok  ' : r.status === 404 || r.status === 410 ? 'FAIL' : 'warn';
      if (tag === 'FAIL') failed++;
      console.log(`${tag} ${r.status} ${u}`);
    } catch (e) {
      console.log(`warn ERR ${u} (${e.cause?.code ?? e.message}; unreachable now, re-check later)`);
    }
  }),
);
console.log(`\n${urls.size} source links checked, ${failed} broken.`);
process.exit(failed ? 1 : 0);
