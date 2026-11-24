import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'max') => r.outputs[k];

export const content: CalculatorContent = {
  name: 'Heart Rate Zone Calculator',
  promise: 'Your estimated maximum heart rate and target zones for moderate and vigorous exercise.',
  title: 'Heart Rate Zone Calculator: Target and Max Heart Rate',
  description:
    'Estimate your maximum heart rate from your age and see target heart rate zones for moderate and vigorous exercise, following the American Heart Association.',
  summary:
    'Maximum heart rate is the highest number of beats per minute your heart reaches during all-out effort. The American Heart Association estimates it as 220 minus your age. Moderate exercise is about 50–70% of that maximum and vigorous exercise about 70–85%. A 2001 analysis of over 18,000 people proposed 208 − 0.7 × age, which gives higher values for older adults.',
  synonyms: [
    'target heart rate calculator',
    'max heart rate calculator',
    'heart rate training zones',
    'exercise heart rate',
    'fat burning heart rate',
    'cardio zone calculator',
  ],
  ui: {
    age: 'Age (years)',
    formula: 'Maximum heart rate formula',
    'formula.aha': '220 − age (AHA)',
    'formula.tanaka': '208 − 0.7 × age (Tanaka)',
    'formula.help':
      'The American Heart Association chart uses 220 − age. Tanaka and colleagues found 208 − 0.7 × age fits measured maximums better, especially after 40.',
    'out.max': 'Estimated maximum heart rate (bpm)',
    'out.moderate': 'Moderate intensity (50–70%)',
    'out.vigorous': 'Vigorous intensity (70–85%)',
    'out.target': 'Target zone (50–85%)',
    explain:
      'With an estimated maximum of {max} beats per minute, moderate exercise is about {mod} and vigorous exercise about {vig}.',
    'step.aha': 'Estimate the maximum: 220 minus your age.',
    'step.tanaka': 'Estimate the maximum: 208 minus 0.7 times your age.',
    'step.percent': 'Multiply the maximum by each percentage and round to whole beats per minute.',
    'table.caption': 'Heart rate at each percentage of your estimated maximum',
    'table.pct': '% of maximum',
    'table.bpm': 'Beats per minute',
    'table.zone': 'Intensity',
    'zone.moderate': 'Moderate',
    'zone.vigorous': 'Vigorous',
    'zone.above': 'Above the target zone',
    'warn.medication':
      'Some medicines, including beta blockers, lower the heart rate and make these targets unreliable. If you have a heart condition or take regular medication, ask your doctor for your own targets.',
    'warn.young':
      'These formulas were developed for adults. Children and teenagers usually have higher maximum heart rates.',
    rounding:
      'Beats per minute are rounded half-up to whole numbers, the same rounding as the American Heart Association chart.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Estimated maximum heart rate">
        {'AHA:     HRmax = 220 − age\nTanaka:  HRmax = 208 − 0.7 × age'}
      </Formula>
      <Formula label="Target zones (American Heart Association)">
        {'moderate   50–70% × HRmax\nvigorous   70–85% × HRmax'}
      </Formula>
      <p>
        The AHA chart lists a 35-year-old’s maximum as 185 bpm and target zone as 93–157 bpm: 185 ×
        0.50 = 92.5, which rounds to 93, and 185 × 0.85 = 157.25, which rounds to 157.
      </p>
      <p>
        Tanaka, Monahan and Seals pooled 351 studies with 18,712 subjects and confirmed the result
        in a laboratory study of 514 healthy adults. Their equation was the same for men and women
        and did not depend on fitness. It agrees with 220 − age at 40 but gives higher maximums for
        older adults: at 70 it predicts 159 bpm instead of 150.
      </p>
      <p>
        Both are population averages. An individual’s true maximum can be well above or below the
        estimate, and only a supervised maximal exercise test measures it directly.
      </p>
    </>
  ),
  examples: [
    {
      id: 'aha',
      title: 'A 35-year-old using the AHA chart',
      body: (r) => (
        <p>
          220 − 35 = <strong>{String(o(r))} bpm</strong>. The target zone from 50% to 85% is{' '}
          {String(o(r, 'target'))}, exactly the row for 35 years in the American Heart Association
          chart. Moderate exercise like brisk walking should put the heart at{' '}
          {String(o(r, 'moderate'))}.
        </p>
      ),
    },
    {
      id: 'older',
      title: 'A 65-year-old with the Tanaka equation',
      body: (r) => (
        <p>
          208 − 0.7 × 65 = 162.5, rounded to <strong>{String(o(r))} bpm</strong>. The AHA formula
          gives 155, so the Tanaka targets are about 5% higher: vigorous exercise is{' '}
          {String(o(r, 'vigorous'))} instead of 109–132.
        </p>
      ),
    },
    {
      id: 'young',
      title: 'A 20-year-old',
      body: (r) => (
        <p>
          The estimated maximum is <strong>{String(o(r))} bpm</strong>, so moderate exercise is{' '}
          {String(o(r, 'moderate'))} and the full target zone is {String(o(r, 'target'))}, matching
          the AHA chart’s first row.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Use one formula consistently.</strong> Switching between 220 − age and Tanaka moves
        every zone by a few beats. Pick one and keep it so your training records stay comparable.
      </li>
      <li>
        <strong>Check your pulse properly.</strong> Count beats at the wrist or neck for 15 seconds
        and multiply by 4, or read it from a heart rate monitor.
      </li>
      <li>
        <strong>Zones are estimates.</strong> They come from population averages. If a zone feels
        far too easy or too hard, your own maximum is probably different from the estimate.
      </li>
      <li>
        <strong>Medical conditions change the numbers.</strong> Heart disease, pregnancy and some
        medicines alter heart rate responses. Follow your doctor’s targets if you have them.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What should my heart rate be when exercising?',
      a: 'For moderate exercise, aim for about 50–70% of your maximum heart rate; for vigorous exercise, about 70–85%, according to the American Heart Association. For a 40-year-old with an estimated maximum of 180 bpm, that is 90–126 bpm for moderate and 126–153 bpm for vigorous activity.',
    },
    {
      q: 'Is 220 minus age accurate?',
      a: 'It is a rough average. Tanaka and colleagues found that 208 − 0.7 × age fits measured maximums better and that 220 − age underestimates the maximum in older adults. For any one person, the true maximum can differ noticeably from either estimate.',
    },
    {
      q: 'What is the fat-burning zone?',
      a: 'Fitness devices often use the name for the lower part of the range, roughly the moderate zone of 50–70% of maximum heart rate. The sources used here describe only moderate and vigorous intensity, so this calculator sticks to those terms and does not label a separate fat-burning zone.',
    },
    {
      q: 'Is it dangerous to exceed my maximum heart rate?',
      a: 'The calculated maximum is only an estimate, so healthy people sometimes exceed it briefly in hard efforts. If you feel chest pain, dizziness, unusual breathlessness or an irregular heartbeat, stop exercising and seek medical advice. People with heart conditions should follow targets set by their doctor.',
    },
  ],
  ogSample: (r) => `Max heart rate ${String(o(r))} bpm`,
};
