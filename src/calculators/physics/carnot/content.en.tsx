import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'eff') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Carnot Efficiency Calculator',
  promise: 'The maximum efficiency of a heat engine, and the best possible heat pump COP.',
  title: 'Carnot Efficiency Calculator: Heat Engine, Heat Pump COP',
  description:
    'Find the Carnot efficiency of a heat engine between two temperatures, the best possible heat pump and refrigerator COP, and the heat flows for a given work.',
  summary:
    'No heat engine running between two temperatures can beat the Carnot efficiency, 1 − T_c/T_h, with both temperatures in kelvin. A reactor boiling water at 300 °C and rejecting heat at 27 °C can convert at most 47.6% of its heat into work. Run backwards, the same temperatures set the best possible coefficient of performance for heat pumps and refrigerators.',
  synonyms: [
    'heat engine efficiency calculator',
    'maximum efficiency thermodynamics',
    'heat pump COP calculator',
    'refrigerator COP calculator',
    'second law efficiency',
    '1 - Tc/Th calculator',
  ],
  ui: {
    tempsRow: 'Reservoir temperatures',
    th: 'Hot side',
    tc: 'Cold side',
    tu: 'Unit',
    'tu.C': '°C',
    'tu.K': 'K',
    given: 'Also work out the energy',
    'given.none': 'No',
    'given.work': 'From the work per cycle',
    'given.heat': 'From the heat taken in (or delivered)',
    amount: 'Energy',
    'amount.none': 'Energy',
    'amount.work': 'Work per cycle W',
    'amount.heat': 'Heat at the hot side Q_h',
    'out.eff': 'Carnot efficiency (%)',
    'out.kP': 'Heat pump COP (best possible)',
    'out.kR': 'Refrigerator COP (best possible)',
    'out.qh': 'Heat at the hot side Q_h',
    'out.w': 'Work W',
    'out.qc': 'Heat at the cold side Q_c',
    explain:
      'At most {e}% of the heat can become work; a heat pump between these temperatures could deliver at most {kp} units of heat per unit of work.',
    'step.kelvin': 'Convert to kelvin; the formula needs absolute temperatures.',
    'step.eff': 'Carnot efficiency = 1 − T_c ÷ T_h.',
    'step.energy': 'W = e × Q_h, Q_c = Q_h − W (same units as you entered).',
    'warn.kelvin': 'Temperatures must be above absolute zero.',
    'warn.order': 'The hot side must be hotter than the cold side.',
    rounding: 'Real engines and heat pumps always do worse than these ideal limits.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Carnot efficiency">{'e = 1 − T_c ÷ T_h'}</Formula>
      <Formula label="Best coefficients of performance">
        {'heat pump: K_P = T_h ÷ (T_h − T_c)\nrefrigerator: K_R = T_c ÷ (T_h − T_c)'}
      </Formula>
      <p>
        Temperatures must be absolute: 300 °C is 573.15 K. Using Celsius gives nonsense, since a
        cold side at 0 °C would seem to allow 100% efficiency.
      </p>
      <p>
        The Carnot engine is an ideal, reversible cycle. Real plants lose more heat to friction and
        imperfect heat transfer; OpenStax notes nuclear plants reach about 35% against a 47.6%
        limit.
      </p>
    </>
  ),
  examples: [
    {
      id: 'reactor',
      title: 'A nuclear reactor: steam at 300 °C, cooling water at 27.0 °C',
      body: (r, fmt) => (
        <p>
          e = 1 − 300 ÷ 573 = <strong>{fmt.sig(o(r), 3)}%</strong>, the most any engine between
          these temperatures could achieve, as in OpenStax <em>College Physics</em> Example 15.4.
        </p>
      ),
    },
    {
      id: 'engine',
      title: 'A Carnot engine between 750 K and 300 K doing 300 J per cycle',
      body: (r, fmt) => (
        <p>
          e = <strong>{fmt.sig(o(r), 2)}%</strong>, so it takes in {fmt.sig(o(r, 'qh'), 3)} J and
          rejects {fmt.sig(o(r, 'qc'), 3)} J each cycle, as in OpenStax <em>University Physics</em>{' '}
          Example 4.2.
        </p>
      ),
    },
    {
      id: 'heatpump',
      title: 'A Carnot heat pump delivering 30.0 kJ indoors at 20 °C from 0 °C outside',
      body: (r, fmt) => (
        <p>
          It needs only <strong>{fmt.sig(o(r, 'w'), 3)} kJ</strong> of work, a COP of{' '}
          {fmt.sig(o(r, 'kP'), 3)} (University Physics Example 4.3 rounds to 2 kJ).
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Raise T_h or lower T_c</strong> to improve an engine; that is why power stations run
        steam as hot as materials allow.
      </li>
      <li>
        <strong>Heat pumps work best with a small lift:</strong> the COP grows as the indoor and
        outdoor temperatures get closer.
      </li>
      <li>
        <strong>Efficiency measures the engine, COP the pump:</strong> COP is usually above 1,
        because a heat pump moves heat rather than creating it.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do I calculate Carnot efficiency?',
      a: 'Convert both temperatures to kelvin and compute 1 − T_c/T_h. For 300 °C (573 K) and 27 °C (300 K), 1 − 300/573 = 0.476, so at most 47.6% of the heat can be turned into work.',
    },
    {
      q: 'Why must I use kelvin?',
      a: 'The efficiency depends on the ratio of absolute temperatures. Celsius has an arbitrary zero, so its ratios mean nothing: 0 °C would wrongly suggest a perfect engine. Add 273.15 to any Celsius temperature.',
    },
    {
      q: 'What is a heat pump’s coefficient of performance?',
      a: 'The heat delivered per unit of work, which for an ideal heat pump is T_h/(T_h − T_c). Between 0 °C outside and 20 °C inside it is about 14.7, so 30.0 kJ of heat needs only about 2 kJ of work.',
    },
    {
      q: 'Can a real engine reach Carnot efficiency?',
      a: 'No. The Carnot cycle is reversible and infinitely slow; real engines lose energy to friction and finite temperature differences. A coal plant converting 40.8% of its heat, as in OpenStax Example 15.3, is already a good result.',
    },
  ],
  ogSample: (r, fmt) => `300 °C and 27 °C → at most ${fmt.sig(o(r), 3)}% efficient`,
};
