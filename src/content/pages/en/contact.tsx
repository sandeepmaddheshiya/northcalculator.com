import { Link } from '@/i18n/navigation';
import { SITE } from '@/lib/site';

export default function Contact() {
  return (
    <>
      <p>
        NorthCalculator is run by {SITE.operator.name}. The best way to get in touch is through the
        contact details on{' '}
        <a href={SITE.operator.url} rel="author">
          {SITE.operator.url.replace('https://', '')}
        </a>
        .
      </p>
      <h2>Reporting an error</h2>
      <p>If a result looks wrong, please include:</p>
      <ul>
        <li>the calculator’s address (copy the link from the page, which includes your inputs),</li>
        <li>the result you expected, and where that expected value comes from.</li>
      </ul>
      <p>
        Confirmed errors are fixed and recorded in the calculator’s changelog, as described in the{' '}
        <Link href="/editorial-policy">editorial policy</Link>.
      </p>
      <h2>Suggesting a calculator</h2>
      <p>
        Tell us what you are trying to work out and, if you know it, the official source of the
        formula or rule.
      </p>
    </>
  );
}
