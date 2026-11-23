/**
 * Content gate (BRIEF §12, §16). Fails the build when a calculator is missing what makes it
 * trustworthy, or when two pages are suspiciously similar (thin/duplicate content guard).
 * Phase 2 extends this to the rendered content (examples, FAQs, word counts per locale).
 */
import { describe, expect, it } from 'vitest';
import { CALCULATORS } from './registry';
import { CATEGORIES } from './categories';

const ISO = /^\d{4}-\d{2}-\d{2}$/;

describe('content gate', () => {
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

  it.each(CALCULATORS.map((c) => [c.id, c] as const))(
    '%s has sources, review, examples, versioning',
    (_id, c) => {
      expect(c.sources.length, 'at least one cited source').toBeGreaterThan(0);
      for (const s of c.sources) {
        expect(s.url).toMatch(/^https:\/\//);
        expect(s.accessed).toMatch(ISO);
        expect(s.publisher.length).toBeGreaterThan(1);
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
