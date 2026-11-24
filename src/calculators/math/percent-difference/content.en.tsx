import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'result') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Percent Difference Calculator',
  promise:
    'Percent difference between two measurements, or percent error against an accepted value.',
  title: 'Percent Difference Calculator: Percent Error for Lab Reports',
  description:
    'Compare two measurements with percent difference, or a measured value with an accepted one using percent error, the two comparisons used in science lab reports.',
  summary:
    'Percent difference compares two values that are equally trustworthy, such as two students’ measurements. It divides their absolute difference by their average, so the order does not matter. Percent error compares a measurement with an accepted or theoretical value and divides by that accepted value instead. Both are reported as positive percentages.',
  synonyms: [
    'percentage difference calculator',
    'percent error calculator',
    'percentage error calculator',
    'relative difference',
    'experimental error calculator',
    'lab percent difference',
  ],
  ui: {
    mode: 'Comparison',
    'mode.difference': 'Percent difference',
    'mode.error': 'Percent error',
    'mode.help':
      'Use percent difference when neither value is the reference. Use percent error when one is the accepted or theoretical value.',
    'a.difference': 'First value',
    'b.difference': 'Second value',
    'a.error': 'Measured (experimental) value',
    'b.error': 'Accepted (theoretical) value',
    'out.result.difference': 'Percent difference',
    'out.result.error': 'Percent error',
    'out.diff': 'Absolute difference',
    'out.mean': 'Average of the two values',
    'explain.difference': '{a} and {b} differ by {r} of their average.',
    'explain.error': 'The measurement {a} is off from the accepted value {b} by {r}.',
    'step.diff': 'Take the absolute difference between the two values.',
    'step.mean': 'Average the two values.',
    'step.divideMean': 'Divide the difference by the average and multiply by 100.',
    'step.divideAccepted': 'Divide the difference by the accepted value and multiply by 100.',
    'warn.zeroAccepted': 'The accepted value is zero, so percent error is undefined.',
    'warn.zeroMean': 'The two values average to zero, so percent difference is undefined.',
    'warn.negative':
      'One value is negative. Percent difference is meant for two quantities of the same sign, so interpret it with care.',
    rounding:
      'Computed in double precision and rounded half-up to 4 decimal places, shown to 2. Report as many figures as your measurements justify.',
  },
  HowItWorks: () => (
    <>
      <p>
        Lab manuals distinguish two situations. When two values are on an equal footing, there is no
        good reason to divide by one rather than the other, so the average goes in the denominator
        as a compromise:
      </p>
      <Formula label="Percent difference">{'% difference = |a − b| ÷ ((a + b) ÷ 2) × 100'}</Formula>
      <p>
        When one value is well established, such as a textbook constant, the comparison is a percent
        error, measured against that value:
      </p>
      <Formula label="Percent error">
        {'% error = |measured − accepted| ÷ |accepted| × 100'}
      </Formula>
      <p>
        Percent difference is symmetric: swapping the two values changes nothing. Percent error is
        not, because the accepted value sets the scale. For values that are close together the two
        give nearly the same number; for values far apart they can differ a lot.
      </p>
    </>
  ),
  examples: [
    {
      id: 'balls',
      title: 'Two measurements of a tennis ball',
      body: (r, fmt) => (
        <p>
          Two lab partners measure a tennis ball’s diameter as 2.58 in and 2.61 in. The difference
          is 0.03 in and the average is 2.595 in, so the percent difference is 0.03 ÷ 2.595 × 100 ={' '}
          <strong>{fmt.pct(o(r), 2)}</strong>. Neither measurement is treated as the correct one.
        </p>
      ),
    },
    {
      id: 'aluminium',
      title: 'Measuring the density of aluminium',
      body: (r, fmt) => (
        <p>
          The accepted density of aluminium is 2.70 g/cm³, and a student measures 2.45 g/cm³. Choose
          percent error: |2.45 − 2.70| ÷ 2.70 × 100 = <strong>{fmt.pct(o(r), 2)}</strong>, the
          answer in the CK-12 chemistry text. The measurement is low, but percent error reports only
          the size of the gap.
        </p>
      ),
    },
    {
      id: 'prices',
      title: 'Two quotes for the same job',
      body: (r, fmt) => (
        <p>
          Two contractors quote $80 and $100. Their percent difference is 20 ÷ 90 × 100 ={' '}
          <strong>{fmt.pct(o(r), 2)}</strong>. Measured from the lower quote, the higher one is 25%
          more; from the higher one, the lower is 20% less. The percent difference sits between
          those two, which is the point of using the average.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Know which your instructor wants.</strong> Some courses use a signed percent error
        to show whether a measurement was high or low. This calculator reports the size of the
        error; the absolute difference shows the direction if you compare the two values.
      </li>
      <li>
        <strong>Compare with your uncertainty.</strong> A percent error smaller than your
        measurement’s relative uncertainty means the result agrees with the accepted value within
        error. A larger one points to a systematic problem or a mistake.
      </li>
      <li>
        <strong>Don’t use it near zero.</strong> When the values straddle zero or the accepted value
        is tiny, the percentage becomes huge and meaningless. Report the absolute difference with
        units instead.
      </li>
      <li>
        <strong>Round to match your data.</strong> Two significant figures are usually enough for a
        percent error. Writing 8.962486% suggests a precision the measurement doesn’t have.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What is the formula for percent difference?',
      a: 'Subtract one value from the other, ignore the sign, and divide by the average of the two values, then multiply by 100. For 45 and 55: the difference is 10, the average is 50, so the percent difference is 10 ÷ 50 × 100 = 20%.',
    },
    {
      q: 'When should I use percent error instead?',
      a: 'Use percent error when one value is known to be correct, such as an accepted constant or a theoretical prediction, and the other is your measurement. Dividing by the accepted value tells you how far your result is from the truth as a share of the true value.',
    },
    {
      q: 'Is a smaller percent error always better?',
      a: 'It means your result is closer to the accepted value, but it should be judged against your measurement uncertainty. A 2% error from equipment that is only accurate to 5% is a good result, while a 2% error from a 0.1% instrument suggests something went wrong.',
    },
    {
      q: 'Why do I get different answers depending on which value I divide by?',
      a: 'Because the base changes. From 80 to 100 is a 25% increase, but 100 to 80 is a 20% decrease. Percent difference avoids picking a side by dividing by the average, 90, which gives 22.2% whichever order you enter the values in.',
    },
  ],
  ogSample: (r, fmt) => `Percent difference ${fmt.pct(o(r), 2)}`,
};
