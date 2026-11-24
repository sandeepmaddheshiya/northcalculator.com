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
| Q9  | Business-days holidays: is a weekends-only version plus user-entered holidays acceptable for Wave 1, with a per-country holiday dataset in Wave 2?                                                                                                 | Build | Business days |
| Q10 | Shoe size: there's no single international standard, so ship it with an "approximate" label or defer it? Clothing sizes are already deferred.                                                                                                      | Build | Conversion    |
| Q11 | Indian and UK tax figures must be re-verified against the Finance Act / HMRC for the current tax year at build time. Re-review every April (UK) and February budget (India).                                                                       | Build | Regional tax  |
| Q12 | Ovulation calculator: the luteal phase assumption (14 days) varies between individuals. The UI will state this. Confirm during your review.                                                                                                        | Build | Ovulation     |
| Q13 | Competitor CWV, JSON-LD and ad density still need a real-browser measurement (PSI/CrUX).                                                                                                                                                           | Build | —             |

## Resolved during Phase 2 (2026-11-24)

- **Q8 (GPA scale):** shipped the US 4.0 scale (UC Berkeley registrar) with editable honors/AP bonuses. See ADR-023.

## New (Phase 2)

| #   | Question                                                                                                                                                                                                                                                                                                         | Who            | Blocks     |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ---------- |
| Q14 | Several OpenStax worked examples print values that differ from the exact result (ADR-022). Do you want us to report these errata to OpenStax?                                                                                                                                                                    | Owner          | —          |
| Q15 | The BMI page cites WHO Technical Report Series 894 for obesity classes I–III (30/35/40). The report's existence is verified (PMID 11234459), but the table locator should be checked against the PDF during your review.                                                                                         | Owner (review) | BMI review |
| Q16 | CDC pages block automated fetching (HTTP 403), so CDC is not cited on the BMI page and its wording was not checked. Add a CDC citation during review if you want a US government source.                                                                                                                         | Owner (review) | —          |
| Q17 | Legal treatment of 29 February birthdays varies by country. The age calculator offers both conventions without citing a jurisdiction. Should regional pages cite specific laws later?                                                                                                                            | Owner          | —          |
| Q18 | Body fat (US Navy method): DoDI 1308.03 and the Navy PRP guide return 403 to automated fetches, so the Hodgdon–Beckett coefficients couldn't be verified from a primary source. The calculator is on hold until someone can supply the document (or a fetchable official copy).                                  | Owner          | Body fat   |
| Q19 | Ideal body weight and Harris–Benedict: the PubMed abstracts (Pai & Paloucek 2000; Roza & Shizgal 1984) don't print the equations, and the full texts are paywalled. Need a citable copy of the Devine/Robinson/Miller/Hamwi and revised Harris–Benedict coefficients before building them.                       | Owner          | IBW, BMR   |
| Q20 | Pregnancy due date: ACOG Committee Opinion 700 is paywalled (HTTP 402), NICHD's page is gone (404), and the NHS and MedlinePlus pages don't state the 280-day rule. Need a citable source for EDD = LMP + 280 days (and cycle-length adjustment) before building due date, conception and ovulation calculators. | Owner          | Due date   |
| Q21 | One-rep max: the only open-access source found (PMC11435939, Table 1) prints Epley as (1 + 0.333 × reps), a misprint of 1/30 ≈ 0.0333. Brzycki 1993 (JOPERD) is paywalled. Need the original Epley/Brzycki coefficients from a reliable copy. Karvonen (heart rate reserve) likewise needs a citable source.     | Owner          | 1RM, HRR   |
