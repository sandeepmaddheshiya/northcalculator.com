import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'result') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Specific Heat Calculator',
  promise: 'Heat to warm or cool something, or its specific heat, mass or final temperature.',
  title: 'Specific Heat Calculator: Q = mcΔT for Heat and Temperature',
  description:
    'Work out the heat needed to change an object’s temperature with Q = mcΔT, or find the specific heat, mass or final temperature, with common materials built in.',
  summary:
    'The heat needed to warm something is its mass times its specific heat times the temperature rise: Q = mcΔT. Specific heat is how much energy it takes to raise one kilogram by one degree; water’s is high, 4,186 J/(kg·°C), which is why it heats slowly. A negative Q means heat flows out as the object cools.',
  synonyms: [
    'Q = mcΔT calculator',
    'heat energy calculator',
    'specific heat capacity calculator',
    'how much energy to heat water',
    'thermal energy calculator',
    'calorimetry calculator',
  ],
  ui: {
    find: 'Find',
    'find.heat': 'Heat (Q)',
    'find.c': 'Specific heat (c)',
    'find.final': 'Final temperature',
    'find.mass': 'Mass',
    material: 'Material',
    'mat.water': 'Water (4,186)',
    'mat.ice': 'Ice (2,090)',
    'mat.aluminum': 'Aluminium (900)',
    'mat.copper': 'Copper (387)',
    'mat.iron': 'Iron or steel (452)',
    'mat.lead': 'Lead (128)',
    'mat.gold': 'Gold (129)',
    'mat.silver': 'Silver (235)',
    'mat.glass': 'Glass (840)',
    'mat.concrete': 'Concrete or granite (840)',
    'mat.wood': 'Wood (1,700)',
    'mat.ethanol': 'Ethanol (2,450)',
    'mat.mercury': 'Mercury (139)',
    'mat.custom': 'Other: enter c',
    c: 'Specific heat c (J/(kg·°C))',
    'c.help': 'J/(g·°C) × 1,000; water is 4.184 J/(g·°C) = 4,184 J/(kg·°C).',
    mass: 'Mass (kg)',
    t1: 'Starting temperature (°C)',
    t2: 'Final temperature (°C)',
    heat: 'Heat Q (J)',
    'out.result': 'Heat (J)',
    'out.result.heat': 'Heat Q (J)',
    'out.result.c': 'Specific heat (J/(kg·°C))',
    'out.result.final': 'Final temperature (°C)',
    'out.result.mass': 'Mass (kg)',
    'out.kj': 'Heat (kJ)',
    'out.kcal': 'Heat (kcal)',
    'out.dt': 'Temperature change (°C or K)',
    'explain.in': '{q} J of heat changes {m} kg by {dt} °C.',
    'explain.out': '{q} J of heat leaves as {m} kg changes by {dt} °C.',
    'step.heat': 'Q = mass × specific heat × temperature change.',
    'step.c': 'c = Q ÷ (m × ΔT).',
    'step.final': 'Final temperature = start + Q ÷ (m × c).',
    'step.mass': 'm = Q ÷ (c × ΔT).',
    'warn.divide': 'The mass, specific heat and temperature change must not be zero here.',
    'warn.sign':
      'A negative mass means the heat and the temperature change have opposite signs; check them.',
    rounding:
      'No phase changes (melting, boiling). kcal uses 1 cal = 4.184 J. Results keep 12 significant digits and are shown to 8.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Heat and temperature">
        {'Q = m × c × ΔT\nc = Q ÷ (m ΔT), ΔT = Q ÷ (m c)'}
      </Formula>
      <p>
        A change of 1 °C equals a change of 1 K, so either works for ΔT. The presets are from
        OpenStax <em>College Physics</em> Table 14.1, at 25 °C; OpenStax <em>Chemistry</em> lists
        the same values per gram, such as water’s 4.184 J/(g·°C). The formula assumes no melting or
        boiling: those take extra latent heat at a constant temperature.
      </p>
    </>
  ),
  examples: [
    {
      id: 'water',
      title: 'Heating 0.250 kg of water from 20 °C to 80 °C',
      body: (r, fmt) => (
        <p>
          Q = 0.250 × 4,186 × 60.0 = <strong>{fmt.sig(o(r), 5)} J</strong>, the 62.8 kJ of OpenStax{' '}
          <em>College Physics</em> Example 14.1.
        </p>
      ),
    },
    {
      id: 'pan',
      title: 'The 0.500 kg aluminium pan holding it',
      body: (r, fmt) => (
        <p>
          Q = 0.500 × 900 × 60.0 = <strong>{fmt.sig(o(r), 4)} J</strong>, or 27.0 kJ: the pan takes
          about 30% of the 89.8 kJ total.
        </p>
      ),
    },
    {
      id: 'unknown',
      title: 'Identifying a 348 g metal that absorbs 6.64 kJ',
      body: (r, fmt) => (
        <p>
          It warms from 22.4 °C to 43.6 °C, so c = 6,640 ÷ (0.348 × 21.2) ={' '}
          <strong>{fmt.sig(o(r), 4)} J/(kg·°C)</strong>, matching aluminium, as in OpenStax{' '}
          <em>Chemistry</em> Example 5.2.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Kettles and heaters:</strong> divide Q by the heater’s power in watts for the
        minimum heating time in seconds; real heating takes longer because of losses.
      </li>
      <li>
        <strong>Grams?</strong> Enter the mass in kilograms, or use J/(g·°C) × 1,000 for c.
      </li>
      <li>
        <strong>Mixing:</strong> when a hot and a cold object meet, heat lost by one equals heat
        gained by the other.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How much energy does it take to heat water?',
      a: 'About 4,186 J per kilogram per degree. Heating 1 litre (1 kg) of water from 20 °C to 100 °C takes 1 × 4,186 × 80 = 334,880 J, about 335 kJ or 0.093 kWh, before any losses to the kettle or air.',
    },
    {
      q: 'What is specific heat capacity?',
      a: 'The energy needed to raise 1 kg of a substance by 1 °C. Metals have low values, so they heat up quickly: copper needs 387 J/(kg·°C). Water needs 4,186, more than ten times as much, which is why seas warm and cool slowly.',
    },
    {
      q: 'Why is Q negative?',
      a: 'When the final temperature is below the starting one, ΔT is negative, so Q is negative: the object gives off heat. Cooling 2 kg of water by 10 °C releases about 83,720 J.',
    },
    {
      q: 'Does this work when ice melts or water boils?',
      a: 'No. During melting or boiling the temperature stays constant while energy goes into changing the state, the latent heat. Work out each stage separately: warm the ice to 0 °C, melt it, then warm the water.',
    },
  ],
  ogSample: (r, fmt) => `0.25 kg of water +60 °C → ${fmt.sig(o(r), 5)} J`,
};
