import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k: string) => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Average Calculator',
  promise: 'Mean, median, mode, range and standard deviation of any list of numbers.',
  title: 'Average Calculator: Mean, Median, Mode and Std Dev',
  description:
    'Paste a list of numbers to get the mean, median, mode, range, sum, smallest and largest values, and the sample and population standard deviation.',
  summary:
    'The mean is the sum of the values divided by how many there are. The median is the middle value once they are sorted, or the average of the two middle values. The mode is the most frequent value. When a few values are much larger than the rest, the median describes a typical value better than the mean.',
  synonyms: [
    'mean calculator',
    'median calculator',
    'mode calculator',
    'standard deviation calculator',
    'arithmetic mean',
    'range calculator',
    'statistics calculator',
  ],
  ui: {
    values: 'Numbers',
    'values.help':
      'Separate values with commas, spaces, semicolons or new lines. Anything that isn’t a number is ignored.',
    'out.mean': 'Mean (average)',
    'out.median': 'Median',
    'out.mode': 'Mode',
    'mode.none': 'None (no value repeats)',
    'out.range': 'Range',
    'out.count': 'Count',
    'out.sum': 'Sum',
    'out.min': 'Smallest',
    'out.max': 'Largest',
    'out.sd': 'Standard deviation (sample, n − 1)',
    'out.psd': 'Standard deviation (population, n)',
    explain: 'The {n} values have a mean of {mean} and a median of {median}.',
    'explain.multimodal':
      'The {n} values have a mean of {mean} and a median of {median}. Several values tie for most frequent.',
    'step.mean': 'Mean: add the {n} values and divide by {n}.',
    'step.medianOdd': 'Median: sort the values; the middle one is value number {k}.',
    'step.medianEven': 'Median: sort the values; with an even count, average the two middle ones.',
    'step.mode': 'Mode: the value(s) that occur most often ({c} times).',
    'step.noMode': 'No value occurs more than once, so there is no mode.',
    'step.sd':
      'Sample standard deviation: square root of the sum of squared deviations divided by n − 1.',
    'warn.ignored': 'Ignored {n} item(s) that aren’t numbers: {list}.',
    'warn.tooMany': 'Only the first {max} values are used.',
    'warn.empty': 'Enter at least one number.',
    rounding:
      'Values are summed with compensated (Neumaier) summation to avoid floating-point drift, and results are shown to 10 significant digits.',
  },
  HowItWorks: () => (
    <>
      <Formula
        label="Centre and spread"
        where={[
          { symbol: 'xᵢ', meaning: 'each value' },
          { symbol: 'n', meaning: 'number of values' },
          { symbol: 'x̄', meaning: 'mean' },
        ]}
      >
        {
          'mean x̄ = Σxᵢ ÷ n\nsample s = √( Σ(xᵢ − x̄)² ÷ (n − 1) )\npopulation σ = √( Σ(xᵢ − x̄)² ÷ n )'
        }
      </Formula>
      <p>
        The median is found by sorting the values. With an odd count it is the middle value. With an
        even count it is the mean of the two middle values. The mode is the value that appears most
        often. A list can have several modes, or none if every value is different.
      </p>
      <h3>Sample or population standard deviation?</h3>
      <p>
        Use the sample standard deviation (dividing by n − 1) when your numbers are a sample from a
        larger group, which is the usual case in surveys and experiments. Use the population version
        (dividing by n) when the list is the entire group you care about. OpenStax’s Introductory
        Statistics explains why dividing by n − 1 corrects the sample estimate.
      </p>
    </>
  ),
  examples: [
    {
      id: 'scores',
      title: 'Eight test scores',
      body: (r, fmt) => (
        <p>
          For 72, 85, 90, 66, 85, 78, 94 and 85, the sum is 655 and the mean is 655 ÷ 8 ={' '}
          <strong>{fmt.sig(o(r, 'mean'), 6)}</strong>. Sorted, the two middle values are 85 and 85,
          so the median is {fmt.sig(o(r, 'median'), 6)}. 85 appears three times, so it is also the
          mode.
        </p>
      ),
    },
    {
      id: 'outlier',
      title: 'When the median tells the better story',
      body: (r, fmt) => (
        <p>
          Nine people earn $30,000 a year and one earns $5,000,000. The mean income is{' '}
          <strong>{fmt.sig(o(r, 'mean'), 6)}</strong>, more than 17 times what nine of the ten earn.
          The median is {fmt.sig(o(r, 'median'), 6)}, which describes a typical person far better.
          Reported averages for income and house prices are usually medians for this reason.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Look at both mean and median.</strong> If they differ a lot, the data are skewed or
        contain outliers. Report the median, or both, rather than the mean alone.
      </li>
      <li>
        <strong>Paste straight from a spreadsheet.</strong> Copying a column gives one value per
        line, which works as is. Labels and blank cells are skipped and listed under the result so
        you can check nothing important was dropped.
      </li>
      <li>
        <strong>For averages of rates, use the right mean.</strong> The arithmetic mean of growth
        rates or speeds over equal distances misleads. Use the compound annual growth rate for
        growth, and total distance ÷ total time for speed.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What is the difference between mean, median and mode?',
      a: 'The mean is the arithmetic average: the sum divided by the count. The median is the middle value of the sorted list. The mode is the most common value. For 2, 3, 3, 4 and 18, the mean is 6, the median 3 and the mode 3. The outlier 18 pulls only the mean up.',
    },
    {
      q: 'How do I find the median of an even number of values?',
      a: 'Sort the values and average the two in the middle. For 1, 2, 3 and 4, the middle two are 2 and 3, so the median is 2.5. With an odd number of values, the median is simply the middle one.',
    },
    {
      q: 'Should I use sample or population standard deviation?',
      a: 'Use the sample standard deviation, which divides by n − 1, when your data are a sample of a larger group, such as 20 students out of a whole school. Use the population version, dividing by n, when you have every member of the group. The sample version is slightly larger.',
    },
    {
      q: 'Can a list have more than one mode?',
      a: 'Yes. If two or more values tie for the highest count, all of them are modes. The exam scores 430, 430, 480, 480 and 495 are bimodal, with modes 430 and 480. If no value repeats, there is no mode.',
    },
  ],
  ogSample: (r, fmt) => `Mean ${fmt.sig(o(r, 'mean'), 6)}`,
};
