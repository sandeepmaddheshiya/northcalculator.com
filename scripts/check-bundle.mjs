#!/usr/bin/env node
/**
 * Bundle budget check (BRIEF §10, ADR-015). Measures the gzip size of every JS chunk a page
 * references, whether by <script src> or from the RSC payload (lazy client islands), excluding
 * `nomodule` legacy polyfills that modern browsers skip.
 *
 * Budgets (budgets.json):
 *   initialJsGzipBytes     content pages (home, hubs, static pages)
 *   calculatorJsGzipBytes  calculator pages
 *   calculatorChunkGzipBytes  JS a calculator page loads beyond a content page (its own island + compute)
 *   cssGzipBytes           CSS per page
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import path from 'node:path';

const OUT = 'out';
const budgets = JSON.parse(readFileSync('budgets.json', 'utf8'));

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = path.join(dir, f);
    if (statSync(p).isDirectory()) return f === '_next' || f === 'og' ? [] : htmlFiles(p);
    return f.endsWith('.html') ? [p] : [];
  });
}

const gz = (p) => gzipSync(readFileSync(p), { level: 9 }).length;
const cache = new Map();
const size = (src) => {
  if (!cache.has(src)) cache.set(src, gz(path.join(OUT, src.split('?')[0])));
  return cache.get(src);
};

function chunksOf(html) {
  const nomodule = new Set(
    [...html.matchAll(/<script\b([^>]*)\bsrc="([^"]+)"([^>]*)>/g)]
      .filter((m) => /\bnomodule\b/i.test(m[1] + m[3]))
      .map((m) => m[2]),
  );
  return [
    ...new Set([...html.matchAll(/\/_next\/static\/chunks\/[\w.-]+\.js/g)].map((m) => m[0])),
  ].filter((s) => !nomodule.has(s));
}

/** /en/<category>/<slug>.html is a calculator page. */
const isCalculator = (page) => /^\/[a-z]{2}(-[A-Z]{2})?\/[^/]+\/[^/]+\.html$/.test(page);

const pages = htmlFiles(OUT).map((file) => {
  const html = readFileSync(file, 'utf8');
  const page = file.slice(OUT.length);
  const chunks = chunksOf(html);
  const css = [...html.matchAll(/<link[^>]+href="([^"]+\.css)"/g)].reduce(
    (a, m) => a + size(m[1]),
    0,
  );
  return { page, chunks, js: chunks.reduce((a, s) => a + size(s), 0), css };
});

// Baseline: chunks shared by a content page of the same locale (its about page).
const baseline = new Map(
  pages
    .filter((p) => /^\/[^/]+\/about\.html$/.test(p.page))
    .map((p) => [p.page.split('/')[1], new Set(p.chunks)]),
);

let failed = false;
const rows = [];
const kb = (n) => (n / 1024).toFixed(1).padStart(6);
for (const p of pages) {
  const calc = isCalculator(p.page);
  const jsBudget = calc ? budgets.calculatorJsGzipBytes : budgets.initialJsGzipBytes;
  let own = 0;
  if (calc) {
    const base = baseline.get(p.page.split('/')[1]) ?? new Set();
    own = p.chunks.filter((c) => !base.has(c)).reduce((a, s) => a + size(s), 0);
  }
  const over =
    p.js > jsBudget || p.css > budgets.cssGzipBytes || own > budgets.calculatorChunkGzipBytes;
  if (over) failed = true;
  rows.push(
    `${over ? '✗' : '✓'} ${p.page.padEnd(52)} JS ${kb(p.js)} KB${calc ? `  own ${kb(own)} KB` : '               '}  CSS ${kb(p.css)} KB`,
  );
}
console.log(rows.sort().join('\n'));
console.log(
  `\nBudgets (gz): content pages JS ≤ ${kb(budgets.initialJsGzipBytes)} KB · calculator pages ≤ ${kb(budgets.calculatorJsGzipBytes)} KB · own calculator code ≤ ${kb(budgets.calculatorChunkGzipBytes)} KB · CSS ≤ ${kb(budgets.cssGzipBytes)} KB`,
);
if (failed) {
  console.error('Bundle budget exceeded.');
  process.exit(1);
}
