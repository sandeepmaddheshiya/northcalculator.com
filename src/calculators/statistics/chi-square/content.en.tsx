import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'p') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Chi-Square Test Calculator',
  promise: 'Goodness-of-fit and independence tests: χ², degrees of freedom and p-value.',
  title: 'Chi-Square Test Calculator: Goodness of Fit and Independence',
  description:
    'Run a chi-square goodness-of-fit test against equal shares, counts or percentages, or a test of independence on a contingency table, with the p-value.',
  summary:
    'A chi-square test compares observed counts with the counts you would expect if a hypothesis were true. Each category adds (observed − expected)² ÷ expected; a large total means the data fit poorly. Use goodness of fit for one variable against a claimed distribution, and the test of independence for whether two variables in a table are related.',
  synonyms: [
    'chi-square goodness of fit calculator',
    'chi-square test of independence calculator',
    'contingency table calculator',
    'chi square p-value calculator',
    'expected frequency calculator',
    'chi-squared test',
  ],
  ui: {
    mode: 'Test',
    'mode.gof': 'Goodness of fit',
    'mode.independence': 'Independence',
    observed: 'Observed counts',
    'observed.help': 'One count per category, separated by commas or spaces.',
    expected: 'Expected distribution',
    'expected.equal': 'Equal in every category',
    'expected.percent': 'Percentages or proportions',
    'expected.counts': 'Expected counts',
    exp: 'Expected values',
    'exp.equal': 'Expected values',
    'exp.percent': 'Expected percentages, same order',
    'exp.counts': 'Expected counts, same order',
    'exp.help': 'They are rescaled to the observed total if they do not add up to it.',
    table: 'Contingency table',
    'table.help':
      'One row per line or separated by semicolons; cells separated by spaces or commas.',
    alpha: 'Significance level (α)',
    'alpha.10': '0.10',
    'alpha.05': '0.05',
    'alpha.01': '0.01',
    'out.p': 'p-value',
    'out.decision': 'Decision',
    'out.chi2': 'Chi-square statistic (χ²)',
    'out.df': 'Degrees of freedom',
    'out.critical': 'Critical value',
    'out.minE': 'Smallest expected count',
    'decision.reject': 'Reject H₀',
    'decision.keep': 'Do not reject H₀',
    'explain.reject':
      'p = {p} is below α = {a}: the observed counts differ significantly from what H₀ predicts.',
    'explain.keep': 'p = {p} is not below α = {a}: the counts are consistent with H₀.',
    'table.caption': 'Observed and expected counts',
    'table.category': 'Category',
    'table.cell': 'Cell',
    'table.obs': 'Observed',
    'table.exp': 'Expected',
    'table.contrib': '(O − E)² ÷ E',
    'step.expInd': 'Expected count = row total × column total ÷ grand total.',
    'step.rescale': 'Expected values rescaled to the observed total.',
    'step.chi': 'Add (observed − expected)² ÷ expected over every cell.',
    'step.df': 'Goodness of fit: categories − 1. Independence: (rows − 1)(columns − 1).',
    'step.p': 'p-value: the right-tail area of the chi-square distribution.',
    'warn.observed': 'Enter at least two non-negative counts.',
    'warn.size': 'A test needs at least two categories, or a table of at least 2 × 2.',
    'warn.expLength': 'Enter one expected value for each observed count.',
    'warn.expZero': 'Expected values must all be above zero.',
    'warn.table': 'Every row needs the same number of non-negative counts.',
    'warn.zeroTotal': 'A row or column adds up to zero; remove it.',
    'warn.small':
      'The smallest expected count is {m}. The test is reliable when every expected count is at least 5; combine small categories.',
    rounding: 'p-values come from the incomplete gamma function, accurate to about 12 digits.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Test statistic">{'χ² = Σ (O − E)² ÷ E'}</Formula>
      <Formula label="Expected counts">
        {'goodness of fit: n × claimed proportion\nindependence: row total × column total ÷ n'}
      </Formula>
      <Formula label="Degrees of freedom">
        {'goodness of fit: k − 1\nindependence: (r − 1)(c − 1)'}
      </Formula>
      <p>
        The test is always right-tailed: only large values of χ² count against the hypothesis. It
        works with counts, not percentages or means, and each observation must fall in exactly one
        category.
      </p>
    </>
  ),
  examples: [
    {
      id: 'streaming',
      title: 'Streaming services: 600 western families vs national percentages',
      body: (r, fmt) => (
        <p>
          Expected counts 60, 96, 330, 66 and 48 give χ² = {fmt.sig(o(r, 'chi2'), 4)} on 4 degrees
          of freedom and p = <strong>{fmt.sig(o(r), 2)}</strong>, so the distribution differs at the
          1% level, as in OpenStax <em>Introductory Statistics</em> Example 11.3.
        </p>
      ),
    },
    {
      id: 'absences',
      title: 'Absent days: 15, 12, 9, 9, 15 against equal frequencies',
      body: (r, fmt) => (
        <p>
          With 12 expected each, χ² = {fmt.sig(o(r, 'chi2'), 3)} and p ={' '}
          <strong>{fmt.sig(o(r), 4)}</strong>: no evidence that absences are uneven (Example 11.2).
        </p>
      ),
    },
    {
      id: 'volunteer',
      title: 'Volunteer hours by type of volunteer (3 × 3 table)',
      body: (r, fmt) => (
        <p>
          χ² = {fmt.sig(o(r, 'chi2'), 4)} on 4 degrees of freedom gives p ={' '}
          <strong>{fmt.sig(o(r), 3)}</strong>: hours and volunteer type are related at the 5% level
          (Example 11.6).
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Expected counts of 5 or more:</strong> combine sparse categories before testing, as
        OpenStax merges the 9–11 and 12+ absence groups.
      </li>
      <li>
        <strong>Related is not causal:</strong> a significant test of independence shows an
        association, not which variable drives the other.
      </li>
      <li>
        <strong>Estimated parameters cost degrees of freedom:</strong> when testing fit to a
        distribution whose parameters you estimated from the data, subtract one df for each.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate a chi-square statistic?',
      a: 'For each category, subtract the expected count from the observed, square it, divide by the expected count, and add them up. For 15, 12, 9, 9, 15 absences against 12 each, the terms are 0.75, 0, 0.75, 0.75, 0.75, so χ² = 3.',
    },
    {
      q: 'What is the difference between goodness of fit and independence?',
      a: 'Goodness of fit tests one categorical variable against a claimed distribution, such as a fair die. The test of independence uses a two-way table to test whether two categorical variables, such as type of volunteer and hours, are related.',
    },
    {
      q: 'How are degrees of freedom found?',
      a: 'For goodness of fit, the number of categories minus one. For a contingency table, (rows − 1) × (columns − 1). A 3 × 3 table has 4 degrees of freedom, and its critical value at α = 0.05 is 9.488.',
    },
    {
      q: 'Why must expected counts be at least 5?',
      a: 'The chi-square distribution is only an approximation to the exact distribution of the statistic, and it breaks down when expected counts are small. Combine neighbouring categories, or use an exact test for small tables.',
    },
  ],
  ogSample: (r, fmt) => `Streaming survey vs national shares → p = ${fmt.sig(o(r), 2)}`,
};
