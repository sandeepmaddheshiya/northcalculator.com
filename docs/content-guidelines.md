# Content guidelines

These rules apply to every word published on NorthCalculator. The build-time content gate (BRIEF §12) enforces the mechanical ones. Reviewers enforce the rest.

## 1. The reader comes first

A reader arrives with a number to work out and a decision to make. Each page should get them to the right answer, help them understand it, and tell them what to do with it, in that order. If a sentence doesn't serve one of those three jobs, cut it.

## 2. Page sections and what goes in each

| Section               | Length      | Rules                                                                                                                                                                                                                             |
| --------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| H1 + promise          | ≤ 12 words  | Use the name people actually search for ("Mortgage Calculator"). The promise names the concrete outputs: "Monthly payment, total interest and a full amortization schedule."                                                      |
| Answer-first summary  | 40–70 words | Say what it computes, the core formula in words, and the main assumption. It must make sense quoted alone. No "In this article…".                                                                                                 |
| How it works          | As needed   | Formula in text **and** rendered math. Define every variable with its unit. State the assumptions and the rounding policy.                                                                                                        |
| Worked examples       | ≥ 2         | Use real, plausible numbers. Show every step. Each example is a test fixture (`examples[]` in the definition) and deep-links into the calculator with that state. At least one example covers an edge case or a regional variant. |
| Practical guidance    | 3–6 points  | Tips, common mistakes, when _not_ to use this calculator, and regional differences. Each point must be specific to this calculator.                                                                                               |
| FAQ                   | 4–8 Q&As    | These must be real questions people ask (from People Also Ask, forums, support inbox). Answers run 30–90 words and are self-contained. Never reuse an FAQ from another calculator.                                                |
| Sources & methodology | All         | Primary sources with title, publisher, URL and access date, plus the reviewer name, last-reviewed date and version.                                                                                                               |

Target length: 400–900 words for a standard page, more for complex or YMYL pages, and only when the extra words carry information. Length is never a goal in itself.

## 3. Voice

- Plain, precise, calm. Write like a good engineer explaining something to a smart friend.
- Prefer short sentences and the active voice. Use "you".
- Use specific numbers, not adjectives: "about $1,200 more interest", not "significantly more interest".
- Banned: "In today's fast-paced world", "Look no further", "Whether you're a… or a…", "Unlock", "Supercharge", "Seamless", "Delve", "It's important to note that", "comprehensive guide", "ultimate". Also banned: exclamation marks in explanatory text, rhetorical questions as section openers, and filler transitions.
- Don't hedge everything. Hedge once, in the right place, with the real reason ("Assumes a fixed rate. If your rate resets, …").

## 4. Accuracy rules

1. Every formula, threshold or constant has a citation to a primary or authoritative source (government, standards body, peer-reviewed study, central bank, recognised textbook). Wikipedia is never the cited source, though it can help you find one.
2. Every number in the prose that the calculator could compute **is** computed: content uses `<Example id=…>` / `<Value …>` components fed by `compute()`, so prose and tool can never disagree.
3. Time-sensitive facts (tax rates, thresholds, CPI data) show the effective date or tax year next to the number.
4. When sources disagree (e.g. ideal-weight formulas), show the alternatives and explain how they differ. Never pick one silently.
5. Anything we're not sure of goes in `docs/open-questions.md`. We don't publish a guess.

## 5. YMYL pages (finance, health, tax, legal)

- A named reviewer with relevant credentials is required before the page is indexed. Until then it ships `noindex` or doesn't ship at all.
- Put the disclaimer next to the result, in one calm sentence. Example: "This is an educational estimate, not medical advice. BMI doesn't distinguish muscle from fat. See a clinician for a personal assessment."
- Health pages state who the formula was validated on (age, sex, population) and who it doesn't apply to (pregnancy, children, athletes, older adults).
- Finance pages state what's excluded (fees, taxes, rate changes) and never recommend a specific product.

## 6. Originality and anti-thin-content rules

- No templated paragraphs shared across calculators beyond the standard disclaimer and UI microcopy.
- Sibling pages (percentage change vs percentage difference) must each answer a distinct intent and say how they differ from each other.
- No location-swap pages ("mortgage calculator in Austin"). Regional variants exist only where the rules or data actually differ, and the page must explain that difference.
- The CI similarity check (shingled text, threshold set in Phase 1) fails the build if two pages' body content is too similar.

## 7. AI assistance policy

AI may help draft. A human checks every fact against the cited source, rewrites anything generic, and is credited as the reviewer. Every page records `draftedWith` (none / ai-assisted) internally for our own audit trail. Nothing is published unreviewed.

## 8. Translation

Translations are localisations, not word swaps: local examples, currency, units, regional rules, local sources where they exist. A machine translation is a first draft only. A fluent reviewer must sign off before the locale page exists (BRIEF §8).

## 9. Formatting conventions

- Numbers: locale-formatted, tabular figures in results, units with a thin non-breaking space (`5 kg`).
- Use "%" with no space in English (`15%`). Other locales follow their own convention (`15 %` in fr/de).
- Dates in prose: unambiguous ("23 November 2026" / "November 23, 2026" per locale).
- Spell out the first use of an acronym: "equated monthly instalment (EMI)".
- Headings use sentence case.
