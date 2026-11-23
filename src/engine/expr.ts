/**
 * Safe arithmetic expression evaluator for the scientific calculator (ADR-018).
 * Recursive-descent / precedence-climbing parser; no eval, no Function, no regex backtracking.
 * Limits: 500 characters, 100 nesting levels, factorial ≤ 170.
 *
 * Precedence (low → high): + −  |  × ÷ and implicit multiplication  |  unary ±  |  ^ (right-assoc)
 *                          |  postfix ! and %  |  primary (number, constant, function call, parentheses)
 * As in standard mathematical notation, −2^2 = −4 and 2^3^2 = 2^9.
 */
export type AngleMode = 'deg' | 'rad';
export type ExprError =
  'empty' | 'syntax' | 'domain' | 'divzero' | 'overflow' | 'tooLong' | 'tooDeep';
export type ExprResult = { ok: true; value: number } | { ok: false; error: ExprError; at?: number };

export const MAX_LENGTH = 500;
const MAX_DEPTH = 100;

class EvalError extends Error {
  constructor(
    public code: ExprError,
    public at?: number,
  ) {
    super(code);
  }
}

type Tok =
  | { t: 'num'; v: number; at: number }
  | { t: 'id'; v: string; at: number }
  | { t: 'op'; v: string; at: number };

const OPS: Record<string, string> = {
  '+': '+',
  '-': '-',
  '−': '-',
  '–': '-',
  '*': '*',
  '×': '*',
  '·': '*',
  '/': '/',
  '÷': '/',
  '^': '^',
  '(': '(',
  ')': ')',
  '!': '!',
  '%': '%',
  ',': ',',
  '√': '√',
  π: 'π',
};

function tokenize(src: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i]!;
    if (c === ' ' || c === ' ') {
      i++;
      continue;
    }
    if ((c >= '0' && c <= '9') || c === '.') {
      const start = i;
      while (i < src.length && ((src[i]! >= '0' && src[i]! <= '9') || src[i] === '.')) i++;
      // Exponent: 1e5, 2.5E-3 (only when followed by digits)
      if ((src[i] === 'e' || src[i] === 'E') && /[0-9+-]/.test(src[i + 1] ?? '')) {
        let j = i + 1;
        if (src[j] === '+' || src[j] === '-') j++;
        if (src[j] !== undefined && src[j]! >= '0' && src[j]! <= '9') {
          i = j;
          while (i < src.length && src[i]! >= '0' && src[i]! <= '9') i++;
        }
      }
      const text = src.slice(start, i);
      if ((text.match(/\./g) ?? []).length > 1 || text === '.')
        throw new EvalError('syntax', start);
      out.push({ t: 'num', v: Number(text), at: start });
      continue;
    }
    if (/[A-Za-z]/.test(c)) {
      const start = i;
      while (i < src.length && /[A-Za-z0-9]/.test(src[i]!)) i++;
      out.push({ t: 'id', v: src.slice(start, i).toLowerCase(), at: start });
      continue;
    }
    const op = OPS[c];
    if (!op) throw new EvalError('syntax', i);
    if (op === 'π') out.push({ t: 'id', v: 'pi', at: i });
    else out.push({ t: 'op', v: op, at: i });
    i++;
  }
  return out;
}

const FUNCS = new Set([
  'sin',
  'cos',
  'tan',
  'asin',
  'acos',
  'atan',
  'sinh',
  'cosh',
  'tanh',
  'ln',
  'log',
  'log2',
  'sqrt',
  'cbrt',
  'abs',
  'exp',
  'floor',
  'ceil',
  'round',
  'sign',
]);

function factorial(n: number, at: number): number {
  if (!Number.isInteger(n) || n < 0) throw new EvalError('domain', at);
  if (n > 170) throw new EvalError('overflow', at);
  let r = 1;
  for (let k = 2; k <= n; k++) r *= k;
  return r;
}

function applyFn(name: string, x: number, mode: AngleMode, at: number): number {
  const toRad = (v: number) => (mode === 'deg' ? (v * Math.PI) / 180 : v);
  const fromRad = (v: number) => (mode === 'deg' ? (v * 180) / Math.PI : v);
  // Exact values at multiples of 90° avoid answers like sin(180°) = 1.22e-16 and tan(90°) = 1.6e16.
  const quarter = mode === 'deg' && Number.isInteger(x / 90) ? (((x / 90) % 4) + 4) % 4 : -1;
  switch (name) {
    case 'sin':
      return quarter >= 0 ? [0, 1, 0, -1][quarter]! : Math.sin(toRad(x));
    case 'cos':
      return quarter >= 0 ? [1, 0, -1, 0][quarter]! : Math.cos(toRad(x));
    case 'tan':
      if (quarter === 1 || quarter === 3) throw new EvalError('domain', at);
      return quarter >= 0 ? 0 : Math.tan(toRad(x));
    case 'asin':
    case 'acos':
      if (x < -1 || x > 1) throw new EvalError('domain', at);
      return fromRad(name === 'asin' ? Math.asin(x) : Math.acos(x));
    case 'atan':
      return fromRad(Math.atan(x));
    case 'sinh':
      return Math.sinh(x);
    case 'cosh':
      return Math.cosh(x);
    case 'tanh':
      return Math.tanh(x);
    case 'ln':
    case 'log':
    case 'log2':
      if (x <= 0) throw new EvalError('domain', at);
      return name === 'ln' ? Math.log(x) : name === 'log' ? Math.log10(x) : Math.log2(x);
    case 'sqrt':
      if (x < 0) throw new EvalError('domain', at);
      return Math.sqrt(x);
    case 'cbrt':
      return Math.cbrt(x);
    case 'abs':
      return Math.abs(x);
    case 'exp':
      return Math.exp(x);
    case 'floor':
      return Math.floor(x);
    case 'ceil':
      return Math.ceil(x);
    case 'round':
      return Math.round(x);
    case 'sign':
      return Math.sign(x);
  }
  throw new EvalError('syntax', at);
}

export function evaluate(src: string, opts: { mode?: AngleMode; ans?: number } = {}): ExprResult {
  const mode = opts.mode ?? 'deg';
  if (src.trim() === '') return { ok: false, error: 'empty' };
  if (src.length > MAX_LENGTH) return { ok: false, error: 'tooLong' };
  let toks: Tok[];
  try {
    toks = tokenize(src);
  } catch (e) {
    return { ok: false, error: (e as EvalError).code, at: (e as EvalError).at };
  }
  let p = 0;
  let depth = 0;
  const peek = () => toks[p];
  const isOp = (v: string) => peek()?.t === 'op' && peek()!.v === v;
  const enter = () => {
    if (++depth > MAX_DEPTH) throw new EvalError('tooDeep', peek()?.at);
  };

  // Does the next token start a primary (for implicit multiplication: 2π, 3(4), 2sin30)?
  const startsPrimary = () => {
    const t = peek();
    return !!t && (t.t === 'num' || t.t === 'id' || (t.t === 'op' && (t.v === '(' || t.v === '√')));
  };

  function expr(): number {
    enter();
    let v = term();
    while (isOp('+') || isOp('-')) {
      const op = toks[p++]!.v;
      const r = term();
      v = op === '+' ? v + r : v - r;
    }
    depth--;
    return v;
  }

  function term(): number {
    let v = unary();
    for (;;) {
      if (isOp('*') || isOp('/')) {
        const tok = toks[p++]!;
        const r = unary();
        if (tok.v === '/' && r === 0) throw new EvalError('divzero', tok.at);
        v = tok.v === '*' ? v * r : v / r;
      } else if (startsPrimary()) {
        v *= unary(); // implicit multiplication binds like ×
      } else return v;
    }
  }

  function unary(): number {
    if (isOp('-')) {
      p++;
      return -unary();
    }
    if (isOp('+')) {
      p++;
      return unary();
    }
    return power();
  }

  function power(): number {
    const base = postfix();
    if (isOp('^')) {
      const at = toks[p++]!.at;
      enter();
      const exp = unary(); // right-associative; allows 2^-3
      depth--;
      const v = base ** exp;
      if (Number.isNaN(v)) throw new EvalError('domain', at);
      return v;
    }
    return base;
  }

  function postfix(): number {
    let v = primary();
    while (isOp('!') || isOp('%')) {
      const tok = toks[p++]!;
      v = tok.v === '!' ? factorial(v, tok.at) : v / 100;
    }
    return v;
  }

  function primary(): number {
    const t = peek();
    if (!t) throw new EvalError('syntax', src.length);
    if (t.t === 'num') {
      p++;
      return t.v;
    }
    if (t.t === 'op' && t.v === '(') {
      p++;
      const v = expr();
      if (!isOp(')')) throw new EvalError('syntax', peek()?.at ?? src.length);
      p++;
      return v;
    }
    if (t.t === 'op' && t.v === '√') {
      p++;
      return applyFn('sqrt', unaryArg(), mode, t.at);
    }
    if (t.t === 'id') {
      p++;
      if (t.v === 'pi') return Math.PI;
      if (t.v === 'e') return Math.E;
      if (t.v === 'ans') return opts.ans ?? 0;
      if (FUNCS.has(t.v)) return applyFn(t.v, unaryArg(), mode, t.at);
      throw new EvalError('syntax', t.at);
    }
    throw new EvalError('syntax', t.at);
  }

  /** Function argument: parenthesised expression, or a bare operand like `sin 30` / `√2`. */
  function unaryArg(): number {
    if (isOp('(')) return primary();
    if (isOp('-')) {
      p++;
      return -unaryArg();
    }
    return postfix();
  }

  try {
    const v = expr();
    if (p < toks.length) throw new EvalError('syntax', toks[p]!.at);
    if (Number.isNaN(v)) return { ok: false, error: 'domain' };
    if (!Number.isFinite(v)) return { ok: false, error: 'overflow' };
    return { ok: true, value: v };
  } catch (e) {
    if (e instanceof EvalError) return { ok: false, error: e.code, at: e.at };
    if (e instanceof RangeError) return { ok: false, error: 'tooDeep' };
    throw e;
  }
}
