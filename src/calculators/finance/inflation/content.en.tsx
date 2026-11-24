import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';
import { FIRST, LAST } from './definition';

const o = (r: { outputs: Record<string, unknown> }, k = 'value') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Inflation Calculator',
  promise: 'What US dollars from one year are worth in another, using official CPI data.',
  title: 'Inflation Calculator: US Dollar Value Over Time (CPI)',
  description:
    'See what an amount of US dollars from any year since 1913 is worth in another year, using the official Consumer Price Index annual averages from the BLS.',
  summary:
    'Inflation is the rise in the general level of prices, so a dollar buys less over time. The Consumer Price Index tracks the price of a fixed basket of goods and services bought by urban households. To move an amount between years, multiply it by the ratio of the two years’ index values. $100 in 2000 had the same buying power as about $182 in 2024.',
  synonyms: [
    'CPI inflation calculator',
    'value of a dollar calculator',
    'purchasing power calculator',
    'dollar inflation calculator',
    'how much is money worth today',
    'historical inflation',
  ],
  ui: {
    amount: 'Amount (US dollars)',
    years: 'Years',
    from: `From year (${FIRST}–${LAST})`,
    to: 'To year',
    'out.value': 'Equivalent value',
    'out.change': 'Cumulative price change',
    'out.annual': 'Average inflation per year',
    'out.cpiFrom': 'CPI in the first year',
    'out.cpiTo': 'CPI in the second year',
    'explain.forward': '{amount} in {from} buys about as much as {value} did in {to}.',
    'explain.back': '{amount} in {from} had the buying power of {value} in {to}.',
    'step.ratio': 'Divide the index in the target year by the index in the starting year.',
    'step.value': 'Multiply the amount by that ratio.',
    'warn.range': 'CPI data is available for {first} to {last}.',
    rounding:
      'Uses annual average index values. Results are rounded to the cent; rates to 4 decimal places, shown to 2.',
  },
  HowItWorks: () => (
    <>
      <Formula
        label="Adjusting for inflation"
        where={[{ symbol: 'CPI', meaning: 'annual average Consumer Price Index' }]}
      >
        {'value in year B = amount × CPI(B) ÷ CPI(A)'}
      </Formula>
      <p>
        The Bureau of Labor Statistics publishes the CPI for All Urban Consumers (CPI-U), with
        1982–84 = 100. This calculator uses its annual averages from {FIRST} to {LAST}, downloaded
        from the BLS data service. Where the BLS gives an annual average it is used directly;
        otherwise it is the mean of the twelve monthly values, which is how the BLS defines it.
      </p>
      <p>
        OpenStax <em>Principles of Macroeconomics</em> describes the inflation rate as the
        percentage change in a price index from one period to the next. The cumulative change and
        the average yearly rate shown here follow from the same index ratio.
      </p>
    </>
  ),
  examples: [
    {
      id: 'since2000',
      title: '$100 from 2000 in 2024 dollars',
      body: (r, fmt) => (
        <p>
          The CPI averaged 172.2 in 2000 and 313.689 in 2024. $100 × 313.689 ÷ 172.2 ={' '}
          <strong>{fmt.money(o(r))}</strong>: prices rose {fmt.pct(o(r, 'change'), 1)}, about{' '}
          {fmt.pct(o(r, 'annual'), 2)} a year on average.
        </p>
      ),
    },
    {
      id: 'century',
      title: 'A 1913 dollar today',
      body: (r, fmt) => (
        <p>
          The first year of the index, 1913, averaged 9.9. With 2025 at 321.943, one 1913 dollar is
          worth <strong>{fmt.money(o(r))}</strong>, an average of {fmt.pct(o(r, 'annual'), 2)} a
          year over 112 years.
        </p>
      ),
    },
    {
      id: 'back',
      title: 'A 2024 salary in 1990 dollars',
      body: (r, fmt) => (
        <p>
          Going backwards works the same way. $50,000 in 2024 had the buying power of{' '}
          <strong>{fmt.money(o(r))}</strong> in 1990, when the CPI averaged 130.7.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>The CPI is an average.</strong> Your own costs may have risen faster or slower,
        depending on what you buy and where you live.
      </li>
      <li>
        <strong>Compare like with like.</strong> To see whether pay or prices kept up with
        inflation, convert the old figure to today’s dollars and compare it with the current one.
      </li>
      <li>
        <strong>US data only.</strong> These are US prices. Other countries publish their own price
        indexes, which give different results.
      </li>
      <li>
        <strong>Annual averages smooth the year.</strong> For a specific month, monthly CPI values
        from the BLS give a slightly different answer.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How is inflation calculated?',
      a: 'Inflation between two years is the percentage change in the Consumer Price Index. If the index rose from 172.2 to 313.689, prices rose by 313.689 ÷ 172.2 − 1 = 82.2%. Multiplying an old amount by the same ratio gives its value in the later year’s dollars.',
    },
    {
      q: 'What is the CPI?',
      a: 'The Consumer Price Index measures the average change in prices paid by urban consumers for a fixed basket of goods and services, such as food, housing, transport and medical care. The US Bureau of Labor Statistics publishes it monthly, with 1982–84 set to 100.',
    },
    {
      q: 'What is a dollar from 1950 worth today?',
      a: 'The CPI averaged 24.1 in 1950 and 321.943 in 2025, a ratio of about 13.36. So one 1950 dollar had the buying power of roughly $13.36 in 2025, and $100 then is about $1,336 now.',
    },
    {
      q: 'Why does the calculator stop at the last full year?',
      a: 'It uses annual averages, which exist only once a year is complete. For the current year, monthly CPI values from the Bureau of Labor Statistics show the latest prices; the data here is refreshed after each new annual average is published.',
    },
  ],
  ogSample: (r, fmt) => `$100 in 2000 = ${fmt.money(o(r))} in 2024`,
};
