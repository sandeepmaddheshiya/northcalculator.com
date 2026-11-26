import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'p') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Paired t-Test Calculator',
  promise: 'Before-and-after or matched-pair data: mean difference, t, p-value and decision.',
  title: 'Paired t-Test Calculator: Before and After, Matched Pairs',
  description:
    'Run a paired t-test on before-and-after or matched data: paste both lists or the differences’ summary for the mean difference, t, p-value and decision.',
  summary:
    'A paired t-test compares two measurements on the same subjects, such as pain before and after treatment. It works on each subject’s difference, removing the variation between subjects, and tests whether the mean difference is zero with t = d̄ ÷ (s_d ÷ √n). It is usually far more sensitive than treating the two lists as independent samples.',
  synonyms: [
    'matched pairs t test calculator',
    'before and after t test',
    'dependent samples t test',
    'paired samples t test',
    'repeated measures t test two groups',
    'mean difference test',
  ],
  ui: {
    mode: 'Enter',
    'mode.data': 'Both lists',
    'mode.summary': 'Summary of differences',
    first: 'First measurement (before)',
    'first.help': 'Same order as the second list; each position is one subject.',
    second: 'Second measurement (after)',
    n: 'Number of pairs (n)',
    mean: 'Mean difference d̄ (second − first)',
    sd: 'Standard deviation of the differences s_d',
    mu: 'Hypothesized mean difference μ_d',
    tail: 'Alternative hypothesis',
    'tail.two': 'μ_d ≠ 0 (two-tailed)',
    'tail.right': 'μ_d > 0: second is higher',
    'tail.left': 'μ_d < 0: second is lower',
    alpha: 'Significance level (α)',
    'alpha.10': '0.10',
    'alpha.05': '0.05',
    'alpha.01': '0.01',
    'out.p': 'p-value',
    'out.decision': 'Decision',
    'out.t': 't statistic',
    'out.df': 'Degrees of freedom',
    'out.critical': 'Critical value',
    'out.mean': 'Mean difference d̄',
    'out.sd': 'SD of the differences',
    'decision.reject': 'Reject H₀',
    'decision.keep': 'Do not reject H₀',
    'explain.reject': 'p = {p} is below α = {a}: the data support μ_d {sym} {mu}.',
    'explain.keep': 'p = {p} is not below α = {a}: not enough evidence that μ_d {sym} {mu}.',
    'step.diffs': 'Differences, second − first.',
    'step.mean': 'Mean and standard deviation of the differences.',
    'step.t': 't = (d̄ − μ_d) ÷ (s_d ÷ √n).',
    'step.p.two': 'Two-tailed p-value with n − 1 degrees of freedom.',
    'step.p.right': 'Right-tailed p-value with n − 1 degrees of freedom.',
    'step.p.left': 'Left-tailed p-value with n − 1 degrees of freedom.',
    'warn.length': 'Both lists need the same number of values, one per subject.',
    'warn.two': 'A paired test needs at least two pairs.',
    'warn.sd': 'The differences must vary; a standard deviation of zero gives no test.',
    'warn.small':
      'With fewer than 30 pairs the test assumes the differences are roughly normal. Check for outliers.',
    rounding: 'p-values are exact to about 12 digits and shown to 6 significant figures.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Differences">{'dᵢ = secondᵢ − firstᵢ'}</Formula>
      <Formula label="Test statistic">{'t = (d̄ − μ_d) ÷ (s_d ÷ √n),  df = n − 1'}</Formula>
      <p>
        After taking differences the problem becomes a one-sample t-test on them. The sign of d̄
        follows from the order: second minus first, so a negative mean means the second measurement
        is lower.
      </p>
      <p>
        Pairing must come from the design: the same person measured twice, or twins, or matched
        plots. Pairing unrelated values gives a meaningless result.
      </p>
    </>
  ),
  examples: [
    {
      id: 'hypnosis',
      title: 'Pain scores of 8 people before and after hypnosis',
      body: (r, fmt) => (
        <p>
          The mean change is {fmt.sig(o(r, 'mean'), 3)}, t = {fmt.sig(o(r, 't'), 4)} on 7 degrees of
          freedom, and the left-tailed p = <strong>{fmt.sig(o(r), 2)}</strong>: pain is
          significantly lower, as in OpenStax <em>Introductory Statistics</em> Example 10.11.
        </p>
      ),
    },
    {
      id: 'training',
      title: '20 employees, scores up 3.5 points on average (s_d = 3.8)',
      body: (r, fmt) => (
        <p>
          t = 3.5 ÷ (3.8 ÷ √20) = {fmt.sig(o(r, 't'), 3)}, giving p ={' '}
          <strong>{fmt.sig(o(r), 2)}</strong>: the training raised scores, as in OpenStax{' '}
          <em>Introductory Business Statistics</em> Example 10.9.
        </p>
      ),
    },
    {
      id: 'bench',
      title: 'Bench press of 4 players before and after a strength class',
      body: (r, fmt) => (
        <p>
          Differences 90, 11, −8 and −8 average {fmt.sig(o(r, 'mean'), 3)} but vary widely: t ={' '}
          {fmt.sig(o(r, 't'), 2)}, p = <strong>{fmt.sig(o(r), 3)}</strong>, not significant.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Paired or independent?</strong> If each value in one list belongs with a specific
        value in the other, use this test; otherwise use the two-sample t-test.
      </li>
      <li>
        <strong>Watch for outliers:</strong> one large difference, like the 90 in the bench-press
        example, can dominate a small sample.
      </li>
      <li>
        <strong>Check the order:</strong> entering after-minus-before or before-minus-after flips
        the sign of t; choose the alternative to match.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I do a paired t-test?',
      a: 'Subtract each subject’s first value from the second, find the mean and standard deviation of those differences, and compute t = d̄ ÷ (s_d ÷ √n) with n − 1 degrees of freedom. For the hypnosis data, d̄ = −3.125, s_d = 2.91 and t = −3.04 on 7 df, so p ≈ 0.0095.',
    },
    {
      q: 'When should I use a paired t-test instead of a two-sample t-test?',
      a: 'When the two sets of measurements are linked, as in before-and-after on the same people or matched twins. Pairing removes the differences between subjects, which usually makes the test much more sensitive.',
    },
    {
      q: 'What are the degrees of freedom?',
      a: 'The number of pairs minus one. Eight before-and-after pairs give 7 degrees of freedom; 20 employees measured twice give 19. Count pairs, not individual measurements, because the test works on one difference per pair.',
    },
    {
      q: 'What does the hypothesized mean difference do?',
      a: 'Usually it is 0, testing for any change. Set it to another value to test a specific claim, such as an improvement of at least 2 points, using the matching one-tailed alternative.',
    },
  ],
  ogSample: (r, fmt) => `Pain before vs after hypnosis → p = ${fmt.sig(o(r), 2)}`,
};
