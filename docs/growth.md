# Growth plan

NorthCalculator grows by being the page people link to and cite because it is correct and shows its working. No link schemes, no doorway pages, no mass-produced content (BRIEF §9).

## 1. Embeds (live)

Every calculator has an embeddable version at `/embed/{locale}/{id}`, with an iframe snippet under "Sources and methodology" on its page. Embeds carry no tracking or cookies, link back to the full page, and are `noindex` with a canonical to the main URL, so they build authority without creating duplicate pages.

Outreach targets: personal-finance bloggers (mortgage, loan, compound interest), teachers and school sites (fractions, average, GPA, scientific), fitness coaches (BMI), and small business sites (sales tax, discount). Offer the embed, not a link request.

## 2. Educator resources

The worked examples are verified against OpenStax textbooks, which teachers already use. Next steps:

- A page per subject listing calculators that match OpenStax chapters (Prealgebra 2e, Contemporary Mathematics, Introductory Statistics 2e), with the example numbers.
- Report the textbook errata we found (ADR-022, open question Q14) to OpenStax, crediting the site. This is a genuine contribution, not outreach.

## 3. Open datasets

Publish the data behind calculators as versioned, citable files: the unit conversion factor table (NIST-sourced, exactness flagged), the BMI category table with sources, and later the tax-rate tables for regional calculators. Each dataset gets a page, a licence (CC BY 4.0), and a changelog.

## 4. Original research

Questions our tools can answer with public data, written up with the method and data published:

- How much does a typical bank's exchange-rate markup cost travellers? (currency converter markup feature, using published card-network and bank rates)
- How much do extra mortgage payments save across today's rates and terms?
- Which countries' VAT/GST rates changed this year? (once regional tax pages exist)

## 5. Digital PR

Pitch the research pieces to personal-finance and consumer journalists, with the calculator as the interactive companion. Never buy links or exchange links.

## 6. AI assistants

`/llms.txt` and `/llms-full.txt` list every calculator with its summary and sources. Pages state formulas in plain text and the answer first, which is what assistants quote. Keep them current: they are generated from the registry at build time.

## 7. Measuring

Analytics are off by decision (ADR-013). Use Search Console (queries, pages, links) and Bing Webmaster Tools. If more is needed later, Cloudflare Web Analytics is cookieless and needs no consent banner.
