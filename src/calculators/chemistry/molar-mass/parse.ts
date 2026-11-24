import { WEIGHTS } from './elements';

export type Counts = Map<string, number>;
export type ParseError = { error: 'syntax' | 'element' | 'paren'; at?: string };

const add = (into: Counts, from: Counts, times: number) => {
  for (const [el, n] of from) into.set(el, (into.get(el) ?? 0) + n * times);
};

/**
 * Parses a chemical formula into element counts: element symbols with optional counts, nested
 * groups in () or [] with multipliers, and hydrate parts after “·”, “.” or “*” with an optional
 * leading coefficient (CuSO4·5H2O). Whitespace is ignored. Charges and isotopes are not supported.
 */
export function parseFormula(input: string): Counts | ParseError {
  const s = input.replace(/\s+/g, '');
  if (!s) return { error: 'syntax' };
  const total: Counts = new Map();
  for (const part of s.split(/[·•.*]/)) {
    if (!part) return { error: 'syntax' };
    const lead = /^\d+/.exec(part);
    const coef = lead ? Number(lead[0]) : 1;
    let i = lead ? lead[0].length : 0;
    const stack: Counts[] = [new Map()];
    const closers: string[] = [];
    const num = () => {
      const m = /^\d+/.exec(part.slice(i));
      if (!m) return 1;
      i += m[0].length;
      return Number(m[0]);
    };
    while (i < part.length) {
      const ch = part[i]!;
      if (ch === '(' || ch === '[') {
        closers.push(ch === '(' ? ')' : ']');
        stack.push(new Map());
        i++;
      } else if (ch === ')' || ch === ']') {
        if (closers.pop() !== ch) return { error: 'paren' };
        i++;
        const group = stack.pop()!;
        add(stack[stack.length - 1]!, group, num());
      } else if (/[A-Z]/.test(ch)) {
        const m = /^[A-Z][a-z]?/.exec(part.slice(i))!;
        // Prefer a two-letter symbol only when it exists (Co vs C + o is never valid anyway).
        const sym = m[0].length === 2 && !(m[0] in WEIGHTS) ? m[0][0]! : m[0];
        if (!(sym in WEIGHTS)) return { error: 'element', at: m[0] };
        i += sym.length;
        const top = stack[stack.length - 1]!;
        top.set(sym, (top.get(sym) ?? 0) + num());
      } else {
        return { error: 'syntax', at: ch };
      }
    }
    if (closers.length) return { error: 'paren' };
    add(total, stack[0]!, coef);
  }
  return total;
}
