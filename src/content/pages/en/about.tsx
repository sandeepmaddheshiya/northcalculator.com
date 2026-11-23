import { Link } from '@/i18n/navigation';
import { SITE } from '@/lib/site';

export default function About() {
  return (
    <>
      <p>
        NorthCalculator is a free collection of calculators for money, health, math, dates and
        units. Each one is built to answer a specific question correctly, then show you how it got
        there: the formula, the steps worked through with your own numbers, and the published source
        that the formula comes from.
      </p>
      <h2>Why it exists</h2>
      <p>
        Most calculator sites give you a number and nothing else. When the number decides something
        real, such as a loan you can afford or a dose of exercise your heart can take, you deserve
        to see the working and judge it for yourself. NorthCalculator is designed around that idea.
        The calculator comes first on every page, results update as you type, and the explanation
        sits right underneath.
      </p>
      <h2>Who runs it</h2>
      <p>
        NorthCalculator is built and operated by{' '}
        <a href={SITE.operator.url} rel="author">
          {SITE.operator.name}
        </a>
        , who writes the code, checks each formula against its source and reviews every page before
        marking it as reviewed. Pages that have not been reviewed yet say so plainly.
      </p>
      <h2>What we promise</h2>
      <ul>
        <li>Calculations run in your browser. Your inputs are never sent to us.</li>
        <li>No account, no pop-ups and no tracking cookies.</li>
        <li>
          Every formula cites a primary or authoritative source, with the date it was checked.
        </li>
        <li>Mistakes are corrected openly. Each calculator has a version history.</li>
      </ul>
      <p>
        Read the <Link href="/methodology">methodology</Link> for how calculators are built and
        tested, and the <Link href="/editorial-policy">editorial policy</Link> for how pages are
        written and corrected.
      </p>
    </>
  );
}
