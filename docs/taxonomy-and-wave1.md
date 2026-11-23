# Taxonomy and Wave 1 calculator list

Status: **proposal for approval** (Phase 0, 2026-11-23).

Every source listed here gets re-verified (URL, edition, access date) when its calculator is built, and is stored in that calculator's `definition.ts` `sources[]`. Anything uncertain is flagged ⚑ and tracked in `open-questions.md`.

## 1. URL and taxonomy rules

- URL pattern: `/{locale}/{category}/{slug}`, e.g. `/en/finance/mortgage-calculator`, `/es/finanzas/calculadora-de-hipoteca`.
- Slugs include the word "calculator" or "converter", because that is how people search. Categories stay short.
- Each calculator has exactly **one** category (its canonical home). Cross-listing happens through tags and "related", never through duplicate URLs.
- Category depth is 1 level. Subcategories exist only as on-page groupings on the hub, not as URL segments. This keeps URLs stable as we grow.

| Category slug (en)       | Name                     | Wave                                |
| ------------------------ | ------------------------ | ----------------------------------- |
| `math`                   | Math                     | 1                                   |
| `finance`                | Finance                  | 1                                   |
| `health`                 | Health & Fitness         | 1                                   |
| `date-time`              | Date & Time              | 1                                   |
| `conversion`             | Unit Conversion          | 1                                   |
| `education`              | Education                | 1                                   |
| `everyday`               | Everyday Life            | 1 (tip, discount, dice and similar) |
| `statistics`             | Statistics & Probability | 2                                   |
| `geometry`               | Geometry                 | 2                                   |
| `physics`                | Physics                  | 2                                   |
| `chemistry`              | Chemistry                | 2                                   |
| `electronics`            | Electrical & Electronics | 2                                   |
| `construction`           | Construction & Home      | 2                                   |
| `business`               | Business & Tax           | 2                                   |
| `engineering`, `science` | Long-tail                | 3                                   |

Regional calculators (India income tax, UK SDLT and similar) live in their natural category, with a `regions: ['IN']` field. They are promoted on the homepage for visitors in that region and are clearly labelled with the jurisdiction and tax year.

## 2. Phase 2 flagship 10 (the template for everything else)

| #   | Calculator                                                                              | Key primary sources                                                                                                                                                                                             |
| --- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Percentage (all variants: X% of Y, X is what % of Y, % change, % difference, reverse %) | Arithmetic definitions; NIST Guide to the SI (SP 811) §7.10.2 on the % symbol                                                                                                                                   |
| 2   | Mortgage (taxes, insurance, PMI, HOA, extra payments, amortization table and chart)     | Standard annuity formula (any finance text, e.g. Brealey/Myers/Allen); CFPB on PMI and the Homeowners Protection Act 78%/80% LTV rules; Canada Interest Act s.6 semi-annual compounding (`en-CA` variant later) |
| 3   | Loan / EMI                                                                              | Same annuity formula; RBI material on EMI and floating-rate resets (for the India explanation)                                                                                                                  |
| 4   | Compound interest                                                                       | SEC Investor.gov compound interest formula and calculator; continuous compounding from standard texts                                                                                                           |
| 5   | BMI                                                                                     | WHO BMI classification; CDC Adult BMI; WHO Expert Consultation, _Lancet_ 2004;363:157-63 (Asian cut-offs); CDC BMI-for-age growth charts for 2–19 yrs ⚑                                                         |
| 6   | Age                                                                                     | ISO 8601; Gregorian calendar leap-year rules; the date-only (time zone-free) arithmetic policy in ADR                                                                                                           |
| 7   | Unit converter (length, mass, volume, temperature, area, speed, …)                      | NIST SP 811 Appendix B; NIST Handbook 44 Appendix C; BIPM SI Brochure (9th ed., 2019); 1959 international yard and pound agreement (exact factors)                                                              |
| 8   | Scientific calculator                                                                   | IEEE 754 double semantics (documented limits); mathjs (lazy) or a custom shunting-yard parser, with no `eval`                                                                                                   |
| 9   | GPA (US 4.0 scale, weighted/unweighted)                                                 | Varies by institution ⚑. We publish the scale used and let users edit it                                                                                                                                        |
| 10  | Currency converter                                                                      | ECB euro foreign exchange reference rates (daily, free, attributable) ⚑ on the provider choice and "live" wording                                                                                               |

## 3. Full Wave 1 list (~90)

`S` = standard, `Y` = YMYL (needs a named expert reviewer before it is indexed), `R` = regional.

### Math (17)

| Calculator                                          | Type | Source                                                                                                     |
| --------------------------------------------------- | ---- | ---------------------------------------------------------------------------------------------------------- |
| Percentage (flagship, multi-mode)                   | S    | Definitions                                                                                                |
| Percentage change                                   | S    | Definitions (shares the engine with the flagship but has its own page, its own intent and its own content) |
| Percentage difference                               | S    | Definitions; we note it's symmetric vs % change                                                            |
| Fraction (add/sub/mul/div, simplify, mixed numbers) | S    | Euclid's algorithm (GCD)                                                                                   |
| Ratio (simplify, scale, solve)                      | S    | Definitions                                                                                                |
| Average: mean / median / mode / range               | S    | NIST/SEMATECH e-Handbook of Statistical Methods §1.3.5                                                     |
| Rounding (half-up, half-even, significant figures)  | S    | IEEE 754 rounding modes; NIST SP 811 §7.9 / Appendix B.7                                                   |
| Exponent / power                                    | S    | Definitions                                                                                                |
| Square root and nth root                            | S    | Definitions                                                                                                |
| LCM and GCF                                         | S    | Euclid's algorithm                                                                                         |
| Prime factorization                                 | S    | Trial division with limits documented                                                                      |
| Scientific calculator (flagship)                    | S    | See above                                                                                                  |
| Scientific notation / standard form                 | S    | NIST SP 811 §7.9                                                                                           |
| Random number generator                             | S    | `crypto.getRandomValues`; we document uniformity (rejection sampling)                                      |
| Logarithm                                           | S    | Definitions                                                                                                |
| Big-number / basic calculator                       | S    | decimal.js precision documented                                                                            |
| Dice roller                                         | S    | `crypto.getRandomValues` (dice roller is a 392K/mo US query, from Ahrefs)                                  |

### Finance (24)

| Calculator                                                      | Type    | Source                                                                                      |
| --------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------- |
| Mortgage (flagship)                                             | Y       | See flagship                                                                                |
| Mortgage affordability ("how much house can I afford")          | Y       | CFPB guidance on DTI; 28/36 rule labelled as a rule of thumb                                |
| Loan / EMI (flagship)                                           | Y       | Annuity formula                                                                             |
| Auto loan (with trade-in and sales tax)                         | Y       | Annuity formula; CFPB auto loan resources                                                   |
| Amortization schedule                                           | Y       | Annuity formula                                                                             |
| Compound interest (flagship)                                    | Y       | SEC Investor.gov                                                                            |
| Simple interest                                                 | S       | Definitions                                                                                 |
| Savings goal                                                    | Y       | Future value of an annuity                                                                  |
| Investment / SIP                                                | Y R(IN) | FV of an annuity due; AMFI investor education                                               |
| Lump sum investment                                             | Y       | FV formula                                                                                  |
| Retirement savings                                              | Y       | FV/PV of annuities; assumptions shown explicitly ⚑ (no tax-specific 401(k) rules in Wave 1) |
| Inflation (historical, US CPI)                                  | S       | BLS CPI-U series (data file versioned in repo)                                              |
| ROI and annualized ROI                                          | S       | Definitions; CFA Institute curriculum                                                       |
| CAGR                                                            | S       | Definitions                                                                                 |
| Credit card payoff                                              | Y       | CFPB; CARD Act minimum-payment disclosure context                                           |
| Debt payoff (snowball vs avalanche)                             | Y       | Algorithm documented; CFPB debt resources                                                   |
| Currency converter (flagship)                                   | S       | ECB reference rates                                                                         |
| Tip                                                             | S       | Definitions                                                                                 |
| Sales tax / VAT / GST (generic, rate entered or chosen)         | S       | HMRC VAT rates; CBIC GST rate schedules; we don't ship a US per-ZIP database in Wave 1 ⚑    |
| Discount                                                        | S       | Definitions                                                                                 |
| Margin and markup                                               | S       | Definitions                                                                                 |
| Break-even                                                      | S       | Standard managerial accounting                                                              |
| Hourly ↔ salary                                                 | S       | Definitions; hours per year assumptions are editable                                        |
| Take-home pay: **India** (old vs new regime, FY stated)         | Y R(IN) | Income Tax Department of India; Finance Act for the year ⚑                                  |
| Take-home pay: **UK** (England/NI vs Scotland, tax year stated) | Y R(UK) | HMRC "Rates and thresholds for employers" ⚑                                                 |

_US take-home (federal plus 50 states) moves to Wave 3. It needs state-by-state tax data and review, and a federal-only version would mislead users._

### Health & Fitness (14), all YMYL

| Calculator                 | Source                                                                                                                                                  |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BMI (flagship)             | WHO; CDC; WHO/Lancet 2004 Asian cut-offs                                                                                                                |
| BMR                        | Mifflin-St Jeor et al., _Am J Clin Nutr_ 1990;51(2):241-7; Harris-Benedict revised by Roza & Shizgal, _Am J Clin Nutr_ 1984;40(1):168-82; Katch-McArdle |
| Calorie / TDEE             | BMR × activity factor; FAO/WHO/UNU _Human energy requirements_ (2004) PAL ranges                                                                        |
| Macro                      | Institute of Medicine DRI (2005) AMDRs                                                                                                                  |
| Body fat (US Navy method)  | Hodgdon & Beckett, Naval Health Research Center reports 84-11 and 84-29 (1984)                                                                          |
| Ideal body weight          | Devine (1974), Robinson (1983), Miller (1983), Hamwi (1964); we show all four and their limits                                                          |
| Water intake               | National Academies, _DRI for Water, Potassium, Sodium, Chloride, and Sulfate_ (2004/2005)                                                               |
| Pregnancy due date         | ACOG Committee Opinion 700, "Methods for Estimating the Due Date" (2017); Naegele's rule                                                                |
| Conception date            | Same as due date                                                                                                                                        |
| Ovulation / fertile window | ACOG patient resources; Wilcox et al., _NEJM_ 1995;333:1517-21 (fertile window) ⚑                                                                       |
| Running pace               | Definitions                                                                                                                                             |
| One-rep max                | Epley (1985); Brzycki, _JOPERD_ 1993                                                                                                                    |
| Heart-rate zones           | Tanaka, Monahan & Seals, _JACC_ 2001;37(1):153-6 (HRmax = 208 − 0.7·age); Karvonen (1957) HR reserve                                                    |
| Calories burned (MET)      | Ainsworth et al., _Compendium of Physical Activities_ (2011 / 2024 update)                                                                              |

### Date & Time (10)

| Calculator                                     | Source                                                                                      |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Age (flagship)                                 | ISO 8601                                                                                    |
| Date difference (days between dates)           | ISO 8601                                                                                    |
| Add / subtract days to a date                  | ISO 8601                                                                                    |
| Days until (countdown to a date)               | ISO 8601                                                                                    |
| Business days (weekends; holidays per country) | Weekend rules per country; holiday data ⚑ (Wave 1: weekend-only plus user-entered holidays) |
| Time duration (between two times)              | Definitions                                                                                 |
| Time calculator (add/subtract h:m:s)           | Definitions (335K/mo US query)                                                              |
| Hours / time card                              | Definitions                                                                                 |
| Week number                                    | ISO 8601 week date; US week numbering as an option                                          |
| Time zone converter                            | IANA Time Zone Database via `Intl`                                                          |

### Unit Conversion (16 pages, one shared engine)

Length, mass/weight, volume, temperature, area, speed, pressure, energy, power, data size (SI vs IEC binary prefixes, IEC 80000-13), time, fuel economy (mpg US/UK ↔ L/100 km), cooking (volume ↔ weight per ingredient ⚑ density source: USDA FoodData Central), angle, frequency, shoe size ⚑ (no single international standard exists; ISO 9407 Mondopoint plus documented brand-agnostic tables, and clearly labelled as approximate).

_Clothing sizes are deferred because there is no authoritative standard, so the risk of being wrong is high._

### Education (6)

| Calculator                                            | Source                                                   |
| ----------------------------------------------------- | -------------------------------------------------------- |
| GPA (flagship)                                        | Institution scales ⚑                                     |
| Grade / weighted grade                                | Definitions (448K/mo US query)                           |
| Final grade needed                                    | Definitions                                              |
| CGPA → percentage (CBSE ×9.5 and university-specific) | CBSE circular on the conversion factor ⚑                 |
| Percentage → GPA (US 4.0 approximation)               | Clearly labelled as an approximation; WES-style tables ⚑ |
| Test score / percentage grade                         | Definitions                                              |

### Everyday (4)

Tip (finance cross-linked), unit price comparison, fuel cost for a trip, split bill. The dice roller lives in Math.

**Total ≈ 91 pages.**

## 4. Build order inside Wave 1 (after the flagship 10)

1. Same-engine siblings first (percentage change and difference, loan variants, converters, date tools). These are cheap because the engine is shared, but each one still needs unique content.
2. Health tools, gated by reviewer availability.
3. Regional tax tools last, because each needs a jurisdiction-specific review.
