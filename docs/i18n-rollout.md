# Locale rollout runbook (Phase 4)

A locale goes live only when its UI and content are translated **and reviewed by a fluent person**. Machine translation is a first draft only (BRIEF §8, content-guidelines §8). No untranslated or unreviewed page may exist under a locale, and none may appear in its sitemap.

Check progress at any time with `pnpm i18n:status`.

## Steps for one locale (example: `es`)

1. **UI strings.** Copy `messages/en.json` to `messages/es.json` and translate every value. Keep `{placeholders}` unchanged. `pnpm check:i18n` enforces key parity.
2. **Slugs.** Add the translated category slugs to `src/calculators/categories.ts` (`slug.es`) and each calculator's slug to its `definition.ts` (`slug.es`). Slugs use the words people search for in that language.
3. **Content.** For each calculator, add `content.es.tsx` next to `content.en.tsx` and register it in the module's `index.ts` (`content: { en: …, es: () => import('./content.es') … }`). This is localisation, not word-for-word translation: local currency and units in examples, local sources where they exist, and regional rules where they differ. The worked-example prose receives computed numbers, so it cannot disagree with the tool.
4. **Static pages.** Translate `src/content/pages/<id>.tsx` for the locale (About, Methodology, Editorial policy, Privacy, Terms, Contact).
5. **Review.** A fluent reviewer checks every page, preferably someone who also knows the subject (finance and health pages need a qualified reviewer). Record the reviewer in the PR.
6. **List the calculator.** Add `'es'` to `definition.locales` only for calculators whose `es` content has been reviewed. Unlisted calculators simply don't exist in that locale.
7. **Go live.** Set `status: 'live'` for the locale in `src/i18n/locales.ts`. Routing, hreflang (in both directions), sitemaps, the locale switcher, search index and OG images then include it automatically.
8. **Verify.** `pnpm check`, `pnpm build`, `pnpm e2e` (add the locale's pages to the e2e list), and spot-check RTL layout for `ar` and `ur`.

## Order

Follow BRIEF §8: es, hi, pt-BR, fr, de, id, ar, ru, tr, ja, it, nl, pl, vi, th, ko, zh-CN, bn, ur. Hindi and Spanish first, because they cover the largest audiences after English.

## Fonts

Non-Latin scripts use the IBM Plex sister families (ADR-014): Plex Sans Devanagari, Arabic, Thai, JP and KR. Add the family to `src/app/fonts.ts` when the first locale in that script goes live, and check the CSS budget.
