import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'value') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Percentile Calculator',
  promise: 'Any percentile of a data set, its quartiles and outliers, and the rank of a value.',
  title: 'Percentile Calculator: Percentiles, Quartiles, IQR and Rank',
  description:
    'Paste data to find any percentile, the quartiles, interquartile range and outliers, and the percentile rank of a value, by the NIST and OpenStax methods.',
  summary:
    'The pth percentile is the value below which about p% of the data fall. Sort the data, find the position p ÷ 100 × (n + 1), and read off the value there, interpolating between neighbours when the position falls between two. The 25th, 50th and 75th percentiles are the quartiles, and the gap between the outer two, the IQR, flags outliers.',
  synonyms: [
    'quartile calculator',
    'interquartile range calculator',
    'percentile rank calculator',
    'outlier calculator',
    'five number summary calculator',
    '90th percentile calculator',
  ],
  ui: {
    data: 'Data values',
    'data.help': 'Separate with commas, spaces or new lines.',
    p: 'Percentile (0–100)',
    x: 'Value to rank',
    'x.help': 'Optional, for its percentile rank.',
    'out.value': 'Percentile (interpolated)',
    'out.averaged': 'Percentile (averaging method)',
    'out.rank': 'Percentile rank of the value',
    'out.q1': 'First quartile Q1',
    'out.median': 'Median',
    'out.q3': 'Third quartile Q3',
    'out.iqr': 'Interquartile range (IQR)',
    'out.outliers': 'Potential outliers',
    'outliers.none': 'None',
    explain: 'The {p}th percentile of these {n} values is {v}.',
    'step.position': 'Position = p ÷ 100 × (n + 1) in the sorted data.',
    'step.interpolate': 'Interpolate between the values on either side of that position.',
    'step.fences': 'Values outside Q1 − 1.5 IQR to Q3 + 1.5 IQR are potential outliers.',
    'warn.few': 'Enter at least two numbers.',
    'warn.bad': '{n} entries were not numbers and were skipped.',
    rounding: 'Results keep 12 significant digits and are shown to 10.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Position">{'position = p ÷ 100 × (n + 1) = k + d'}</Formula>
      <Formula label="Interpolate (NIST)">{'Y(p) = Y[k] + d × (Y[k+1] − Y[k])'}</Formula>
      <Formula label="Percentile rank (OpenStax)">
        {'rank of x = (values below + ½ × values equal) ÷ n × 100'}
      </Formula>
      <p>
        Methods differ when the position is not a whole number: NIST interpolates, while OpenStax{' '}
        <em>Introductory Statistics</em> averages the two neighbours. The calculator shows both.
        Spreadsheets often use yet another rule, so small differences are normal.
      </p>
    </>
  ),
  examples: [
    {
      id: 'nist',
      title: 'The 90th percentile of 12 resistivity measurements',
      body: (r, fmt) => (
        <p>
          The position is 0.9 × 13 = 11.7, so the value is 70% of the way from the 11th to the 12th:{' '}
          <strong>{fmt.sig(o(r), 6)}</strong> ohm·cm, as in the NIST/SEMATECH handbook.
        </p>
      ),
    },
    {
      id: 'houses',
      title: 'Quartiles of 13 house prices',
      body: (r, fmt) => (
        <p>
          Q1 = {fmt.num(o(r, 'q1'), 0)}, the median <strong>{fmt.num(o(r, 'median'), 0)}</strong>{' '}
          and Q3 = {fmt.num(o(r, 'q3'), 0)}, so the 5,500,000 home is a potential outlier, as in
          OpenStax Example 2.13.
        </p>
      ),
    },
    {
      id: 'small',
      title: 'The median of 2, 4, 6, 8',
      body: (r, fmt) => (
        <p>
          The position 2.5 falls between 4 and 6, giving <strong>{fmt.sig(o(r), 4)}</strong>; the
          value 5 ranks at the {fmt.sig(o(r, 'rank'), 3)}th percentile.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Percentile is not percent correct.</strong> Scoring in the 90th percentile means
        doing better than about 90% of others, whatever the raw score.
      </li>
      <li>
        <strong>Small data sets</strong> give rough percentiles; extreme ones like the 99th need
        lots of data to mean much.
      </li>
      <li>
        <strong>Outliers are flags,</strong> not mistakes; check them before removing anything.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate a percentile?',
      a: 'Sort the data and find the position p ÷ 100 × (n + 1). If it is a whole number, that value is the percentile; otherwise interpolate between the values on either side. For 12 values, the 90th percentile sits at position 11.7, 70% of the way from the 11th value to the 12th.',
    },
    {
      q: 'What is a percentile rank?',
      a: 'The percentage of data at or below a value, counting ties as half: (values below + ½ × values equal) ÷ n × 100. In a list of 29 ages where 18 are below 58 and one equals it, 58 is at about the 64th percentile.',
    },
    {
      q: 'How are quartiles and the IQR found?',
      a: 'Q1, the median and Q3 are the 25th, 50th and 75th percentiles. The interquartile range is Q3 − Q1 and covers the middle half of the data. Any value more than 1.5 × IQR below Q1 or above Q3 is a potential outlier.',
    },
    {
      q: 'Why do calculators give different percentiles?',
      a: 'There are several accepted rules for positions that fall between data values. NIST lists methods it calls R6, R7 and R8; its 12-value example gives 95.1981, 95.1957 and 95.1972 for the 90th percentile. The differences shrink as the data set grows.',
    },
  ],
  ogSample: (r, fmt) => `90th percentile → ${fmt.sig(o(r), 6)}`,
};
