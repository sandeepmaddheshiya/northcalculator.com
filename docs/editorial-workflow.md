# Editorial workflow

The owner is currently the sole reviewer (ADR-011). Pages ship with `review.status: 'pending'` and are reviewed one by one after deploy.

## Lifecycle of a calculator page

1. **Specify:** create the folder with `pnpm new:calculator` (Phase 3). Fill in `definition.ts`: inputs, outputs, rounding policy, sources (with access dates) and regions.
2. **Implement and verify the formula:** write a pure `compute.ts` and ≥10 tests, including ≥2 reference values taken from an independent authoritative source (cite it in the test). Worked examples in the definition are asserted by tests.
3. **Write content** following `docs/content-guidelines.md`: answer-first summary, how it works, examples, guidance, FAQ, sources.
4. **Automated gates (CI):** types, lint, unit tests, content gate, i18n parity, build page checks, bundle budget, E2E + axe, Lighthouse.
5. **Publish** with status `pending`. The page shows "Formulas verified against cited sources by automated tests; editorial review pending."
6. **Owner review:** see the checklist below. On approval, set `review: { status: 'reviewed', reviewer: 'Sandeep Maddheshiya', date: 'YYYY-MM-DD' }`, bump `version`, add a changelog entry and update `contentUpdated`.
7. **Translation (Phase 4):** machine draft → fluent human review → localise examples, currency and rules → add the locale to `locales`. A page doesn't exist in a locale until this step is done.

## Owner review checklist (per page)

- [ ] Open every source link: does it still say what we cite?
- [ ] Recompute one worked example by hand or in a spreadsheet.
- [ ] Try a few edge inputs (0, huge values, negatives where allowed): are the messages sensible?
- [ ] Read the summary and FAQ aloud: anything vague, generic or wrong?
- [ ] YMYL: is the disclaimer next to the result, and are the population and limit caveats present?
- [ ] Regional pages: is the tax year or rule date correct and visible?

## Scheduled re-review

- Every calculator: at least every 12 months from `review.date`. CI will warn when a page is within 30 days of that date (Phase 3).
- Tax- or rate-dependent calculators: re-check each **January**, plus the UK in **April** (new tax year) and India after the **February budget**.
- Data files (CPI and others): update when the publisher releases new data.

## Error reports and corrections

1. Reports arrive through the contact route (and, in Phase 3, the on-page feedback widget).
2. Triage within 7 days: reproduce using the shared link, which carries the inputs.
3. If confirmed: fix, add a regression test with the reported case, bump the version, add a changelog entry, and note significant corrections on the page.
4. If not confirmed: reply with the working and the source.
