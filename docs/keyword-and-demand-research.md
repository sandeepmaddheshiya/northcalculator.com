# Keyword and demand research

Researched 2026-11-23. **Caveat:** we don't have direct access to Google Keyword Planner, Ahrefs or Semrush in this session. The volumes below come from public third-party snapshots and are labelled with their source. Treat them as an ordering signal, not exact figures. Before Phase 3 we should re-pull exact volumes per country with a paid tool or Keyword Planner (see open-questions Q4).

## 1. Hard data points found

| Keyword / page                             | Market | Figure                                                        | Source                                    |
| ------------------------------------------ | ------ | ------------------------------------------------------------- | ----------------------------------------- |
| "calculator"                               | US     | 16.5M searches/mo                                             | AhrefsTop, calculator.net, Nov 2026       |
| "bmi calculator"                           | US     | ~2.24M searches/mo                                            | Semrush calculator.net overview, Oct 2025 |
| "loan calculator"                          | US     | 616K searches/mo                                              | AhrefsTop, Nov 2026                       |
| "grade calculator"                         | US     | 448K searches/mo                                              | AhrefsTop, Nov 2026                       |
| "dice roller"                              | US     | 392K searches/mo                                              | AhrefsTop, Nov 2026                       |
| "time calculator"                          | US     | 335K searches/mo                                              | AhrefsTop, Nov 2026                       |
| "how much home can I afford"               | US     | 246K searches/mo                                              | The Financial Brand (undated)             |
| "mortgage payment calculator"              | US     | 201K searches/mo                                              | The Financial Brand (undated)             |
| Groww SIP calculator                       | India  | 3.5M organic visits/mo                                        | Ahrefs blog, Dec 2024                     |
| percentagecalculator.net                   | US     | 1.6M organic visits/mo                                        | Ahrefs blog, Dec 2024                     |
| Bankrate mortgage calculator               | US     | 1.4M organic visits/mo                                        | Ahrefs blog, Dec 2024                     |
| SmartAsset paycheck calculator             | US     | 690K organic visits/mo                                        | Ahrefs blog, Dec 2024                     |
| Mayo Clinic calorie calculator             | US     | 456K organic visits/mo                                        | Ahrefs blog, Dec 2024                     |
| Pregnancy due date (americanpregnancy.org) | US     | 427K organic visits/mo                                        | Ahrefs blog, Dec 2024                     |
| WebMD ovulation calculator                 | US     | 373K organic visits/mo                                        | Ahrefs blog, Dec 2024                     |
| NerdWallet compound interest               | US     | 289K organic visits/mo                                        | Ahrefs blog, Dec 2024                     |
| calculator.net traffic by country          | Global | US 41.9%, India 27.3%, UK 3.8%, Canada 3.6%, Philippines 3.3% | AhrefsTop, Nov 2026                       |

## 2. What this tells us

1. **The US and India are the two big markets for an English calculator site.** India is about 27% of the leader's traffic, served with US defaults. Our `en` locale must handle Indian users properly from launch: optional `en-IN` formatting (lakh/crore), ₹, and India-specific calculators (EMI, SIP, GST, FD, PPF, income tax).
2. **Head terms are finance, health and "everyday utility"** (loan, mortgage, BMI, calorie, grade, time, percentage, dice). These belong in Wave 1.
3. **Tool-like long-tail pages win:** "dice roller" and "time calculator" rank surprisingly high. Cheap, fast utilities belong in Wave 1 too.
4. **Health tools have big demand but strong incumbents** (Mayo, WebMD). We need clinical reviewers to compete on YMYL.
5. **Programmatic variants (such as SmartAsset's per-state paycheck pages) work only when each page has genuinely different data.** For per-state or per-country tax tools, every page must be driven by that jurisdiction's rules, in line with our scaled-content policy.

## 3. Demand by region (qualitative, to quantify in Phase 3)

| Region / locale                                  | Priority calculators                                                                                                                                                                        | Notes                                                                                         |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| United States (`en`)                             | Mortgage, loan, auto loan, paycheck/take-home (by state, Wave 3), BMI, calorie/TDEE, grade/GPA, time, age, percentage, compound interest, 401(k)/retirement, due date, ovulation, sales tax | Mortgages are 30-yr fixed and compound monthly. PMI rules under the HPA                       |
| India (`en` with IN formatting; `hi` in Phase 4) | EMI (home, car, personal), SIP, lump sum, FD, RD, PPF, GST, income tax (old vs new regime), HRA, gratuity, CGPA→percentage (CBSE)                                                           | Lakh/crore grouping, ₹. Tax year is "FY 2026-27 / AY 2027-28", and the label must be explicit |
| United Kingdom (`en`)                            | Take-home pay, stamp duty (SDLT), mortgage (repayment vs interest-only), VAT, student loan repayment, pension, UCAS points, pro-rata salary                                                 | HMRC rates change each April. Scotland (LBTT) and Wales (LTT) are separate                    |
| Canada (`en`, `fr` later)                        | Mortgage (semi-annual compounding under the Interest Act), CMHC insurance, take-home by province, GST/HST                                                                                   | Must not reuse US mortgage maths unmodified                                                   |
| Australia                                        | Mortgage/repayments, stamp duty by state, take-home pay, GST 10%, super                                                                                                                     |                                                                                               |
| Philippines                                      | Loan, salary/13th month, BMI, percentage                                                                                                                                                    | English-speaking, high mobile share                                                           |
| Spanish (`es`, Phase 4)                          | Hipoteca, préstamo, IMC, porcentaje, IVA, edad                                                                                                                                              | Spain vs LatAm differences (IVA rates, currency)                                              |
| Hindi (`hi`)                                     | EMI, SIP, ब्याज (interest), प्रतिशत (percentage), age                                                                                                                                         | Mostly Devanagari queries with some Hinglish                                                  |

## 4. Next steps

- Pull exact volumes for the Wave 1 list in the US, IN, UK, CA, AU, PH and ES markets.
- Get Search Console data after launch, then iterate based on real impressions.
- Use Google Trends to check seasonality (tax calculators peak Jan–Apr in the US and UK, and Jul in India for ITR filing).
