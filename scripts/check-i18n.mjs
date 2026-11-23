#!/usr/bin/env node
/**
 * i18n gate (BRIEF §8): every locale's messages must have exactly the keys of en.json, and every
 * key in en.json must be referenced in the source (no dead keys). ICU placeholders must match.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const dir = 'messages';
const flatten = (o, p = '') =>
  Object.entries(o).flatMap(([k, v]) =>
    v && typeof v === 'object' ? flatten(v, `${p}${k}.`) : [[`${p}${k}`, v]],
  );
const load = (f) => new Map(flatten(JSON.parse(readFileSync(path.join(dir, f), 'utf8'))));
const placeholders = (s) =>
  [...String(s).matchAll(/\{(\w+)/g)]
    .map((m) => m[1])
    .sort()
    .join(',');

const en = load('en.json');
const errors = [];
for (const f of readdirSync(dir).filter((f) => f.endsWith('.json') && f !== 'en.json')) {
  const m = load(f);
  for (const k of en.keys()) if (!m.has(k)) errors.push(`${f}: missing ${k}`);
  for (const k of m.keys()) if (!en.has(k)) errors.push(`${f}: extra ${k}`);
  for (const [k, v] of m)
    if (en.has(k) && placeholders(v) !== placeholders(en.get(k)))
      errors.push(`${f}: placeholder mismatch in ${k}`);
}

// Unused keys: a key is "used" if its leaf or a parent namespace + leaf appears in src.
const files = [];
const walk = (d) =>
  readdirSync(d).forEach((f) => {
    const p = path.join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(tsx?|mjs)$/.test(f)) files.push(readFileSync(p, 'utf8'));
  });
walk('src');
const src = files.join('\n');
// Keys read dynamically (by computed names) are listed by namespace here.
const DYNAMIC_NAMESPACES = [
  'categories.',
  'pages.',
  'home.principles.',
  'theme.',
  'validation.',
  'calc.',
];
for (const k of en.keys()) {
  if (DYNAMIC_NAMESPACES.some((n) => k.startsWith(n))) continue;
  const leaf = k.split('.').pop();
  if (!src.includes(`'${leaf}'`) && !src.includes(`"${leaf}"`) && !src.includes(k))
    errors.push(`en.json: unused key ${k}`);
}

if (errors.length) {
  console.error(errors.map((e) => `✗ ${e}`).join('\n'));
  process.exit(1);
}
console.log(`i18n: ${en.size} keys, all locales in parity, no unused keys.`);
