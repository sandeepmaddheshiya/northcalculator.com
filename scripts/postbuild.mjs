#!/usr/bin/env node
/**
 * Post-build for the static export (ADR-010):
 *  1. Injects a strict per-page Content-Security-Policy <meta> with SHA-256 hashes of every
 *     inline executable script (static export cannot use nonces). No 'unsafe-inline' for scripts.
 *  2. Preloads each calculator page's island chunks (ADR-028). The island sits behind two levels
 *     of next/dynamic, and Next only emits preloads for the first, so without this the island would
 *     load one round trip after hydration and check:bundle could not see it. Fails the build if a
 *     calculator page's island cannot be resolved (e.g. a changed compiler output format).
 *  3. Verifies every page: lang attribute, exactly one <h1>, canonical (unless noindex),
 *     no placeholder copy. Fails the build on any violation.
 */
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const OUT = 'out';
// Third-party origins the client may contact (ADR-007 exchange rates).
const CONNECT = ["'self'", 'https://open.er-api.com', 'https://cdn.jsdelivr.net'];

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = path.join(dir, f);
    if (statSync(p).isDirectory()) return f === '_next' ? [] : htmlFiles(p);
    return f.endsWith('.html') ? [p] : [];
  });
}

// Island chunk lists, resolved from the compiled category map the page itself loads:
//   "id":(0,x.default)(()=>y.A(LOADER),…)  and  LOADER,a=>{a.v(e=>Promise.all(["static/chunks/…"]…
// The same map is compiled once per route (pages, embeds) with different shared chunks, so the
// lookup only searches chunks that page references.
const parsed = new Map();
function parseChunk(file) {
  if (parsed.has(file)) return parsed.get(file);
  const js = readFileSync(path.join(OUT, '_next', file), 'utf8');
  const loaders = new Map();
  const entries = new Map();
  for (const m of js.matchAll(/(\d+),\w+=>\{\w+\.v\(\w+=>Promise\.all\(\[([^\]]*)\]\.map/g))
    loaders.set(
      m[1],
      [...m[2].matchAll(/"(static\/chunks\/[^"]+\.js)"/g)].map((x) => x[1]),
    );
  for (const m of js.matchAll(
    /(?:"([\w-]+)"|([\w$]+)):\(0,[\w$]+\.default\)\(\(\)=>[\w$]+\.A\((\d+)\)/g,
  ))
    entries.set(m[1] ?? m[2], m[3]);
  const r = { loaders, entries };
  parsed.set(file, r);
  return r;
}
function islandChunks(html, id) {
  const refs = [
    ...new Set([...html.matchAll(/\/_next\/(static\/chunks\/[^"\\]+\.js)/g)].map((m) => m[1])),
  ];
  for (const f of refs) {
    const { entries, loaders } = parseChunk(f);
    const chunks = entries.has(id) ? loaders.get(entries.get(id)) : undefined;
    if (chunks?.length) return chunks;
  }
  return undefined;
}

const errors = [];
let count = 0;
let preloaded = 0;
for (const file of htmlFiles(OUT)) {
  let html = readFileSync(file, 'utf8');
  const page = file.slice(OUT.length);

  // 2. Island preloads for calculator pages and embeds.
  const island = html.match(/\\"category\\":\\"([\w-]+)\\",\\"id\\":\\"([\w-]+)\\"/);
  if (island) {
    const chunks = islandChunks(html, island[2]);
    if (!chunks?.length) errors.push(`${page}: cannot resolve island chunks for ${island[2]}`);
    else {
      const links = chunks
        .filter((c) => !html.includes(`/_next/${c}`))
        .map((c) => `<link rel="preload" as="script" href="/_next/${c}"/>`)
        .join('');
      html = html.replace('</head>', `${links}</head>`);
      preloaded++;
    }
  }

  // 1. CSP hashes for inline executable scripts (JSON-LD data blocks are not executed).
  const hashes = new Set();
  for (const m of html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)) {
    const attrs = m[1];
    if (/type="application\/(ld\+)?json"/.test(attrs)) continue;
    hashes.add(`'sha256-${createHash('sha256').update(m[2], 'utf8').digest('base64')}'`);
  }
  const csp = [
    "default-src 'self'",
    `script-src 'self' ${[...hashes].join(' ')}`.trim(),
    // React style attributes (e.g. count-up widths) need inline styles; styles cannot execute code.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    `connect-src ${CONNECT.join(' ')}`,
    "manifest-src 'self'",
    "worker-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    'upgrade-insecure-requests',
  ].join('; ');
  if (html.includes('http-equiv="Content-Security-Policy"')) {
    html = html.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/, '');
  }
  html = html.replace(
    /<head>/,
    `<head><meta http-equiv="Content-Security-Policy" content="${csp}">`,
  );
  writeFileSync(file, html);
  count++;

  // 3. Page sanity checks (the redirect stub at /index.html is exempt).
  if (page === '/index.html') continue;
  if (!/<html[^>]*\blang="[^"]+"/.test(html)) errors.push(`${page}: missing <html lang>`);
  const h1 = (html.match(/<h1[\s>]/g) ?? []).length;
  if (h1 !== 1) errors.push(`${page}: expected exactly one <h1>, found ${h1}`);
  const noindex = /<meta name="robots" content="[^"]*noindex/.test(html);
  if (!noindex && !/<link rel="canonical"/.test(html))
    errors.push(`${page}: indexable page without canonical`);
  if (/lorem ipsum|TODO|PLACEHOLDER/i.test(html.replace(/<script[\s\S]*?<\/script>/g, ''))) {
    errors.push(`${page}: placeholder text found`);
  }
}

console.log(`postbuild: CSP injected into ${count} pages, island preloads on ${preloaded}`);
if (errors.length) {
  console.error(errors.map((e) => `  ✗ ${e}`).join('\n'));
  process.exit(1);
}
