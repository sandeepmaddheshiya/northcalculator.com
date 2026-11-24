/**
 * Content gate (BRIEF §12, §16; docs/content-guidelines.md). Fails the build when a calculator is
 * missing what makes it trustworthy, when its page content breaks the section rules, when prose
 * and tool could disagree, or when two pages are suspiciously similar (thin/duplicate content).
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CALCULATORS, MODULES } from './registry';
import { CATEGORIES } from './categories';
import { makeFmt } from './fmt';
import { defaultValues } from './url-state';
import { fill } from '@/lib/fill';
import type { CalculatorContent } from './content-types';
import type { CalculatorDefinition, InputValues } from './types';

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const BANNED = [
  /in today'?s fast-paced world/i,
  /look no further/i,
  /whether you'?re a .{1,40} or a /i,
  /\bunlock\b/i,
  /\bsupercharge/i,
  /\bseamless/i,
  /\bdelve\b/i,
  /it'?s important to note/i,
  /comprehensive guide/i,
  /\bultimate\b/i,
  /lorem ipsum/i,
  /TODO\(/, // generator placeholders (scripts/new-calculator.mjs)
];

describe('content gate: definitions', () => {
  it('ids and slugs are unique per locale', () => {
    const ids = CALCULATORS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const locale of new Set(CALCULATORS.flatMap((c) => c.locales))) {
      const slugs = CALCULATORS.filter((c) => c.locales.includes(locale)).map(
        (c) => `${c.category}/${c.slug[locale]}`,
      );
      expect(new Set(slugs).size).toBe(slugs.length);
    }
  });

  it('every module has a client island registered in islands.tsx', () => {
    const src = readFileSync(new URL('./islands.tsx', import.meta.url), 'utf8');
    for (const c of CALCULATORS)
      expect(src, `island for ${c.id}`).toMatch(new RegExp(`(^|\\s)'?${c.id}'?: dynamic\\(`, 'm'));
  });

  it.each(CALCULATORS.map((c) => [c.id, c] as const))(
    '%s has sources, review, examples, versioning',
    (_id, c) => {
      expect(c.sources.length, 'at least one cited source').toBeGreaterThan(0);
      for (const s of c.sources) {
        expect(s.url).toMatch(/^https:\/\//);
        expect(s.accessed).toMatch(ISO);
        expect(s.publisher.length).toBeGreaterThan(1);
        expect(s.url, 'Wikipedia is never the cited source').not.toMatch(/wikipedia\.org/);
      }
      expect(c.examples.length, 'at least two worked examples').toBeGreaterThanOrEqual(2);
      expect(['pending', 'reviewed']).toContain(c.review.status);
      if (c.review.status === 'reviewed') {
        expect(c.review.reviewer, 'reviewed pages name the reviewer').toBeTruthy();
        expect(c.review.date).toMatch(ISO);
      } else {
        expect(c.review.date, 'no review date on unreviewed pages (ADR-011)').toBeUndefined();
      }
      expect(c.contentUpdated).toMatch(ISO);
      expect(c.changelog.length).toBeGreaterThan(0);
      expect(c.outputs.filter((o) => o.primary)).toHaveLength(1);
      for (const l of c.locales) expect(c.slug[l], `slug for ${l}`).toBeTruthy();
      expect(CATEGORIES.some((k) => k.key === c.category)).toBe(true);
      for (const r of c.related)
        expect(
          CALCULATORS.some((x) => x.id === r),
          `related ${r} exists`,
        ).toBe(true);
      const params = c.inputs.map((i) => i.param);
      expect(new Set(params).size, 'URL params unique').toBe(params.length);
    },
  );
});

/** Every ui key a definition refers to (labels, options, help, outputs, rounding). */
function referencedKeys(def: CalculatorDefinition): string[] {
  const keys = [def.roundingKey];
  const inputs = def.inputs.flatMap((i) => (i.type === 'list' ? [i, ...i.columns] : [i]));
  for (const i of inputs) {
    if (i.helpKey) keys.push(i.helpKey);
    if (i.row) keys.push(i.row.legendKey);
    if (i.suffixKey) keys.push(i.suffixKey);
    if (i.prefixKey) keys.push(i.prefixKey);
    if ('options' in i) keys.push(...i.options.map((o) => o.labelKey));
    if (i.labelBy) {
      const by = def.inputs.find((x) => x.id === i.labelBy);
      if (by && 'options' in by) keys.push(...by.options.map((o) => `${i.labelKey}.${o.value}`));
    } else keys.push(i.labelKey);
  }
  for (const o of def.outputs) {
    const by = o.labelBy ? def.inputs.find((x) => x.id === o.labelBy) : undefined;
    if (by && 'options' in by) keys.push(...by.options.map((v) => `${o.labelKey}.${v.value}`));
    else keys.push(o.labelKey);
  }
  return keys;
}

const pages: {
  id: string;
  locale: string;
  def: CalculatorDefinition;
  content: CalculatorContent;
}[] = [];
for (const m of MODULES)
  for (const locale of m.definition.locales)
    pages.push({
      id: m.definition.id,
      locale,
      def: m.definition,
      content: await m.content[locale]!(),
    });

describe('content gate: page content (content-guidelines §2)', () => {
  it.each(pages.map((p) => [`${p.id} (${p.locale})`, p] as const))(
    '%s',
    (_label, { def, content, locale }) => {
      expect(
        content.title.length,
        `title "${content.title}" is 50–60 characters`,
      ).toBeGreaterThanOrEqual(50);
      expect(
        content.title.length,
        `title "${content.title}" is 50–60 characters`,
      ).toBeLessThanOrEqual(60);
      expect(content.description.length, 'description 120–160 characters').toBeGreaterThanOrEqual(
        120,
      );
      expect(content.description.length, 'description 120–160 characters').toBeLessThanOrEqual(160);
      expect(words(content.promise), 'promise ≤ 16 words').toBeLessThanOrEqual(16);
      expect(words(content.summary), 'summary 40–70 words').toBeGreaterThanOrEqual(40);
      expect(words(content.summary), 'summary 40–70 words').toBeLessThanOrEqual(70);
      expect(content.faqs.length, '4–8 FAQs').toBeGreaterThanOrEqual(4);
      expect(content.faqs.length, '4–8 FAQs').toBeLessThanOrEqual(8);
      for (const f of content.faqs) {
        expect(words(f.a), `FAQ answer "${f.q}" is 30–90 words`).toBeGreaterThanOrEqual(30);
        expect(words(f.a), `FAQ answer "${f.q}" is 30–90 words`).toBeLessThanOrEqual(90);
        expect(f.q.trim().endsWith('?'), `"${f.q}" is a question`).toBe(true);
      }
      expect(content.examples.map((e) => e.id).sort(), 'example ids match the definition').toEqual(
        def.examples.map((e) => e.id).sort(),
      );
      for (const key of referencedKeys(def))
        expect(content.ui[key], `ui key "${key}"`).toBeTruthy();
      const text = [
        content.name,
        content.promise,
        content.summary,
        ...Object.values(content.ui),
        ...content.faqs.flatMap((f) => [f.q, f.a]),
      ].join('\n');
      for (const re of BANNED) expect(text, `banned phrase ${re}`).not.toMatch(re);
      // A letter followed by "!" is punctuation; digits followed by "!" are factorials (170!).
      expect(text, 'no exclamation marks in explanatory text').not.toMatch(/\p{L}!(\s|$)/u);
      void locale;
    },
  );
});

describe('content gate: worked examples (prose and tool can never disagree)', () => {
  const mods = MODULES.flatMap((m) =>
    m.definition.examples.map((e) => [`${m.definition.id}/${e.id}`, m, e] as const),
  );
  it.each(mods)('%s', async (_label, m, e) => {
    const def = m.definition;
    const content = await m.content[def.locales[0]!]!();
    const inputs = { ...defaultValues(def, '2026-11-24'), ...e.inputs } as InputValues;
    const currency =
      def.currency && 'input' in def.currency
        ? String(inputs[def.currency.input])
        : def.currency && 'fixed' in def.currency
          ? def.currency.fixed
          : 'USD';
    const r = m.compute(inputs, {
      today: '2026-11-24',
      fmt: makeFmt('en', currency),
      data: await m.data?.(),
      t: (k, v) => fill(content.ui[k] ?? k, v ?? {}),
    });
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k], `${k}`).toBe(v);
  });
});

describe('content gate: originality (no near-duplicate pages)', () => {
  const shingles = (s: string) => {
    const w = s
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter(Boolean);
    const out = new Set<string>();
    for (let i = 0; i + 5 <= w.length; i++) out.add(w.slice(i, i + 5).join(' '));
    return out;
  };
  const jaccard = (a: Set<string>, b: Set<string>) => {
    let inter = 0;
    for (const x of a) if (b.has(x)) inter++;
    return inter / (a.size + b.size - inter || 1);
  };
  it('summary + FAQ text overlap between any two pages stays below 15%', () => {
    const docs = pages.map((p) => ({
      id: `${p.id}/${p.locale}`,
      s: shingles([p.content.summary, ...p.content.faqs.map((f) => `${f.q} ${f.a}`)].join(' ')),
    }));
    for (let i = 0; i < docs.length; i++)
      for (let j = i + 1; j < docs.length; j++)
        expect(jaccard(docs[i]!.s, docs[j]!.s), `${docs[i]!.id} vs ${docs[j]!.id}`).toBeLessThan(
          0.15,
        );
  });
});
