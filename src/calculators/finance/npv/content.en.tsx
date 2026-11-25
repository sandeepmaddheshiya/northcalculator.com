import type { CalculatorContent } from '@/calculators/content-types';
import { currencyUi } from '@/calculators/currencies';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'npv') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'NPV and IRR Calculator',
  promise: 'Net present value, internal rate of return and payback for a stream of cash flows.',
  title: 'NPV and IRR Calculator: Net Present Value and Payback',
  description:
    'Enter an investment’s cash flows and a discount rate to get its net present value, internal rate of return, payback period and profitability index.',
  summary:
    'Net present value discounts each future cash flow back to today at your required rate of return and subtracts the initial cost. A positive NPV means the investment earns more than that rate. The internal rate of return is the discount rate that makes NPV exactly zero, and the payback period is how long it takes to get the money back.',
  synonyms: [
    'net present value calculator',
    'internal rate of return calculator',
    'payback period calculator',
    'discounted cash flow calculator',
    'capital budgeting calculator',
    'profitability index calculator',
  ],
  ui: {
    currency: 'Currency',
    ...currencyUi('en'),
    rate: 'Discount rate (% per period)',
    flows: 'Cash flows, year 0 first',
    'flows.help':
      'Start with the cost as a negative number, e.g. -16000, 2000, 4000. Parentheses also mean negative.',
    'out.npv': 'Net present value (NPV)',
    'out.irr': 'Internal rate of return (IRR)',
    'out.payback': 'Payback period (periods)',
    'out.pi': 'Profitability index',
    'out.pvIn': 'Present value of future cash flows',
    'explain.accept':
      'At {rate}%, the NPV is {npv}: the investment earns more than the required return.',
    'explain.reject':
      'At {rate}%, the NPV is {npv}: the investment earns less than the required return.',
    'step.npv': 'Discount each cash flow by (1 + r)ᵗ and add.',
    'step.irr': 'The IRR is the rate that makes NPV zero.',
    'warn.rate': 'The discount rate must be above −100%.',
    'warn.flows': 'Enter at least two cash flows: the initial outlay and one or more returns.',
    'warn.bad': '{n} entries were not numbers and were skipped.',
    'warn.multiple':
      'The cash flows change sign more than once, so there may be more than one IRR; rely on the NPV.',
    rounding:
      'Money is rounded half-up to the smallest currency unit. The payback period assumes cash arrives evenly within each period.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Net present value">
        {'NPV = CF₀ + CF₁ ÷ (1 + r) + CF₂ ÷ (1 + r)² + …'}
      </Formula>
      <Formula label="IRR and profitability index">
        {'IRR: the r where NPV = 0\nPI = PV of future flows ÷ initial outlay'}
      </Formula>
      <p>
        Accept a project when NPV is positive, the IRR exceeds the required return, or the
        profitability index is above 1. OpenStax’s managerial accounting book uses 3-digit table
        factors, so its NPVs can differ from these exact figures by a few dollars.
      </p>
    </>
  ),
  examples: [
    {
      id: 'sam',
      title: 'A $16,000 machine returning $2,000 to $5,000 a year at 9%',
      body: (r, fmt) => (
        <p>
          NPV = <strong>{fmt.money(o(r))}</strong>, IRR = {fmt.pct(o(r, 'irr'), 2)} and payback in{' '}
          {fmt.sig(o(r, 'payback'), 3)} years, as in OpenStax <em>Principles of Finance</em>{' '}
          §16.1–16.3 ($2,835.63, 14.09%, four years).
        </p>
      ),
    },
    {
      id: 'growth',
      title: 'A $30,000 project with rising returns, at 9%',
      body: (r, fmt) => (
        <p>
          Seven years of $6,000 up to $18,000 give NPV = <strong>{fmt.money(o(r))}</strong>, the
          $26,946.90 of OpenStax §16.2.
        </p>
      ),
    },
    {
      id: 'xray',
      title: 'A $200,000 X-ray machine paying $40,000 a year for 10 years at 8%',
      body: (r, fmt) => (
        <p>
          NPV = <strong>{fmt.money(o(r))}</strong> and the profitability index is{' '}
          {fmt.sig(o(r, 'pi'), 4)}; the accounting text gets $68,400 and 1.342 with the rounded
          table factor 6.710.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Pick the right rate:</strong> use your cost of capital or required return, and the
        same period length as the cash flows.
      </li>
      <li>
        <strong>Compare projects by NPV</strong> when they are mutually exclusive; IRR can rank them
        differently when sizes or timing differ.
      </li>
      <li>
        <strong>Payback ignores later cash and timing,</strong> so treat it as a risk check rather
        than a measure of value.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What is net present value?',
      a: 'The sum of all cash flows, each discounted to today’s value at your required rate. A $1,000 payment in a year is worth $1,000 ÷ 1.10 ≈ $909.09 today at 10%. If the discounted inflows exceed the cost, NPV is positive and the project adds value.',
    },
    {
      q: 'What is the internal rate of return?',
      a: 'The discount rate at which NPV is exactly zero: the project’s own effective yield. Sam’s embroidery machine has an IRR of about 14.09%, so it is worth doing for any required return below that. OpenStax’s NPV profile crosses zero just above 14%.',
    },
    {
      q: 'How is the payback period calculated?',
      a: 'Add up the cash flows year by year until the total turns positive. Sam’s machine recovers its $16,000 after 2,000 + 4,000 + 5,000 + 5,000, exactly four years. When recovery happens partway through a year, the calculator assumes that year’s cash arrives evenly.',
    },
    {
      q: 'Can a project have more than one IRR?',
      a: 'Yes, if the cash flows change sign more than once, such as a cost, then income, then a large clean-up cost. OpenStax shows a −350, +950, −620 example with two IRRs. In that case, use NPV at your required rate to decide.',
    },
  ],
  ogSample: (r, fmt) => `$16,000 machine at 9% → NPV ${fmt.money(o(r))}`,
};
