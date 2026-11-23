import { Link } from '@/i18n/navigation';
import { SITE } from '@/lib/site';

export default function EditorialPolicy() {
  return (
    <>
      <h2>What every page must contain</h2>
      <p>
        A calculator page is published only with: the working calculator, a short direct answer to
        what it computes, the formula with every variable defined, at least two worked examples with
        real numbers, practical guidance including when not to use it, questions people actually
        ask, and cited sources.
      </p>
      <h2>Writing standards</h2>
      <ul>
        <li>Plain, precise language. Specific numbers instead of vague adjectives.</li>
        <li>No filler, no keyword stuffing, and no copy reused across calculators.</li>
        <li>Health pages state who a formula was validated on and who it does not suit.</li>
        <li>
          Finance pages state what is excluded (fees, taxes, rate changes) and never recommend
          specific products.
        </li>
      </ul>
      <h2>Use of AI tools</h2>
      <p>
        AI tools may help draft explanatory text. Every fact in a draft is checked against the cited
        source by a person, generic wording is rewritten, and the reviewer is credited on the page.
        Calculations are never produced by AI: they come from deterministic, tested code.
      </p>
      <h2>Independence</h2>
      <p>
        NorthCalculator has no advertisers or affiliate partners today. If advertising is added in
        future it will be clearly labelled, it will never appear above or inside a calculator, and
        it will never influence results or content.
      </p>
      <h2>Corrections</h2>
      <p>
        If you find an error, please report it through the <Link href="/contact">contact page</Link>
        . Confirmed errors are fixed promptly, the calculator’s version number is increased, and the
        change is recorded in its changelog with the date. Significant corrections are noted on the
        page itself.
      </p>
      <h2>Responsibility</h2>
      <p>
        Content is the responsibility of the operator,{' '}
        <a href={SITE.operator.url} rel="author">
          {SITE.operator.name}
        </a>
        .
      </p>
    </>
  );
}
