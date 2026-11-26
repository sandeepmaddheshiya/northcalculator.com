import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'p') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'One-Way ANOVA Calculator',
  promise: 'Compare the means of three or more groups: F-ratio, p-value and ANOVA table.',
  title: 'One-Way ANOVA Calculator: F-Ratio, p-Value and Table',
  description:
    'Paste the data for each group to run a one-way ANOVA: sums of squares, mean squares, the F-ratio, its p-value and critical value, and a full ANOVA table.',
  summary:
    'One-way analysis of variance tests whether several groups share the same mean. It compares the spread between group means with the spread inside the groups. When the between-group variation is large relative to the within-group variation, the F-ratio is large and the p-value small, so at least two group means differ.',
  synonyms: [
    'ANOVA calculator',
    'analysis of variance calculator',
    'F-test calculator',
    'F-ratio calculator',
    'one-way ANOVA table',
    'compare means of several groups',
  ],
  ui: {
    groups: 'Data, one group per line',
    'groups.help':
      'Separate groups with new lines or semicolons and values with spaces or commas. Groups can have different sizes.',
    alpha: 'Significance level (α)',
    'alpha.10': '0.10',
    'alpha.05': '0.05',
    'alpha.01': '0.01',
    'out.p': 'p-value',
    'out.decision': 'Decision',
    'out.f': 'F-ratio',
    'out.critical': 'Critical value of F',
    'out.dfB': 'Degrees of freedom between groups',
    'out.dfW': 'Degrees of freedom within groups',
    'decision.reject': 'Reject H₀',
    'decision.keep': 'Do not reject H₀',
    'explain.reject':
      'p = {p} is below α = {a}: at least two of the group means differ significantly.',
    'explain.keep': 'p = {p} is not below α = {a}: the data are consistent with equal group means.',
    'table.caption': 'ANOVA table (SS = sum of squares, MS = mean square)',
    'table.source': 'Source',
    'table.ss': 'SS',
    'table.df': 'df',
    'table.ms': 'MS',
    'table.f': 'F',
    'table.between': 'Between',
    'table.within': 'Within (error)',
    'table.total': 'Total',
    'step.means': 'Find each group mean and the grand mean of all values.',
    'step.ss': 'Between: Σ nⱼ(group mean − grand mean)². Within: Σ (value − its group mean)².',
    'step.f': 'Divide each sum of squares by its degrees of freedom, then divide the two.',
    'step.p': 'p-value: the right-tail area of the F distribution.',
    'warn.groups': 'Every group needs at least one number; check for stray letters or symbols.',
    'warn.k': 'Enter at least two groups, one per line.',
    'warn.n': 'You need more values than groups to estimate the variation within groups.',
    'warn.noVariance':
      'Every value equals its group mean, so the variation within groups is zero and F is undefined.',
    'warn.single':
      'A group has only one value. It adds to the between-group variation but tells you nothing about the spread inside it.',
    rounding:
      'p-values come from the incomplete beta function, accurate to about 12 digits; the critical value is solved to the same precision.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Sums of squares">
        {'SS_between = Σ nⱼ (x̄ⱼ − x̄)²\nSS_within = Σⱼ Σᵢ (xᵢⱼ − x̄ⱼ)²'}
      </Formula>
      <Formula label="F-ratio">{'F = [SS_between ÷ (k − 1)] ÷ [SS_within ÷ (N − k)]'}</Formula>
      <p>
        Here k is the number of groups and N the total number of values. The test is always
        right-tailed: only a large F counts against the hypothesis that all the group means are
        equal. The p-value is the chance of an F at least this large on (k − 1, N − k) degrees of
        freedom.
      </p>
    </>
  ),
  examples: [
    {
      id: 'nist',
      title: 'Resistor readings at three temperatures, five per group (NIST)',
      body: (r, fmt) => (
        <p>
          Group means 5.34, 7.72 and 8.56 give F = <strong>{fmt.sig(o(r, 'f'), 3)}</strong> on 2 and
          12 degrees of freedom, above the critical value {fmt.sig(o(r, 'critical'), 3)}, with p ={' '}
          {fmt.sig(o(r), 3)}, as in the NIST/SEMATECH e-Handbook.
        </p>
      ),
    },
    {
      id: 'diet',
      title: 'Weight lost on three diet plans, groups of 4, 3 and 3',
      body: (r, fmt) => (
        <p>
          F = <strong>{fmt.sig(o(r, 'f'), 4)}</strong> on 2 and 7 degrees of freedom, with p ={' '}
          {fmt.sig(o(r), 3)}: no evidence that the plans differ, matching the F-ratio in OpenStax{' '}
          <em>Introductory Statistics</em> Example 13.1.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Check the assumptions:</strong> each population roughly normal, samples random and
        independent, and similar standard deviations in every group.
      </li>
      <li>
        <strong>A significant F does not say which groups differ:</strong> the alternative is only
        that at least two means are unequal, so follow up with comparisons between pairs.
      </li>
      <li>
        <strong>Two groups:</strong> with only two groups, F equals the square of the pooled
        two-sample t statistic, so both tests give the same p-value.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate a one-way ANOVA by hand?',
      a: 'Find each group mean and the grand mean. Add up nⱼ(group mean − grand mean)² for the between-group sum of squares and every (value − group mean)² for the within-group sum. Divide each by its degrees of freedom, k − 1 and N − k, then divide the two mean squares to get F.',
    },
    {
      q: 'What are the hypotheses of a one-way ANOVA?',
      a: 'The null hypothesis is that all the group means are equal. The alternative is that at least two of them differ. Rejecting the null does not say which pairs differ or by how much, only that the means are not all the same.',
    },
    {
      q: 'How do I read the F critical value?',
      a: 'Reject the null hypothesis when F exceeds the critical value for your α and degrees of freedom. For 2 and 12 degrees of freedom at α = 0.05, the NIST table gives 3.885, so the resistor example’s F of 9.59 is significant.',
    },
    {
      q: 'Can the groups have different sizes?',
      a: 'Yes. One-way ANOVA weights each group mean by its size, so unequal groups are fine. The diet example uses groups of 4, 3 and 3, so the within-group degrees of freedom are the 10 values minus the 3 groups, or 7.',
    },
    {
      q: 'What assumptions does one-way ANOVA make?',
      a: 'Each population the groups come from is normal, the samples are random and independent, and the populations share the same standard deviation. The factor that defines the groups is categorical, and the response you measure is numerical.',
    },
  ],
  ogSample: (r, fmt) =>
    `Resistors at three temperatures → F = ${fmt.sig(o(r, 'f'), 3)}, p = ${fmt.sig(o(r), 3)}`,
};
