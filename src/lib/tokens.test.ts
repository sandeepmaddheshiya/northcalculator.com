import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { contrast } from './contrast';

const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');

function block(name: string): Record<string, string> {
  const start = css.indexOf(`/* tokens:${name} */`);
  const end = css.indexOf(`/* /tokens:${name} */`);
  if (start < 0 || end < 0) throw new Error(`token block ${name} missing`);
  const out: Record<string, string> = {};
  for (const m of css.slice(start, end).matchAll(/--tok-([a-z-]+):\s*(#[0-9a-f]{6});/g)) {
    out[m[1]!] = m[2]!;
  }
  return out;
}

// [foreground, background, minimum ratio]
const PAIRS: [string, string, number][] = [
  ['text', 'bg', 7],
  ['text', 'surface', 7],
  ['muted', 'bg', 4.5],
  ['muted', 'surface', 4.5],
  ['subtle', 'bg', 4.5],
  ['subtle', 'surface', 4.5],
  ['subtle', 'sunken', 4.5],
  ['brand', 'bg', 4.5],
  ['brand', 'surface', 4.5],
  ['on-brand', 'brand', 4.5],
  ['on-brand', 'brand-hover', 4.5],
  ['brand', 'brand-wash', 4.5],
  ['success', 'success-wash', 4.5],
  ['warning', 'warning-wash', 4.5],
  ['danger', 'danger-wash', 4.5],
  ['danger', 'surface', 4.5],
  ['text', 'highlight', 7],
  // Non-text UI (input borders) needs 3:1 (WCAG 1.4.11).
  ['border-strong', 'surface', 3],
  ['border-strong', 'bg', 3],
];

describe.each(['light', 'dark'])('%s tokens meet WCAG 2.2 AA', (name) => {
  const t = block(name);
  it.each(PAIRS)('%s on %s ≥ %s:1', (fg, bg, min) => {
    expect(t[fg], `missing ${fg}`).toBeDefined();
    expect(t[bg], `missing ${bg}`).toBeDefined();
    expect(contrast(t[fg]!, t[bg]!)).toBeGreaterThanOrEqual(min);
  });
});

it('dark tokens are identical in the media-query and the forced-dark blocks', () => {
  const dark = block('dark');
  const media = css.slice(
    css.indexOf('@media (prefers-color-scheme: dark)'),
    css.indexOf(":root[data-theme='dark']"),
  );
  for (const [k, v] of Object.entries(dark)) expect(media).toContain(`--tok-${k}: ${v};`);
});
