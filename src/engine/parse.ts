/**
 * Forgiving, locale-aware number parsing (BRIEF §3, §6; ADR-004).
 * Accepts: "1,234.56", "1.234,56", "1 234,56", "12,34,567" (Indian), "1'000" (Swiss),
 * "$10", "10%", "−5" (Unicode minus), "1e3", and native digits (Arabic-Indic, Devanagari, …).
 * Returns the canonical decimal string so money maths can use decimal.js without float loss.
 */
export type ParseResult =
  | { ok: true; value: number; normalized: string; percent: boolean }
  | { ok: false; reason: 'empty' | 'invalid' };

const DIGIT_BLOCKS = [
  0x0660, 0x06f0, 0x0966, 0x09e6, 0x0a66, 0x0ae6, 0x0b66, 0x0be6, 0x0c66, 0x0ce6, 0x0d66, 0x0e50,
  0x0ed0, 0xff10,
];

function toAsciiDigits(s: string): string {
  let out = '';
  for (const ch of s) {
    const cp = ch.codePointAt(0)!;
    const block = DIGIT_BLOCKS.find((b) => cp >= b && cp <= b + 9);
    out += block !== undefined ? String(cp - block) : ch;
  }
  return out;
}

const separatorCache = new Map<string, { decimal: string; group: string }>();
export function localeSeparators(locale: string): { decimal: string; group: string } {
  let cached = separatorCache.get(locale);
  if (!cached) {
    const parts = new Intl.NumberFormat(locale).formatToParts(1234567.5);
    cached = {
      decimal: parts.find((p) => p.type === 'decimal')?.value ?? '.',
      group: parts.find((p) => p.type === 'group')?.value ?? ',',
    };
    separatorCache.set(locale, cached);
  }
  return cached;
}

/** True if `s` (digits and one kind of separator) looks like thousands grouping. */
function looksGrouped(s: string, sep: string): boolean {
  const parts = s.split(sep);
  if (parts.length < 2) return false;
  const [head, ...rest] = parts;
  if (!head || head.length > 3 || !/^\d+$/.test(head)) return false;
  const last = rest[rest.length - 1]!;
  if (last.length !== 3) return false;
  // Western (3-3-3) or Indian (2-2-…-3) grouping.
  const middle = rest.slice(0, -1);
  return middle.every((p) => p.length === 3) || middle.every((p) => p.length === 2);
}

export function parseLocaleNumber(raw: string, locale = 'en'): ParseResult {
  let s = toAsciiDigits(raw.normalize('NFKC')).trim();
  if (s === '') return { ok: false, reason: 'empty' };

  let negative = false;
  // Accounting negatives: (1,234)
  if (/^\(.*\)$/.test(s)) {
    negative = true;
    s = s.slice(1, -1).trim();
  }
  s = s.replace(/[−‒–—﹣－]/g, '-');

  const percent = /%\s*$/.test(s) || /^%/.test(s);
  // Strip currency symbols, ISO codes and percent signs at the edges.
  s = s
    .replace(/^[\s%]*(?:[A-Za-z]{3})?\s*[$€£¥₹₩₽₺₫₪₦₱฿₴₸₼₾₡₲₵₭₮₨₠]?\s*/u, (m) =>
      /[-+]/.test(m) ? m : '',
    )
    .replace(/\s*[$€£¥₹₩₽₺₫₪₦₱฿₴₸₼₾₡₲₵₭₮₨₠]?\s*(?:[A-Za-z]{3})?[\s%]*$/u, '');

  if (s.startsWith('-')) {
    negative = !negative;
    s = s.slice(1).trim();
  } else if (s.startsWith('+')) {
    s = s.slice(1).trim();
  }
  // Currency symbol may also follow the sign: "-$5"
  s = s.replace(/^[$€£¥₹₩₽₺₫₪₦₱฿]\s*/u, '');

  // Exponent part (only valid with '.' decimals, e.g. 1.5e-3)
  let exponent = '';
  const expMatch = /[eE]([+-]?\d+)$/.exec(s);
  if (expMatch) {
    exponent = expMatch[1]!;
    s = s.slice(0, expMatch.index);
  }

  // Remove space-like and apostrophe group separators.
  s = s.replace(/[\s   '’_]/g, '');
  if (!/^[\d.,]+$/.test(s) || !/\d/.test(s)) return { ok: false, reason: 'invalid' };

  const { decimal: localeDecimal } = localeSeparators(locale);
  const hasDot = s.includes('.');
  const hasComma = s.includes(',');
  let intPart: string;
  let fracPart = '';

  if (hasDot && hasComma) {
    const decimal = s.lastIndexOf('.') > s.lastIndexOf(',') ? '.' : ',';
    const group = decimal === '.' ? ',' : '.';
    const [i, f, ...extra] = s.split(decimal);
    if (extra.length) return { ok: false, reason: 'invalid' };
    if (f!.includes(group)) return { ok: false, reason: 'invalid' };
    if (!looksGrouped(i!, group) && i!.includes(group)) return { ok: false, reason: 'invalid' };
    intPart = i!.split(group).join('');
    fracPart = f!;
  } else if (hasDot || hasComma) {
    const sep = hasDot ? '.' : ',';
    const count = s.split(sep).length - 1;
    if (count > 1) {
      if (!looksGrouped(s, sep)) return { ok: false, reason: 'invalid' };
      intPart = s.split(sep).join('');
    } else if (sep === localeDecimal) {
      [intPart, fracPart] = s.split(sep) as [string, string];
    } else if (looksGrouped(s, sep)) {
      // Locale group char in a grouping position: "1,000" (en) / "1.000" (de)
      intPart = s.split(sep).join('');
    } else {
      // Forgiving: the "other" separator not in grouping position is a decimal ("1,5" in en).
      [intPart, fracPart] = s.split(sep) as [string, string];
    }
  } else {
    intPart = s;
  }

  intPart = intPart.replace(/^0+(?=\d)/, '') || '0';
  fracPart = fracPart.replace(/0+$/, '');
  let normalized = fracPart ? `${intPart}.${fracPart}` : intPart;
  if (exponent) normalized += `e${exponent}`;
  const value = Number(normalized);
  if (!Number.isFinite(value)) return { ok: false, reason: 'invalid' };
  if (negative && value !== 0) normalized = `-${normalized}`;
  return { ok: true, value: negative && value !== 0 ? -value : value, normalized, percent };
}
