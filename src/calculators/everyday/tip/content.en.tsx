import type { CalculatorContent } from '@/calculators/content-types';
import { currencyUi } from '@/calculators/currencies';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k: string) => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Tip Calculator',
  promise: 'The tip, the total, and each person’s share, with optional rounding up.',
  title: 'Tip Calculator: Tip Amount and Split the Bill Evenly',
  description:
    'Work out the tip at any percentage, the total to pay, and each person’s share when you split the bill, with an option to round up.',
  summary:
    'A tip is the bill multiplied by the tip percentage and divided by 100, so 18% of $68.50 is $12.33. Add it to the bill for the total, then divide by the number of people to split it. Rounding each share up to a whole dollar, pound or euro makes paying easier and adds a little to the tip, which the calculator shows exactly.',
  synonyms: [
    'gratuity calculator',
    'split bill calculator',
    'restaurant tip calculator',
    'tip percentage calculator',
    'how much to tip',
    'bill splitter',
  ],
  ui: {
    bill: 'Bill amount',
    pct: 'Tip percentage',
    people: 'Number of people',
    round: 'Each share',
    'round.none': 'Exact',
    'round.up': 'Round up',
    'round.help':
      'Round each person’s share up to a whole unit of currency. The extra goes to the tip.',
    currency: 'Currency',
    ...currencyUi('en'),
    'out.tip': 'Tip',
    'out.total': 'Total to pay',
    'out.each': 'Each person pays',
    'out.tipEach': 'Tip per person',
    'out.effective': 'Tip after rounding',
    explain: 'Leave {tip}, for a total of {total}.',
    'explain.split': 'The total is {total}, so each of the {n} people pays {each}.',
    'step.tip': 'Tip: the bill times the tip percentage, rounded to the cent.',
    'step.total': 'Total: the bill plus the tip.',
    'step.split':
      'Split the total evenly (any leftover cent is rounded up so the bill is covered).',
    'step.roundUp': 'Round each share up to a whole unit; the tip grows by the difference.',
    'warn.high': 'That’s a generous tip. Check the percentage is what you meant.',
    rounding:
      'The tip is rounded half-up to the smallest currency unit. Shares are rounded up, never down, so the bill is always covered.',
  },
  HowItWorks: () => (
    <>
      <Formula
        label="Tip and split"
        where={[
          { symbol: 'B', meaning: 'bill amount' },
          { symbol: 'p', meaning: 'tip percentage' },
          { symbol: 'n', meaning: 'number of people' },
        ]}
      >
        {'tip   = B × p ÷ 100\ntotal = B + tip\nshare = total ÷ n'}
      </Formula>
      <p>
        A percentage is a number of hundredths, so 18% is 0.18 and the tip on a $68.50 bill is 68.50
        × 0.18 = $12.33. When a share doesn’t divide evenly, the calculator rounds it up by a cent
        so the group never pays less than the total.
      </p>
      <p>
        With “Round up”, each share is rounded up to a whole unit of currency, such as $57 instead
        of $56.22. The extra is added to the tip, and the calculator shows the tip percentage that
        results, so you know what you actually left.
      </p>
    </>
  ),
  examples: [
    {
      id: 'dinner',
      title: 'An 18% tip on a $68.50 dinner',
      body: (r, fmt) => (
        <p>
          18% as a decimal is 0.18, and 68.50 × 0.18 = <strong>{fmt.money(o(r, 'tip'))}</strong>.
          The total to pay is {fmt.money(o(r, 'total'))}. A quick mental check: 10% is $6.85, so 20%
          would be $13.70, and 18% should be a little less, which it is.
        </p>
      ),
    },
    {
      id: 'split',
      title: 'Four people splitting $187.40 with a 20% tip, rounded up',
      body: (r, fmt) => (
        <p>
          A 20% tip is $37.48, for a total of $224.88, or $56.22 each. Rounding each share up to{' '}
          <strong>{fmt.money(o(r, 'each'))}</strong> makes the total {fmt.money(o(r, 'total'))}. The
          tip becomes {fmt.money(o(r, 'tip'))}, which is {fmt.pct(o(r, 'effective'), 1)} of the
          bill.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Tip on the pre-tax amount if you prefer.</strong> Many people tip on the subtotal
        before sales tax. Enter the subtotal as the bill, then add the tax yourself, or use the
        sales tax calculator.
      </li>
      <li>
        <strong>Customs differ by country.</strong> In the US, tips of 15–20% at restaurants are
        common. In much of Europe and Asia, service is often included or tips are small. Check the
        bill for a service charge before adding a tip.
      </li>
      <li>
        <strong>Splitting unequal orders.</strong> An even split suits shared meals. If orders
        differ a lot, work out each person’s subtotal first and apply the same percentage to each.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate a tip quickly in my head?',
      a: 'Move the decimal point one place left to get 10%, then adjust. For a $68.50 bill, 10% is $6.85, so 20% is $13.70 and 15% is $6.85 plus half of it, about $10.28. The calculator gives the exact amount for any percentage.',
    },
    {
      q: 'Should I tip on the total before or after tax?',
      a: 'Either is acceptable, and many guides suggest the pre-tax subtotal, since tax isn’t part of the service. The difference is small: on a $100 meal with 8% tax, an 18% tip is $18.00 on the subtotal or $19.44 on the total.',
    },
    {
      q: 'How do I split a bill and tip between several people?',
      a: 'Add the tip to the bill and divide the total by the number of people. Enter the number of people and the calculator shows each share. If the division leaves a fraction of a cent, it rounds each share up so the bill is fully covered.',
    },
    {
      q: 'What does rounding up each share do to the tip?',
      a: 'It raises each person’s payment to the next whole unit of currency, and the extra goes to the server. In the four-person example, rounding $56.22 up to $57 each raises the tip from 20% to about 21.7%. The calculator shows the new percentage.',
    },
  ],
  ogSample: (r, fmt) => `Tip ${fmt.money(o(r, 'tip'))} on ${fmt.money(68.5)}`,
};
