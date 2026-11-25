import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'sd') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Standard Deviation Calculator',
  promise: 'Sample or population standard deviation and variance, with every step shown.',
  title: 'Standard Deviation Calculator: Sample and Population SD',
  description:
    'Paste a list of numbers to get the sample or population standard deviation, variance, sum of squares, standard error and coefficient of variation.',
  summary:
    'Standard deviation measures how far values typically sit from their mean. Find the mean, square each value’s distance from it, add those squares, divide by n − 1 for a sample or n for a whole population, then take the square root. Use the sample version when your data are a subset of a larger group, which is the usual case.',
  synonyms: [
    'sample standard deviation calculator',
    'population standard deviation calculator',
    'variance calculator',
    'how to calculate standard deviation',
    'sum of squares calculator',
    'standard error of the mean calculator',
  ],
  ui: {
    kind: 'Your data are',
    'kind.sample': 'A sample',
    'kind.population': 'The population',
    'kind.help': 'Choose a sample unless the list contains every member of the group you describe.',
    values: 'Data values',
    'values.help': 'Separate numbers with commas, spaces or new lines. Up to 10,000 values.',
    'out.sd': 'Standard deviation',
    'out.sd.sample': 'Sample standard deviation (s)',
    'out.sd.population': 'Population standard deviation (σ)',
    'out.variance': 'Variance',
    'out.variance.sample': 'Sample variance (s²)',
    'out.variance.population': 'Population variance (σ²)',
    'out.mean': 'Mean',
    'out.count': 'Count (n)',
    'out.ss': 'Sum of squared deviations',
    'out.other': 'Other standard deviation',
    'out.other.sample': 'Population SD of the same values (σ)',
    'out.other.population': 'Sample SD of the same values (s)',
    'out.se': 'Standard error of the mean (s ÷ √n)',
    'out.cv': 'Coefficient of variation (%)',
    'explain.sample':
      'Treated as a sample of {n} values, the data typically sit about {sd} from their mean of {mean}.',
    'explain.population':
      'Treated as a whole population of {n} values, the data typically sit about {sd} from their mean of {mean}.',
    'step.mean': 'Mean = sum of the values ÷ count.',
    'step.ss': 'Subtract the mean from each value, square the results and add them.',
    'step.varSample': 'Sample variance: divide by n − 1.',
    'step.varPop': 'Population variance: divide by n.',
    'step.sd': 'The standard deviation is the square root of the variance.',
    'warn.empty': 'Enter at least one number.',
    'warn.one': 'A sample standard deviation needs at least two numbers.',
    'warn.ignored': 'Skipped {n} entries that are not numbers: {list}.',
    'warn.tooMany': 'Only the first {max} values were used.',
    rounding: 'Results keep 12 significant digits and are shown to 10.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Sample">{'s = √( Σ(x − x̄)² ÷ (n − 1) )'}</Formula>
      <Formula label="Population">{'σ = √( Σ(x − μ)² ÷ N )'}</Formula>
      <p>
        Dividing by n − 1 instead of n (Bessel’s correction) makes the sample variance an unbiased
        estimate of the population variance, because a sample’s own mean sits closer to its values
        than the true mean does. The difference shrinks as the sample grows.
      </p>
      <p>
        The calculator finds the mean first and then sums the squared deviations, rather than using
        the shortcut Σx² − n·x̄². The shortcut loses accuracy when values are large and close
        together; this method returns the exact NIST certified result for such data.
      </p>
    </>
  ),
  examples: [
    {
      id: 'ages',
      title: 'Ages of 20 fifth graders (a sample)',
      body: (r, fmt) => (
        <p>
          The mean is {fmt.sig(o(r, 'mean'), 5)}, the squared deviations add to{' '}
          {fmt.sig(o(r, 'ss'), 5)}, and 9.7375 ÷ 19 = {fmt.sig(o(r, 'variance'), 4)}. The square
          root gives s = <strong>{fmt.sig(o(r), 6)}</strong>, about 0.72 years, as in OpenStax{' '}
          <em>Introductory Statistics</em> Example 2.32.
        </p>
      ),
    },
    {
      id: 'population',
      title: 'Eight values treated as a whole population: 2, 4, 4, 4, 5, 5, 7, 9',
      body: (r, fmt) => (
        <p>
          The mean is 5 and the squared deviations add to 32, so σ² = 32 ÷ 8 = 4 and σ ={' '}
          <strong>{fmt.sig(o(r), 3)}</strong>. Treated as a sample, the same list gives s = √(32 ÷
          7) ≈ {fmt.sig(o(r, 'other'), 4)}.
        </p>
      ),
    },
    {
      id: 'nist',
      title: 'NIST accuracy test: 10000001, 10000003, 10000002',
      body: (r, fmt) => (
        <p>
          The certified sample standard deviation is exactly 1, and the calculator returns{' '}
          <strong>{fmt.sig(o(r), 10)}</strong>. A one-pass formula on these large values can lose
          most of its digits to rounding.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Sample or population?</strong> Survey responses, test batches and measurements are
        samples. Use the population version only when you have every member, such as all 30 students
        in one class described for that class alone.
      </li>
      <li>
        <strong>Rough reading:</strong> for bell-shaped data, about 68% of values fall within one
        standard deviation of the mean and about 95% within two.
      </li>
      <li>
        <strong>Same units as the data:</strong> the standard deviation is in the data’s units; the
        variance is in squared units, which is why the SD is easier to interpret.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate standard deviation by hand?',
      a: 'Find the mean. Subtract it from each value and square the result. Add the squares, divide by n − 1 for a sample or n for a population, and take the square root. For 20 children’s ages, the squares add to 9.7375, 9.7375 ÷ 19 = 0.5125, and √0.5125 ≈ 0.716 years.',
    },
    {
      q: 'Why does the sample standard deviation divide by n − 1?',
      a: 'The squared deviations are measured from the sample’s own mean, which is always the best fit to those values, so they come out slightly too small. Dividing by n − 1 corrects that bias in the variance. With large samples the two versions are almost identical.',
    },
    {
      q: 'What is the difference between variance and standard deviation?',
      a: 'Variance is the average squared distance from the mean, and the standard deviation is its square root. Variance is in squared units, such as years squared, so the standard deviation, in the original units, is the figure usually reported.',
    },
    {
      q: 'What is a good or a high standard deviation?',
      a: 'It depends on the scale. A standard deviation of 5 is large for ages of fifth graders but tiny for house prices. The coefficient of variation, the SD as a percentage of the mean, lets you compare spread between data on different scales.',
    },
    {
      q: 'What is the standard error of the mean?',
      a: 'It is the sample standard deviation divided by the square root of the sample size. It measures how much the sample mean would vary from sample to sample, and it shrinks as the sample grows, which is why it is used for confidence intervals.',
    },
  ],
  ogSample: (r, fmt) => `20 ages → s = ${fmt.sig(o(r), 4)} years`,
};
