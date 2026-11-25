import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'result') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Buffer pH Calculator',
  promise: 'Buffer pH by Henderson–Hasselbalch, before and after adding acid or base.',
  title: 'Buffer pH Calculator: Henderson–Hasselbalch Equation',
  description:
    'Find the pH of a buffer from its weak acid and conjugate base, see how it shifts when strong acid or base is added, or get the ratio needed for a target pH.',
  summary:
    'A buffer is a weak acid mixed with its conjugate base, and it resists changes in pH. Its pH follows the Henderson–Hasselbalch equation: pH = pKa + log([A⁻] ÷ [HA]). Equal amounts give pH = pKa. Adding a strong acid turns some base into acid, and the pH falls only slightly, as long as both parts remain present.',
  synonyms: [
    'Henderson-Hasselbalch calculator',
    'buffer solution calculator',
    'pH of a buffer',
    'acetate buffer pH',
    'buffer ratio calculator',
    'pKa and pH calculator',
  ],
  ui: {
    find: 'Solve for',
    'find.ph': 'Buffer pH',
    'find.ratio': 'Ratio for a target pH',
    kRow: 'Acid strength',
    kt: 'Given as',
    'kt.pka': 'pKa',
    'kt.ka': 'Ka',
    'kt.pkb': 'pKb of the base',
    k: 'Value',
    'k.pka': 'pKa',
    'k.ka': 'Ka (e.g. 1.8e-5)',
    'k.pkb': 'pKb',
    acid: 'Weak acid, HA',
    'acid.ph': 'Weak acid, HA',
    'acid.ratio': 'Weak acid amount (optional)',
    'acid.help':
      'Moles, or molarity if both parts are in the same solution. Only the ratio matters.',
    base: 'Conjugate base, A⁻',
    added: 'Then add',
    'added.none': 'Nothing',
    'added.acid': 'Strong acid (e.g. HCl)',
    'added.base': 'Strong base (e.g. NaOH)',
    amount: 'Amount added',
    'amount.help': 'In the same units as the acid and base: moles with moles.',
    target: 'Target pH',
    'out.result': 'Result',
    'out.result.ph': 'pH',
    'out.result.ratio': 'Base-to-acid ratio [A⁻] ÷ [HA]',
    'out.pKa': 'pKa',
    'out.ratio': 'Base-to-acid ratio',
    'out.baseNeeded': 'Base needed for that much acid',
    'out.before': 'pH before the addition',
    'out.low': 'Effective range from pH',
    'out.high': 'Effective range to pH',
    'explain.ph': 'The buffer sits at pH {pH}, with a base-to-acid ratio of {r}.',
    'explain.ratio': 'A base-to-acid ratio of {r} gives pH {pH}.',
    'step.pka': 'pKa = −log Ka.',
    'step.pkb': 'For a weak base, the conjugate acid’s pKa = 14.00 − pKb (25 °C).',
    'step.addAcid': 'The strong acid converts the same amount of A⁻ into HA.',
    'step.addBase': 'The strong base converts the same amount of HA into A⁻.',
    'step.hh': 'pH = pKa + log([A⁻] ÷ [HA]).',
    'step.ratio': '[A⁻] ÷ [HA] = 10^(pH − pKa).',
    'step.base': 'Base needed = acid × ratio.',
    'warn.ka': 'Ka must be above zero.',
    'warn.negative': 'Amounts cannot be negative.',
    'warn.empty': 'Enter amounts of both the weak acid and its conjugate base.',
    'warn.exceeded':
      'The added acid or base uses up one buffer component completely: the buffer capacity is exceeded, so this equation no longer applies.',
    'warn.range':
      'The ratio is outside 0.1 to 10 (pH outside pKa ± 1), where the buffer works poorly and the equation is less accurate.',
    rounding: 'pKw is taken as 14.00 (25 °C). Results are shown to 6 significant figures.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Henderson–Hasselbalch">{'pH = pKa + log([A⁻] ÷ [HA])'}</Formula>
      <Formula label="Ratio for a target pH">{'[A⁻] ÷ [HA] = 10^(pH − pKa)'}</Formula>
      <p>
        Because both parts share the same volume, moles work as well as concentrations. A strong
        acid added reacts with the base, A⁻ + H₃O⁺ → HA + H₂O, so the base goes down and the acid up
        by the amount added; a strong base does the reverse.
      </p>
      <p>
        The equation assumes the weak acid barely ionizes. It works best when both components are
        far more concentrated than Ka and within a factor of 10 of each other, which is also the
        range where a buffer is useful: pKa ± 1.
      </p>
    </>
  ),
  examples: [
    {
      id: 'acetate',
      title: 'Acetate buffer: 0.0100 mol each, then 1.0 × 10⁻⁴ mol NaOH',
      body: (r, fmt) => (
        <p>
          The buffer starts at pKa = −log(1.8 × 10⁻⁵) = 4.74. NaOH turns 0.0001 mol of acid into
          acetate, giving 0.0099 and 0.0101 mol and a pH of only <strong>{fmt.num(o(r), 2)}</strong>
          , as in OpenStax <em>Chemistry 2e</em> Example 14.20. The same NaOH in unbuffered water at
          pH 4.74 would raise it to 10.99.
        </p>
      ),
    },
    {
      id: 'blood',
      title: 'Blood: 0.024 M bicarbonate and 0.0012 M carbonic acid, pKa 6.1',
      body: (r, fmt) => (
        <p>
          pH = 6.1 + log 20 = <strong>{fmt.num(o(r), 2)}</strong>, the normal blood pH, as the
          LibreTexts buffer page works it. OpenStax uses pKa 6.4 for body temperature and gets 7.7.
        </p>
      ),
    },
    {
      id: 'ammonia',
      title: 'Ammonia buffer at pH 8.6 (NH₃ pKb 4.74)',
      body: (r, fmt) => (
        <p>
          pKa = 14.00 − 4.74 = 9.26, so [NH₃] ÷ [NH₄⁺] = 10^(8.6 − 9.26) ={' '}
          <strong>{fmt.sig(o(r), 3)}</strong>. With 0.323 M NH₃ you need about 1.48 M NH₄⁺, as in
          the LibreTexts Henderson–Hasselbalch examples.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Pick an acid with pKa near the pH you want.</strong> Acetic acid (4.74) buffers
        around pH 3.7–5.7; ammonium (9.26) around 8.3–10.3.
      </li>
      <li>
        <strong>Concentration sets capacity, not pH.</strong> Diluting a buffer leaves its pH almost
        unchanged but lets less acid or base be absorbed.
      </li>
      <li>
        <strong>Temperature matters:</strong> pKa values and pKw change with temperature, so lab
        buffers are prepared at the temperature they will be used.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate the pH of a buffer?',
      a: 'Add pKa to the log of the base-to-acid ratio: pH = pKa + log([A⁻] ÷ [HA]). For 0.10 M acetic acid and 0.10 M sodium acetate the ratio is 1 and log 1 = 0, so the pH equals the pKa, 4.74.',
    },
    {
      q: 'How do I find pKa from Ka?',
      a: 'Take the negative logarithm: pKa = −log Ka. For acetic acid, Ka = 1.8 × 10⁻⁵ gives pKa = 4.74. For a buffer made from a weak base such as ammonia, use the conjugate acid: pKa = 14.00 − pKb, so pKb 4.74 gives 9.26.',
    },
    {
      q: 'What happens when acid is added to a buffer?',
      a: 'The conjugate base neutralizes it, turning into more weak acid. Adding 1.0 × 10⁻⁴ mol of NaOH to 100 mL of 0.10 M acetate buffer moves the pH only from 4.74 to 4.75; the same base in unbuffered water at pH 4.74 would raise it to 10.99.',
    },
    {
      q: 'What ratio do I need for a given pH?',
      a: 'Use [A⁻] ÷ [HA] = 10^(pH − pKa). For an acetate buffer at pH 5.0 with pKa 4.74, that is 10^0.26 ≈ 1.8, so about 1.8 times as much acetate as acetic acid.',
    },
  ],
  ogSample: (r, fmt) => `Acetate buffer + NaOH → pH ${fmt.num(o(r), 2)}`,
};
