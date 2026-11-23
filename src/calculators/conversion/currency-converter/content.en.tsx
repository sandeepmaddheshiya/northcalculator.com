import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';
import { CODES } from './definition';

const names = new Intl.DisplayNames(['en'], { type: 'currency' });
const o = (r: { outputs: Record<string, unknown> }, k: string) => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Currency Converter',
  promise: 'Convert 160 currencies at daily reference rates and check your bank’s markup.',
  title: 'Currency Converter: Exchange Rates and Bank Markup Check',
  description:
    'Convert between 160 world currencies at daily reference exchange rates, see the inverse rate, and check how much your bank or money transfer service marks up.',
  summary:
    'To convert currency, multiply the amount by the exchange rate: units of the target currency per one unit of the source. Rates here are daily reference rates, the mid-market value without any spread. Banks, card networks and transfer services quote a worse rate and keep the difference. Enter their quote as a custom rate to see the markup you pay against the reference.',
  synonyms: [
    'exchange rate calculator',
    'money converter',
    'forex converter',
    'USD to EUR',
    'USD to INR',
    'GBP to USD',
    'EUR to USD',
    'currency calculator',
  ],
  ui: {
    amount: 'Amount',
    from: 'From',
    to: 'To',
    mode: 'Rate',
    'mode.ref': 'Reference rate',
    'mode.custom': 'My provider’s rate',
    rate: 'Your rate (units of the “To” currency for 1 unit of the “From” currency)',
    'rate.help':
      'Copy the rate your bank, card or transfer service quotes for this pair, for example 0.88 EUR per 1 USD.',
    ...Object.fromEntries(CODES.map((c) => [`cur.${c}`, `${c} · ${names.of(c) ?? c}`])),
    'out.result': 'Converted amount',
    'out.rate': 'Rate',
    'out.inverse': 'Inverse rate',
    'out.refResult': 'At the reference rate you would get',
    'out.markup': 'Markup against the reference rate',
    'out.asOf': 'Rates as of',
    asOf: '{date} UTC, {source}',
    'source.er-api': 'ExchangeRate-API daily reference rates',
    'source.fawazahmed0': 'currency-api daily rates (backup source)',
    'source.snapshot': 'saved reference rates',
    'source.none': 'no rates loaded',
    'explain.ref':
      '{amount} {from} is {result} at the daily reference rate, before any bank or card charges.',
    'explain.custom':
      'At your provider’s rate you get {result}. Its markup against the reference rate is {markup}.',
    'step.cross':
      'Cross rate: both rates are quoted per 1 {base}, so divide the “To” rate by the “From” rate.',
    'step.multiply': 'Multiply the amount by the rate and round to the currency’s smallest unit.',
    'step.custom': 'Multiply the amount by your provider’s rate.',
    'step.markup':
      'Markup: how far your rate is below the reference rate, as a percentage of the reference.',
    'warn.noRate': 'Enter the rate your provider quoted.',
    'warn.noData': 'No reference rate is available for this pair. Enter a custom rate instead.',
    'warn.same': 'Both currencies are the same.',
    'warn.markupLarge':
      'A {p} markup is unusually large. Check that the rate is in the right direction (To per 1 From).',
    'attribution.pre': 'Reference rates by',
    'attribution.post': 'Rates update once a day and are not live trading rates.',
    rounding:
      'The converted amount is rounded half-up to the target currency’s smallest unit (cents, whole yen, or fils in Bahraini dinar), using ISO 4217 minor units. Rates are shown to 6 significant digits.',
  },
  HowItWorks: () => (
    <>
      <p>
        An exchange rate says how many units of one currency buy one unit of another. Converting is
        a single multiplication:
      </p>
      <Formula
        label="Conversion"
        where={[
          {
            symbol: 'rate',
            meaning: 'units of the “To” currency per 1 unit of the “From” currency',
          },
          { symbol: 'amount', meaning: 'in the “From” currency' },
        ]}
      >
        {'converted = amount × rate\ninverse rate = 1 ÷ rate'}
      </Formula>
      <h3>Where the rates come from</h3>
      <p>
        The calculator loads daily reference rates for about 160 currencies from ExchangeRate-API.
        If that is unreachable, it falls back to a second daily source, and if both fail, it uses
        the rates saved when this page was built. The date and source are always shown next to the
        result. These are reference rates, updated once a day. They are not live trading prices,
        which move every second while markets are open.
      </p>
      <p>
        All rates are quoted against the US dollar, so any other pair is a cross rate. To convert
        pounds to rupees, divide the rupee rate by the pound rate. The European Central Bank
        likewise publishes its reference rates only against the euro, so other pairs are derived the
        same way.
      </p>
      <Formula label="Cross rate">{'GBP→INR = (INR per USD) ÷ (GBP per USD)'}</Formula>
      <h3>Reference rate versus the rate you get</h3>
      <p>
        Reference rates sit midway between buying and selling prices. Banks, card networks and
        money-transfer services usually give you a less favourable rate and sometimes charge a fee
        on top. The difference is their markup:
      </p>
      <Formula label="Markup">
        {'markup = (reference rate − your rate) ÷ reference rate × 100%'}
      </Formula>
      <p>
        Choose “My provider’s rate”, enter the quote, and the calculator shows the markup and what
        the reference rate would have given you.
      </p>
    </>
  ),
  examples: [
    {
      id: 'bank',
      title: 'Checking a bank’s dollar-to-euro rate',
      body: (r, fmt) => {
        const m = o(r, 'markup');
        return (
          <p>
            A bank quotes 0.88 EUR per USD for $1,000, so you receive 1,000 × 0.88 ={' '}
            <strong>{fmt.money(o(r, 'result'))}</strong>. At the reference rate when this page was
            last built, the same dollars were worth {fmt.money(o(r, 'refResult'))}.{' '}
            {m > 0
              ? `The bank’s rate is ${fmt.pct(m, 2)} below the reference, which is its markup, in addition to any fee it charges.`
              : 'On that date the bank’s rate was at or above the reference rate, so it took no markup on the rate itself.'}
          </p>
        );
      },
    },
    {
      id: 'remit',
      title: 'Sending £500 to India',
      body: (r, fmt) => {
        const m = o(r, 'markup');
        return (
          <p>
            A transfer service offers 119 rupees per pound. £500 × 119 ={' '}
            <strong>{fmt.money(o(r, 'result'))}</strong> arrives in India. At the reference rate it
            would be {fmt.money(o(r, 'refResult'))}
            {m > 0
              ? `, so the service keeps about ${fmt.money(o(r, 'refResult') - o(r, 'result'))} through its rate (a ${fmt.pct(m, 2)} markup).`
              : '.'}{' '}
            Comparing services by the amount that arrives, after fees, is fairer than comparing
            their advertised fees.
          </p>
        );
      },
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Compare on the amount received, not the fee.</strong> A transfer advertised as “no
        fee” can still cost more than one with a fee if its exchange rate carries a larger markup.
        Enter each provider’s quote to compare the result.
      </li>
      <li>
        <strong>Pay in the local currency when abroad.</strong> If a card terminal offers to charge
        you in your home currency (dynamic currency conversion), the merchant’s bank sets the rate,
        usually with a markup well above your card’s.
      </li>
      <li>
        <strong>Don’t use reference rates for trading.</strong> These rates update once a day. For
        forex trading or time-sensitive payments, use your broker’s or bank’s live quote.
      </li>
      <li>
        <strong>Check the direction of a quoted rate.</strong> “1.09” for euros and dollars could
        mean 1.09 USD per EUR or the reverse. The inverse rate is shown under the result to help you
        match a quote.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'Are these exchange rates live?',
      a: 'No. They are daily reference rates, updated once a day, and the date and time of the update are shown with the result. Live market rates change every second during trading hours. For a payment or trade happening now, use the rate your bank or broker quotes.',
    },
    {
      q: 'Why is the rate my bank gives me different?',
      a: 'Reference rates are mid-market rates with no profit margin. Banks and transfer services sell currency at a less favourable rate and keep the difference, which for consumers is often a few percent. Enter their quote as a custom rate to see the exact markup.',
    },
    {
      q: 'How do I convert currency manually?',
      a: 'Multiply the amount by the rate quoted as units of the target currency per one unit of your currency. If you only have rates against a third currency such as the US dollar, divide the target’s rate by the source’s rate to get the cross rate, then multiply.',
    },
    {
      q: 'What is dynamic currency conversion, and should I accept it?',
      a: 'Dynamic currency conversion is when a shop or ATM abroad offers to charge your card in your home currency. The rate is set by the merchant’s provider and usually includes a large markup. Choosing to pay in the local currency lets your own card issuer convert it, which is normally cheaper.',
    },
    {
      q: 'Why do some currencies show no decimal places?',
      a: 'Each currency has an official number of minor units under ISO 4217. The Japanese yen and Korean won have none, most currencies have two, and a few, such as the Bahraini and Kuwaiti dinar, have three. Results are rounded to the target currency’s minor unit.',
    },
  ],
  ogSample: (r, fmt) => `100 USD = ${fmt.money(o(r, 'result'))}`,
};
