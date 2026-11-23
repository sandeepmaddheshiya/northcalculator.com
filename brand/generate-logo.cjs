const opentype = require('opentype.js');
const fs = require('fs');
const path = require('path');
const out = process.argv[2];
const font = opentype.loadSync(path.join(__dirname, 'node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-700-normal.woff'));

// ---- Wordmark ----
const SIZE = 88, BASE = 96;
function run(text, x, size = SIZE) {
  const TRACK = -0.015 * size;
  let d = '', cx = x;
  for (const ch of text) {
    const g = font.charToGlyph(ch);
    d += g.getPath(cx, BASE, size).toPathData(2);
    cx += g.advanceWidth * size / font.unitsPerEm + TRACK;
  }
  return { d, end: cx - TRACK };
}
const north = run('North', 0);
const calc = run('Calculator', north.end + 1);
const com = run('.com', calc.end + 3, 54);
const wordmark = { north: north.d, calc: calc.d, com: com.d, widthNoCom: Math.ceil(calc.end), width: Math.ceil(com.end) };

// ---- Mark (viewBox 0 0 120 136) ----
// ink = navy (body, N, north arrow, symbols), paper = screen/keys, blue = ring, pointers, '=' key, mountains.
const mark = (ink, paper, blue, idp = 'm') => `
  <defs>
    <mask id="${idp}-ring" maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="136">
      <rect width="120" height="136" fill="#fff"/>
      <rect x="23" y="43" width="74" height="94" rx="14" fill="#000"/>
      <path d="M60 8 L74 46 L46 46 Z" fill="#000"/>
    </mask>
    <clipPath id="${idp}-screen"><rect x="34" y="54" width="52" height="26" rx="4"/></clipPath>
  </defs>
  <circle cx="60" cy="66" r="46" fill="none" stroke="${blue}" stroke-width="4.5" mask="url(#${idp}-ring)"/>
  <path d="M1 67 L19 61.5 L16.5 67 L19 72.5 Z" fill="${blue}"/>
  <path d="M119 67 L101 61.5 L103.5 67 L101 72.5 Z" fill="${blue}"/>
  <path d="M60 15 L70.5 42 L60 36.5 L49.5 42 Z" fill="${ink}"/>
  <path d="M55 11 V1 H57.6 L63 7.4 V1 H65 V11 H62.4 L57 4.6 V11 Z" fill="${ink}"/>
  <rect x="28" y="48" width="64" height="84" rx="10" fill="${ink}"/>
  <rect x="34" y="54" width="52" height="26" rx="4" fill="${paper}"/>
  <path clip-path="url(#${idp}-screen)" d="M34 78 L47 67.5 L51.5 71 L63 59 L72.5 68.5 L76.5 65.5 L87 75 V81 H34 Z" fill="${blue}"/>
  <path clip-path="url(#${idp}-screen)" d="M63 59 L67.5 63.6 L64.5 62.4 L62 65 L60 63.2 Z" fill="${paper}"/>
  <rect x="34" y="86" width="24" height="18" rx="3" fill="${paper}"/>
  <rect x="62" y="86" width="24" height="18" rx="3" fill="${paper}"/>
  <rect x="34" y="108" width="24" height="18" rx="3" fill="${paper}"/>
  <rect x="62" y="108" width="24" height="18" rx="3" fill="${blue}"/>
  <path d="M46 90.5 V99.5 M41.5 95 H50.5 M69.5 95 H78.5 M42.6 113.6 L49.4 120.4 M49.4 113.6 L42.6 120.4" stroke="${ink}" stroke-width="2.6" stroke-linecap="round" fill="none"/>
  <path d="M69.5 115 H78.5 M69.5 119 H78.5" stroke="${paper}" stroke-width="2.4" stroke-linecap="round" fill="none"/>`;

const LIGHT = { ink: '#0B1F3A', paper: '#FFFFFF', blue: '#0A5CC0' };
const DARK = { ink: '#E7EDF5', paper: '#0F1826', blue: '#6AA8FF' };

const svg = (vb, body, title) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" role="img" aria-label="${title}"><title>${title}</title>${body}</svg>\n`;

// lockup: mark scaled to wordmark cap height region. Mark 136 tall -> scale 0.92 -> 125; wordmark baseline 96 in its own space.
function lockup(c, withCom, idp) {
  const s = 1;
  const mx = 0, my = 0;
  const wx = 132, wy = 22; // wordmark offset
  const w = wx + (withCom ? wordmark.width : wordmark.widthNoCom) + 4;
  const body = `<g transform="translate(${mx} ${my}) scale(${s})">${mark(c.ink, c.paper, c.blue, idp)}</g>
  <g transform="translate(${wx} ${wy})"><path d="${wordmark.north}" fill="${c.ink}"/><path d="${wordmark.calc}" fill="${c.blue}"/>${withCom ? `<path d="${wordmark.com}" fill="${c.ink}"/>` : ''}</g>`;
  return svg(`0 0 ${w} 136`, body, withCom ? 'NorthCalculator.com' : 'NorthCalculator');
}

fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'logo-mark.svg'), svg('0 0 120 136', mark(LIGHT.ink, LIGHT.paper, LIGHT.blue), 'NorthCalculator'));
fs.writeFileSync(path.join(out, 'logo-mark-dark.svg'), svg('0 0 120 136', mark(DARK.ink, DARK.paper, DARK.blue), 'NorthCalculator'));
fs.writeFileSync(path.join(out, 'logo-lockup.svg'), lockup(LIGHT, true, 'l'));
fs.writeFileSync(path.join(out, 'logo-lockup-dark.svg'), lockup(DARK, true, 'd'));
fs.writeFileSync(path.join(out, 'logo-lockup-nocom.svg'), lockup(LIGHT, false, 'n'));

// Favicon: simplified for 16-32px: calculator + north arrow only, auto dark via media query.
const fav = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><style>.i{fill:#0B1F3A}.p{fill:#fff}.b{fill:#0A5CC0}@media (prefers-color-scheme:dark){.i{fill:#E7EDF5}.p{fill:#0F1826}.b{fill:#6AA8FF}}</style>
<path class="i" d="M32 1 L41 19 L32 15 L23 19 Z"/>
<rect class="i" x="12" y="20" width="40" height="43" rx="7"/>
<rect class="p" x="17" y="25" width="30" height="12" rx="2.5"/>
<path class="b" d="M17 37 L25 30 L29 33 L35 27 L47 37 Z"/>
<rect class="p" x="17" y="41" width="13" height="8.5" rx="2"/><rect class="p" x="34" y="41" width="13" height="8.5" rx="2"/>
<rect class="p" x="17" y="52.5" width="13" height="8.5" rx="2"/><rect class="b" x="34" y="52.5" width="13" height="8.5" rx="2"/>
</svg>
`;
fs.writeFileSync(path.join(out, 'favicon.svg'), fav);

// TS module for the inline React logo (themeable via CSS vars).
fs.writeFileSync(path.join(out, 'wordmark.ts'), `// Generated by the logo build script (IBM Plex Sans Bold outlines). Do not edit by hand.
export const WORDMARK = ${JSON.stringify(wordmark, null, 2)} as const;
`);
console.log('ok', wordmark.width, wordmark.widthNoCom);
