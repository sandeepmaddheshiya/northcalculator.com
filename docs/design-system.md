# Design system: "the precision instrument"

The living version is the gallery at **`/dev/design`** (noindex, robots-blocked). Tokens live in `src/app/globals.css`, and their contrast is enforced by `src/lib/tokens.test.ts`.

## 1. Point of view

NorthCalculator should feel like a well-made measuring tool crossed with an engineer's notebook: calm, exact, legible. Typography does most of the work. Colour is spent only where it carries meaning (brand, state, the active result). The result is always the hero.

What we deliberately avoid (BRIEF §7): gradient blobs, glassmorphism, icon-in-a-rounded-square feature grids, emoji icons, stock art, uniform `rounded-2xl`, centred marketing heroes, and invented social proof.

## 2. Brand

- **Logo:** the owner's compass-calculator mark, redrawn as SVG (`brand/`, regenerate with `node brand/generate-logo.cjs <outdir>` from a folder that has `opentype.js` and `@fontsource/ibm-plex-sans`). The wordmark is IBM Plex Sans Bold converted to outlines: "North" in ink and "Calculator" in brand blue, with ".com" at about 60% size in the full lockup.
- **In-app logo:** `components/brand/Logo.tsx` is inline and themeable (ink, paper and blue map to tokens, so dark mode is automatic).
- **Favicon:** a simplified mark (north needle + calculator), with its own dark-mode colours inside the SVG. PNG/ICO fallbacks and maskable icons are in `public/`.
- The compass appears only in the logo. It is never used as decoration.

## 3. Colour

Semantic tokens only. Components never use raw hex.

| Token                            | Light                  | Dark                  | Use                                              |
| -------------------------------- | ---------------------- | --------------------- | ------------------------------------------------ |
| `bg`                             | `#f6f8fb`              | `#08101c`             | Page                                             |
| `surface`                        | `#ffffff`              | `#0f1826`             | Inputs, panels                                   |
| `sunken`                         | `#eef2f7`              | `#0b1420`             | Formula blocks, table heads, segmented track     |
| `text`                           | `#0b1f3a` (brand navy) | `#e7edf5`             | Body                                             |
| `muted` / `subtle`               | `#4a5870` / `#5e6c81`  | `#a7b4c6` / `#8c9aae` | Secondary, captions                              |
| `line` / `line-strong`           | `#d5dce6` / `#7a879c`  | `#223047` / `#55657d` | Hairlines / input borders (≥3:1)                 |
| `brand`                          | `#0a5cc0`              | `#6aa8ff`             | Links, focus, primary action, formula rule       |
| `highlight`                      | `#fff1c2`              | `#3b3112`             | One-off "highlighter pass" when a result changes |
| `success` / `warning` / `danger` | AA on their washes     | AA on their washes    | State only                                       |

Every text pair meets WCAG 2.2 AA (body text and the brand navy reach about 15:1). Input borders meet 3:1. Dark mode is tuned separately, not inverted: the blue is lifted, surfaces are navy-black, and washes are deep.

## 4. Typography

- **IBM Plex Sans** (400/500/600) for UI and text. **IBM Plex Mono** (400/500) for formulas, units, step working and table data. Both are self-hosted through `next/font` with metric-matched fallbacks (no layout shift). Only Plex Sans is preloaded.
- Per-script sister families (Plex Sans Devanagari, Arabic, Thai, JP, KR) get added with each locale (ADR-014).
- **Numerals:** the `.num` utility sets `tabular-nums lining-nums`. All results, tables and inputs use it.
- **Scale** (rem): 0.6875 / 0.75 / 0.875 / 1 / 1.1875 / 1.4375 / 1.75 / 2.25. Results use `text-result`, which is fluid from 2.5 to 4 rem.
- Long-form text: 17px, line-height 1.7, a 68ch measure, balanced headings, pretty paragraphs.
- Eyebrow labels: Mono, uppercase, with 0.16–0.18em tracking. Use them sparingly, as section markers.

## 5. Space, grid, shape

- 8-point grid. The container is 1240px max with 16px gutters on phones and 24px from 640px.
- Calculator layout: **inputs 5 / result 7** columns at ≥1024px, stacked on phones (result after inputs, with a sticky result bar arriving in Phase 2).
- Asymmetry is deliberate (e.g. the home hero is 7/5 with a numbered margin list instead of cards).
- Radii are small and varied: 2px (keys, kbd), 4px (inputs, buttons), 6px (menus), 10px (dialogs). Never uniform.
- Elevation: hairlines first. Shadows appear only on floating layers (menus, dialog).

## 6. Components (in `/dev/design`)

| Component               | Notes                                                                                                                                                                                                  |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `NumberField`           | `type=text` + `inputmode=decimal`. Forgiving parse (`1 000`, `$15`, `2,5`, Indian grouping). Inline validation via `aria-invalid`/`aria-describedby`. Enter moves to the next field. Reformats on blur |
| `SelectField`           | Native select (best on mobile)                                                                                                                                                                         |
| `Segmented`             | Native radios, so arrow keys and announcements come free                                                                                                                                               |
| `Switch`                | `role=switch`                                                                                                                                                                                          |
| `Button`                | Primary / secondary / ghost; 36 or 44px tall (≥44px tap target for md)                                                                                                                                 |
| `ResultHero`            | Large tabular result, count-up under 260 ms (instant with reduced motion), a one-off highlighter flash, polite live region                                                                             |
| `ResultList`            | A ruled ledger: label left, value right                                                                                                                                                                |
| `Formula`               | Mono, left brand rule, sunken wash, variable list. Plain text so it stays quotable                                                                                                                     |
| `Steps`                 | Zero-padded mono step numbers with the user's own numbers                                                                                                                                              |
| `DataTable`             | Caption, scoped headers, scroll region, tabular figures                                                                                                                                                |
| `Callout`               | Left rule + wash, not a card                                                                                                                                                                           |
| `Icon`, `CategoryGlyph` | Custom 24-grid set with a 1.6 stroke. Category glyphs carry one brand-filled accent                                                                                                                    |
| Header search           | ⌘/Ctrl-K and `/`. The dialog, index and MiniSearch load lazily on first open                                                                                                                           |

## 7. Motion

Motion exists only where it means something: a result changing (count-up + highlighter), focus rings, and copy confirmation. Durations are 150–260 ms with an ease-out-quint curve. `prefers-reduced-motion` disables all of it.

## 8. Accessibility rules

- Visible focus everywhere (2px brand outline, 2px offset).
- The accessible name contains the visible label (WCAG 2.5.3). Decorative glyphs are `aria-hidden`.
- Results are announced politely. Errors are announced through `aria-describedby`.
- Charts (Phase 2) always come with a data table and a one-sentence text summary.
- Logical CSS properties only (`ms-`, `pe-`, `start-`) so RTL mirrors automatically. The gallery has an LTR/RTL toggle.

## 9. Print

A `.no-print` class hides the header and footer. External links print their URL. Calculator pages get a one-page result layout in Phase 2.
