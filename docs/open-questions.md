# Open questions

Questions marked **Owner** need your answer. Questions marked **Build** are resolved during implementation and logged in decisions.md.

## Answered (2026-11-23)

| #   | Question           | Answer                                                                      |
| --- | ------------------ | --------------------------------------------------------------------------- |
| Q1  | Domain and host    | `northcalculator.com` on **Cloudflare Pages** (ADR-010)                     |
| Q2  | Entity and contact | Operator contact via **sandeepmaddheshiya.me**                              |
| Q3  | Reviewers          | The owner reviews every page personally, after deploy, one by one (ADR-011) |
| Q4  | Keyword tools      | None. Use live SERP evidence (ADR-012)                                      |
| Q5  | Currency coverage  | All currencies (ADR-007)                                                    |
| Q6  | Analytics          | None for now (ADR-013)                                                      |
| Q7  | Vector logo        | None exists, so redraw it as SVG (ADR-009)                                  |

## Open

| #   | Question                                                                                                                                                                                                                                           | Who   | Blocks        |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ------------- |
| Q2a | The About and author pages name the operator as "Sandeep Maddheshiya" (inferred from the domain you gave). Please confirm the name, preferred credentials line, and a public contact email (or whether a link to sandeepmaddheshiya.me is enough). | Owner | Launch        |
| Q8  | The GPA scale differs by institution. Should we ship US 4.0 (unweighted plus weighted) with an editable scale, and the CBSE ×9.5 CGPA conversion as a separate page?                                                                               | Build | GPA           |
| Q9  | Business-days holidays: is a weekends-only version plus user-entered holidays acceptable for Wave 1, with a per-country holiday dataset in Wave 2?                                                                                                 | Build | Business days |
| Q10 | Shoe size: there's no single international standard, so ship it with an "approximate" label or defer it? Clothing sizes are already deferred.                                                                                                      | Build | Conversion    |
| Q11 | Indian and UK tax figures must be re-verified against the Finance Act / HMRC for the current tax year at build time. Re-review every April (UK) and February budget (India).                                                                       | Build | Regional tax  |
| Q12 | Ovulation calculator: the luteal phase assumption (14 days) varies between individuals. The UI will state this. Confirm during your review.                                                                                                        | Build | Ovulation     |
| Q13 | Competitor CWV, JSON-LD and ad density still need a real-browser measurement (PSI/CrUX).                                                                                                                                                           | Build | —             |
