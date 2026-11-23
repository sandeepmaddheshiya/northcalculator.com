export default function Methodology() {
  return (
    <>
      <p>
        This page explains how every NorthCalculator calculator is specified, tested and kept up to
        date. It applies to all calculators unless a calculator’s own page says otherwise.
      </p>
      <h2>1. Formulas come from primary sources</h2>
      <p>
        Each calculator lists its sources at the bottom of the page: standards bodies (such as NIST
        and the BIPM for units), government agencies (such as the CFPB, HMRC or the Income Tax
        Department of India), central banks, peer-reviewed studies (for example the Mifflin-St Jeor
        equation for resting energy) and established textbooks. Each source carries the date it was
        last checked. Where reputable sources disagree, the page shows the alternatives and explains
        the difference instead of picking one silently.
      </p>
      <h2>2. Every calculation is tested against known answers</h2>
      <p>
        The code that produces a result is a pure function: the same inputs always give the same
        outputs. Each one has at least ten automated tests covering typical values, boundaries,
        zero, negative and very large inputs, invalid input and different number formats. At least
        two tests reproduce reference values published by an independent authoritative source. The
        worked examples you read on a page are also tests, so the text and the calculator can never
        disagree.
      </p>
      <h2>3. Numbers are handled carefully</h2>
      <ul>
        <li>
          Money is calculated with decimal arithmetic, not binary floating point, so amounts like
          0.1 + 0.2 come out exactly.
        </li>
        <li>
          Each calculator documents its rounding policy. Intermediate values are kept at full
          precision and rounded only for display.
        </li>
        <li>
          Dates are calculated on calendar days, so time zones and daylight-saving changes cannot
          shift a result.
        </li>
        <li>Unit conversions use exact defined factors (for example, 1 inch = 25.4 mm exactly).</li>
      </ul>
      <h2>4. Review status is stated honestly</h2>
      <p>
        A page marked “Reviewed” has been checked by a named person on the date shown. A page marked
        “Review pending” has passed its automated tests against the cited sources but has not yet
        had its editorial review. We never show a review date that did not happen.
      </p>
      <h2>5. Time-sensitive calculators are re-checked</h2>
      <p>
        Calculators that depend on tax years, rates or published data state the period they apply to
        next to the result. They are re-checked when the underlying rules change, and every
        calculator is re-reviewed at least every twelve months.
      </p>
      <h2>6. Limits</h2>
      <p>
        Calculators give educational estimates based on the inputs and assumptions shown. They are
        not financial, medical, tax or legal advice, and they cannot account for circumstances they
        do not ask about.
      </p>
    </>
  );
}
