import type { CalculatorContent } from '@/calculators/content-types';
import { currencyUi } from '@/calculators/currencies';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'gross') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'VAT Calculator',
  promise: 'Add VAT to a net price or remove it from a gross price at any rate.',
  title: 'VAT Calculator: Add or Remove VAT at 20%, 5% or Any Rate',
  description:
    'Add VAT to a price or remove VAT from a VAT-inclusive price at 20%, 5% or any rate, with the net price, gross price, VAT amount and HMRC’s VAT fraction.',
  summary:
    'To add VAT, multiply the net price by 1 plus the rate: at the UK standard rate of 20%, £60 becomes £72. To remove it, do not take 20% off the gross price. Divide by 1.2 instead, or multiply by the VAT fraction, rate ÷ (100 + rate), which is 1/6 at 20%: £180 including VAT is £150 plus £30 of VAT.',
  synonyms: [
    'add VAT calculator',
    'remove VAT calculator',
    'reverse VAT calculator',
    'VAT inclusive calculator',
    'UK VAT calculator',
    'VAT fraction',
  ],
  ui: {
    currency: 'Currency',
    ...currencyUi('en'),
    mode: 'I want to',
    'mode.add': 'Add VAT',
    'mode.remove': 'Remove VAT',
    amount: 'Amount',
    'amount.add': 'Price excluding VAT (net)',
    'amount.remove': 'Price including VAT (gross)',
    rate: 'VAT rate (%)',
    'rate.help': 'UK: 20% standard, 5% reduced, 0% zero-rated.',
    'out.gross': 'Price including VAT',
    'out.net': 'Price excluding VAT',
    'out.vat': 'VAT',
    'out.fraction': 'VAT fraction',
    'explain.add': '{net} plus VAT at {rate}% is {gross}, of which {vat} is VAT.',
    'explain.remove': '{gross} including VAT at {rate}% is {net} plus {vat} of VAT.',
    'step.addVat': 'VAT = net price × rate.',
    'step.gross': 'Gross price = net price + VAT.',
    'step.fraction': 'VAT fraction = rate ÷ (100 + rate).',
    'step.removeVat': 'VAT included = gross price × VAT fraction.',
    'step.net': 'Net price = gross price − VAT.',
    'warn.rate': 'The VAT rate cannot be negative.',
    rounding:
      'VAT is rounded half-up to the nearest penny (or smallest currency unit), one of the line-level methods VAT Notice 700 allows; net + VAT always equals gross.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Adding VAT">
        {'VAT = net × rate ÷ 100\ngross = net × (1 + rate ÷ 100)'}
      </Formula>
      <Formula label="Removing VAT">
        {'VAT = gross × rate ÷ (100 + rate)\nnet = gross ÷ (1 + rate ÷ 100)'}
      </Formula>
      <p>
        HMRC calls rate ÷ (100 + rate) the VAT fraction: 1/6 at 20%, 1/21 at 5%. Its own example:
        something sold for £2.40 including 20% VAT contains 40p of VAT, which is one-sixth of the
        price, not 20% of it. Businesses that issue invoices should follow VAT Notice 700 for
        invoice-level rounding.
      </p>
    </>
  ),
  examples: [
    {
      id: 'chair',
      title: 'Adding 20% VAT to a £60 chair',
      body: (r, fmt) => (
        <p>
          £60 × 1.2 = <strong>{fmt.money(o(r))}</strong>, including {fmt.money(o(r, 'vat'))} of VAT,
          as in the GOV.UK guide.
        </p>
      ),
    },
    {
      id: 'table',
      title: 'Removing 20% VAT from £180',
      body: (r, fmt) => (
        <p>
          £180 ÷ 1.2 = <strong>{fmt.money(o(r, 'net'))}</strong>, so the VAT is{' '}
          {fmt.money(o(r, 'vat'))}, one-sixth of £180.
        </p>
      ),
    },
    {
      id: 'stairlift',
      title: 'A £483 stairlift at the 5% reduced rate',
      body: (r, fmt) => (
        <p>
          £483 ÷ 1.05 = <strong>{fmt.money(o(r, 'net'))}</strong>, with {fmt.money(o(r, 'vat'))} of
          VAT, or 1/21 of the price.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Don’t subtract 20%.</strong> Taking 20% off £120 gives £96, but the price before VAT
        was £100.
      </li>
      <li>
        <strong>Check which rate applies.</strong> Most goods are standard-rated, but some are at 5%
        or zero; GOV.UK lists them.
      </li>
      <li>
        <strong>Other countries</strong> use different standard rates; enter the rate that applies
        where the sale takes place.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I add VAT to a price?',
      a: 'Multiply the price excluding VAT by 1 plus the rate. At 20%, multiply by 1.2: a £250 invoice becomes £300, of which £50 is VAT. At the 5% reduced rate, multiply by 1.05.',
    },
    {
      q: 'How do I work out VAT from a total that includes it?',
      a: 'Multiply the total by the VAT fraction, rate ÷ (100 + rate), or divide the total by 1.2 at the standard rate to get the net price. A £96 receipt at 20% contains £16 of VAT and £80 net.',
    },
    {
      q: 'Why is removing 20% VAT not the same as taking 20% off?',
      a: 'The 20% is charged on the net price, so it is a smaller share of the larger gross price: one-sixth, or about 16.67%. Taking 20% off a gross price removes too much.',
    },
    {
      q: 'What are the UK VAT rates?',
      a: 'GOV.UK lists a standard rate of 20% for most goods and services, a reduced rate of 5% for some, such as children’s car seats and home energy, and a zero rate for others, such as most food and children’s clothes.',
    },
  ],
  ogSample: (r, fmt) => `£60 + 20% VAT → ${fmt.money(o(r))}`,
};
