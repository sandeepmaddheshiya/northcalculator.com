import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'kcal') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Calories Burned Calculator',
  promise: 'Estimate the calories an activity burns from its MET value, your weight and the time.',
  title: 'Calories Burned Calculator: Exercise Calories by MET Value',
  description:
    'Estimate calories burned walking, running, cycling, swimming, yoga and more, from your weight and the activity’s MET value in the 2024 Compendium.',
  summary:
    'A MET (metabolic equivalent) compares an activity’s energy cost with sitting quietly. The Compendium of Physical Activities defines one MET as 1 kilocalorie per kilogram of body weight per hour, so calories burned are the MET value times your weight in kilograms times the hours. Brisk walking at about 3 mph is 3.8 METs: a 70 kg person burns about 133 kcal in 30 minutes.',
  synonyms: [
    'exercise calorie calculator',
    'MET calculator',
    'calories burned walking',
    'calories burned running',
    'activity calorie calculator',
    'workout calories',
  ],
  ui: {
    activity: 'Activity',
    'act.07021': 'Sitting quietly (1.0 MET)',
    'act.02150': 'Yoga, hatha (2.3 MET)',
    'act.17170': 'Walking, 2.5 mph, level (3.0 MET)',
    'act.17190': 'Walking, 2.8–3.4 mph, moderate pace (3.8 MET)',
    'act.18292': 'Swimming, front crawl, slow, moderate effort (5.8 MET)',
    'act.01030': 'Bicycling, 12–13.9 mph, moderate effort (8.0 MET)',
    'act.18290': 'Swimming, front crawl, ~50 yd/min, vigorous (8.0 MET)',
    'act.12050': 'Running, 6–6.3 mph, 10 min/mile (9.3 MET)',
    'act.12120': 'Running, 10 mph, 6 min/mile (14.8 MET)',
    'act.custom': 'Other: enter a MET value',
    met: 'MET value',
    'met.help':
      'Look up your activity in the Compendium of Physical Activities at pacompendium.com.',
    minutes: 'Duration (minutes)',
    unit: 'Weight unit',
    'unit.kg': 'kg',
    'unit.lb': 'lb',
    'weight.kg': 'Body weight (kg)',
    'weight.lb': 'Body weight (lb)',
    'out.kcal': 'Calories burned (kcal)',
    'out.net': 'Above resting (net kcal)',
    'out.perHour': 'Calories per hour',
    'out.met': 'MET value used',
    explain:
      '{min} minutes at {met} METs burns about {kcal} kcal, including what your body uses at rest.',
    'step.kg': 'Convert pounds to kilograms.',
    'step.kcal': 'kcal = MET × weight in kg × hours.',
    'warn.estimate':
      'MET values are averages for adults aged 19 to 59. Actual energy use varies with fitness, body composition, technique and terrain.',
    rounding: 'Calculated exactly and rounded to whole kilocalories.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Energy from METs">{'kcal = MET × body weight (kg) × time (hours)'}</Formula>
      <p>
        The Compendium of Physical Activities lists measured or estimated MET values for over a
        thousand activities. It defines one MET as 1 kcal per kilogram per hour, roughly the cost of
        sitting quietly, or equivalently an oxygen uptake of 3.5 mL per kilogram per minute. An
        activity of 8 METs costs eight times as much energy as sitting.
      </p>
      <p>
        The total includes the energy you would have used anyway. Subtracting one MET gives the
        extra, or net, calories due to the activity, which is the better figure when comparing
        exercise sessions or adding exercise to a daily energy estimate.
      </p>
    </>
  ),
  examples: [
    {
      id: 'walk',
      title: 'A 30-minute brisk walk at 70 kg',
      body: (r) => (
        <p>
          Walking at 2.8 to 3.4 mph is 3.8 METs (code 17190). 3.8 × 70 × 0.5 ={' '}
          <strong>{o(r)} kcal</strong>, of which {o(r, 'net')} kcal are above resting.
        </p>
      ),
    },
    {
      id: 'run',
      title: 'A 45-minute run at 10 min/mile, 180 lb',
      body: (r) => (
        <p>
          180 lb is 81.65 kg. Running at 6 to 6.3 mph is 9.3 METs (code 12050), so 9.3 × 81.65 ×
          0.75 = <strong>{o(r)} kcal</strong>, about {o(r, 'perHour')} kcal an hour.
        </p>
      ),
    },
    {
      id: 'yoga',
      title: 'An hour of hatha yoga at 60 kg',
      body: (r) => (
        <p>
          Hatha yoga is 2.3 METs (code 02150): 2.3 × 60 × 1 = <strong>{o(r)} kcal</strong>. Only{' '}
          {o(r, 'net')} kcal of that is extra compared with sitting still.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Treat it as an estimate.</strong> Two people of the same weight can differ by a
        meaningful amount for the same activity, depending on fitness and technique.
      </li>
      <li>
        <strong>Use net calories for diet planning.</strong> Your daily calorie estimate already
        includes resting energy, so add only the net figure for exercise.
      </li>
      <li>
        <strong>Count active time.</strong> Use the minutes you were actually moving, not the time
        at the gym including rests.
      </li>
      <li>
        <strong>Find other activities</strong> in the Compendium and enter their MET value with the
        Other option.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate calories burned from METs?',
      a: 'Multiply the MET value by your weight in kilograms and by the time in hours. Cycling at 12 to 14 mph is 8 METs, so a 75 kg rider burns 8 × 75 × 1.5 = 900 kcal in 90 minutes.',
    },
    {
      q: 'What does MET mean?',
      a: 'MET stands for metabolic equivalent of task: the energy cost of an activity divided by the cost of sitting quietly. The Compendium of Physical Activities sets one MET at 1 kcal per kilogram per hour, so 4 METs uses four times the energy of rest.',
    },
    {
      q: 'Why does a heavier person burn more calories?',
      a: 'Moving a larger body takes more energy, and the MET formula scales directly with weight. At the same 3.8 METs, a 90 kg walker burns about 171 kcal in 30 minutes compared with 133 kcal for someone weighing 70 kg.',
    },
    {
      q: 'Are fitness tracker calorie numbers more accurate?',
      a: 'Trackers combine heart rate, motion and personal data, and can be closer for steady activities, but they also estimate rather than measure. Neither a MET calculation nor a wrist device measures energy use directly; laboratory calorimetry does.',
    },
  ],
  ogSample: (r) => `30 min walk ≈ ${o(r)} kcal`,
};
