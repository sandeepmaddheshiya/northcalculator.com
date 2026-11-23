/**
 * Substitute {name} placeholders in a pre-translated template. Client islands receive raw
 * templates from the server (t.raw) so the ICU runtime never ships to the browser (BRIEF §10).
 * Only simple placeholders are allowed in client-side templates; plurals are resolved on the server.
 */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in values ? String(values[k]) : m));
}
