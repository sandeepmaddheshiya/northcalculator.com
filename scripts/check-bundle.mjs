#!/usr/bin/env node
/**
 * Bundle budget check (BRIEF §10). Measures gzip size of the JS each exported page
 * loads up-front (excluding `nomodule` legacy polyfills, which modern browsers skip).
 * Budgets live in budgets.json. Exits non-zero on regression.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import path from 'node:path';

const OUT = 'out';
const budgets = JSON.parse(readFileSync('budgets.json', 'utf8'));

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = path.join(dir, f);
    if (statSync(p).isDirectory()) return f === '_next' ? [] : htmlFiles(p);
    return f.endsWith('.html') ? [p] : [];
  });
}

const gz = (p) => gzipSync(readFileSync(p), { level: 9 }).length;
const cache = new Map();
const size = (src) => {
  if (!cache.has(src)) cache.set(src, gz(path.join(OUT, src.split('?')[0])));
  return cache.get(src);
};

let failed = false;
const rows = [];
for (const file of htmlFiles(OUT)) {
  const html = readFileSync(file, 'utf8');
  const scripts = [...html.matchAll(/<script\b([^>]*)\bsrc="([^"]+)"([^>]*)>/g)]
    .filter((m) => !/\bnomodule\b/i.test(m[1] + m[3]))
    .map((m) => m[2]);
  const js = [...new Set(scripts)].reduce((a, s) => a + size(s), 0);
  const css = [...html.matchAll(/<link[^>]+href="([^"]+\.css)"/g)].reduce(
    (a, m) => a + size(m[1]),
    0,
  );
  const page = file.slice(OUT.length);
  const over = js > budgets.initialJsGzipBytes || css > budgets.cssGzipBytes;
  if (over) failed = true;
  rows.push(
    `${over ? '✗' : '✓'} ${page.padEnd(40)} JS ${(js / 1024).toFixed(1).padStart(6)} KB  CSS ${(css / 1024).toFixed(1).padStart(5)} KB`,
  );
}
console.log(rows.sort().join('\n'));
console.log(
  `\nBudgets: JS ≤ ${(budgets.initialJsGzipBytes / 1024).toFixed(0)} KB gz, CSS ≤ ${(budgets.cssGzipBytes / 1024).toFixed(0)} KB gz`,
);
if (failed) {
  console.error('Bundle budget exceeded.');
  process.exit(1);
}
