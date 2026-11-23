import { Link } from '@/i18n/navigation';
export default function Privacy() {
  return (
    <>
      <p>
        <strong>Short version:</strong> what you type into a calculator stays in your browser. We do
        not run analytics, we do not set tracking cookies, and we do not sell or share personal
        data.
      </p>
      <h2>Calculator inputs</h2>
      <p>
        All calculations run on your device. The numbers you enter, including salary, loan or health
        figures, are not sent to our servers or to anyone else.
      </p>
      <h2>Information stored on your device</h2>
      <p>
        Some things are kept in your browser’s local storage so the site can remember them. None of
        it is sent to us, and you can clear it at any time in your browser settings:
      </p>
      <ul>
        <li>your color theme;</li>
        <li>
          recent calculations, so you can reopen them from the History list on each calculator.
          Calculators that use personal figures, such as BMI, never keep history automatically;
        </li>
        <li>results you choose to save with the Save button.</li>
      </ul>
      <p>
        To work offline, the site also keeps copies of pages you have visited in your browser’s
        cache. These are the same public pages anyone can load and contain none of your inputs.
      </p>
      <h2>Shared links</h2>
      <p>
        When you copy a calculator link, the inputs are written into the address so the link reopens
        the same result. Anyone you send that link to can see those inputs, so only share links with
        values you are happy to share.
      </p>
      <h2>Exchange rates</h2>
      <p>
        The currency converter downloads published reference exchange rates from a public rate
        provider (ExchangeRate-API, or a backup copy of daily rates on the jsDelivr network if that
        is unavailable). The request contains no information about what you are converting.
      </p>
      <h2>Hosting and server logs</h2>
      <p>
        The site is served by Cloudflare. Like any web host, Cloudflare processes technical data
        such as IP addresses to deliver pages and protect the site from abuse, under its own privacy
        policy. We do not use those logs to profile visitors.
      </p>
      <h2>Your rights</h2>
      <p>
        Because we do not collect personal data through the site, there is normally nothing for us
        to access, correct or delete. If you contact us, we use your message only to reply and
        delete it when it is no longer needed. You can ask about this at any time through the{' '}
        <Link href="/contact">contact page</Link>.
      </p>
      <h2>Changes</h2>
      <p>
        If this policy changes, the date at the top of this page will change and material changes
        will be described here.
      </p>
    </>
  );
}
