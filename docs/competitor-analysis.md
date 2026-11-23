# Competitor analysis

Phase 0, researched 2026-11-23. Each figure has a source. Traffic numbers are third-party estimates (Ahrefs/AhrefsTop), not audited data. Ad slots and JSON-LD could not be checked from text extraction, so they are marked "to verify". We will verify them in Phase 1 with PageSpeed Insights, the Rich Results Test and a headless-browser audit (see "Open verification work" at the end).

## 1. Market snapshot

| Site                                  | Size (claimed)                                    | Organic traffic (est.)                                                                  | Languages                                                 | Trust signals                                                     | Live results                | Notes                                                                                                                                                              |
| ------------------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| calculator.net                        | "around 200 calculators", 4 top categories        | 25.6M search visits/mo (Nov 2026); US 41.9%, **India 27.3%**, UK 3.8%, CA 3.6%, PH 3.3% | English only, "mainly intended for use by U.S. residents" | No author, reviewer, date or citations on the mortgage page       | No (Calculate button)       | Strongest domain. Ranks #1 in the US for "loan calculator" (616K), "grade calculator" (448K), "dice roller" (392K), "time calculator" (335K)                       |
| omnicalculator.com                    | 3,800+ calculators, 14 categories, about 40 staff | ~5.7M US search visits/mo                                                               | 9 languages (popular calculators only)                    | Named creators and reviewers, editorial policy, a "sources" count | Yes                         | Best trust model of the group. Long pages (2,000+ words under the widget), copy errors, thin sourcing (mortgage page cites one 2006 book), no visible updated date |
| calculatorsoup.com                    | Large math/stats catalogue                        | ~4.4M US search visits/mo                                                               | English                                                   | Named author in a citation block, "Last updated" date             | Mostly                      | Formula plus worked steps are good. Repetitive examples, a visible "For AI Systems" block, typos                                                                   |
| rapidtables.com                       | ~51 math calculators plus a large converter set   | n/a                                                                                     | English                                                   | None visible                                                      | Yes, and a Calculate button | Good formula tables and "calculate this example" links. No sources, author or date. Dense                                                                          |
| bankrate.com / nerdwallet.com         | Finance only                                      | Bankrate ~6.3M US; mortgage calculator ~1.4M/mo                                         | English (US)                                              | Strong brand and editorial teams                                  | Yes                         | Pages are wrapped in lead-gen and affiliate rate tables. US-only assumptions                                                                                       |
| groww.in                              | India finance                                     | SIP calculator ~3.5M/mo                                                                 | English                                                   | Brand                                                             | Yes                         | Shows how big Indian finance-calculator demand is (SIP, EMI, FD, PPF)                                                                                              |
| Mayo Clinic / CDC / NHS / WebMD       | A few health tools each                           | Mayo calorie 456K, WebMD ovulation 373K, americanpregnancy.org due date 427K            | EN (NHS: EN only)                                         | Highest medical E-E-A-T                                           | Varies                      | Strong trust but basic UX. We can't out-authority them, so we compete on clarity, explanation and citing the same primary sources                                  |
| timeanddate.com                       | Date/time                                         | High                                                                                    | Several                                                   | Strong                                                            | Partly                      | Very deep tz/holiday data. Hard to beat on time zones; beatable on calculator UX                                                                                   |
| unitconverters.net / convertunits.com | Conversion                                        | High                                                                                    | EN                                                        | Weak                                                              | Yes                         | Thin pages, heavy ads, no sources for factors                                                                                                                      |
| symbolab / desmos                     | Symbolic math, graphing                           | Very high                                                                               | Many                                                      | Strong                                                            | Yes                         | Not our Wave 1 battleground. Our scientific calculator should be fast and clean, not a CAS                                                                         |
| Google built-in widgets               | Basic calc, units, currency, mortgage, BMI        | Takes zero-click traffic                                                                | All                                                       | Implicit                                                          | Yes                         | Answers "15% of 240" directly. We win on depth: steps, explanation, scenarios, sharing, extras such as extra payments                                              |

Sources: AhrefsTop calculator.net page (https://ahrefstop.com/websites/calculator.net, Nov 2026); Ahrefs, "8 Websites Driving Insane Traffic Using… Calculators" (2024-12-30); omnicalculator.com/omni-by-the-numbers; direct reads of the calculator.net, omnicalculator, calculatorsoup and rapidtables pages on 2026-11-23.

## 2. What each one does well, and how we beat it

### calculator.net (the main incumbent)

- **Strengths:** domain age (since 2008), breadth across the most-searched tools, a very deep mortgage tool (taxes, PMI, HOA, extra payments, biweekly, amortization table and chart), fast plain HTML.
- **Weaknesses we checked:** results need a Calculate button; no FAQ, sources, author or date; uncited claims ("about 1.1%" property tax, PMI "0.3% to 1.9%"); an ambiguous PMI-removal rule ("80% or 78%"); the homepage is a link list with no tool; US-only, yet **27% of its traffic comes from India**.
- **How we beat it:**
  1. Match its feature depth on flagship tools (mortgage extra payments, amortization), with live results.
  2. Cite every claim. Example: PMI cancellation at 78% LTV is automatic under the Homeowners Protection Act, and a borrower can request it at 80%. We say exactly that and link the CFPB.
  3. **Localise for India, its largest under-served audience**: EMI, SIP, GST, lakh/crore number grouping, ₹ defaults, Indian income tax with the tax year stated.
  4. Put a working tool (universal input) on the homepage.

### Omni Calculator (the trust and breadth leader)

- **Strengths:** a huge catalogue, named authors and reviewers, an editorial policy, a deterministic engine, live results, 9 languages.
- **Weaknesses:** very long pages with generic explainer text; weak primary sourcing; grammar errors; no visible last-reviewed date; translations cover only "popular" calculators.
- **How we beat it:**
  1. Answer first and keep pages tight: a 40–70 word summary, then formula, examples and FAQ. No 2,000-word preambles.
  2. Primary sources for every formula, plus a dated "Last reviewed" and a changelog.
  3. Show steps with the user's own numbers. Omni mostly shows a generic formula.
  4. Shareable URL state and print/PDF for every calculator.
  5. Don't race their 3,800 count. Win on the top ~300 queries per market.

### CalculatorSoup and RapidTables (math and conversion)

- **Strengths:** formula-forward, worked examples, "calculate this example" deep links (RapidTables), dated updates (CalculatorSoup).
- **Weaknesses:** dated UI, dense link sidebars, no sources, repeated "related" blocks, AI-targeted text shown to humans.
- **How we beat them:** keep the good ideas. Worked examples will deep-link into the calculator using our URL state, and we render steps with the user's own numbers. Add clean typography, a mobile-first layout and accessibility. Serve AI crawlers through `llms.txt` and JSON-LD, never through visible "for AI" text blocks.

### Bankrate and NerdWallet (finance)

- **Strengths:** brand trust, editorial staff, rate data.
- **Weaknesses:** lead-gen first; rate tables and affiliate CTAs crowd the tool; US-only.
- **How we beat them:** no affiliate pressure, compare mode (A vs B), extra-payment scenarios, international versions (India EMI, UK repayment, Canada semi-annual compounding).

### Health sources (Mayo, CDC, NHS, WebMD)

- **Strengths:** unmatched medical authority.
- **How we compete:** don't claim medical authority we lack. Cite the same primary studies, state population caveats (WHO Asian BMI cut-offs, BMI limits for athletes and older adults), present results clearly with ranges, and link to those authorities. Get named clinical reviewers before the health pages launch (see open questions).

### Google built-in widgets

- Google answers simple queries in the SERP. We can't stop that and shouldn't try to game it.
- **How we compete:** depth and the next step. The universal input understands "15% of 240" and then shows reverse %, % change and steps. For mortgages, add extra payments, PMI removal date and a printable schedule.

## 3. Cross-cutting gaps nobody fills well (our wedge)

1. **Answer-first and fully cited at the same time.** No incumbent combines a short direct answer, a cited formula, steps with your numbers, and a dated review.
2. **Real localisation:** lakh/crore grouping, regional rules (Canada's semi-annual mortgage compounding, UK SDLT bands, Indian GST slabs) and translated slugs. The incumbents are English-first or translate only the "popular" pages.
3. **Shareable, printable scenarios** as a standard feature, not just on a few tools.
4. **Performance and accessibility as features:** no layout shift, no ads at launch, WCAG 2.2 AA.
5. **Privacy statement in the UI:** "Your numbers never leave this device." This is a real differentiator for salary, loan and health inputs.

## 4. Open verification work (Phase 1, needs a real browser)

- Run PageSpeed Insights / CrUX for each competitor's mortgage, BMI and percentage pages and record LCP/INP/CLS.
- Use the Rich Results Test and a view-source check for JSON-LD types.
- Count ad slots above the fold at 360px and 1280px.
- Record the results in this file under "Measured performance".
