import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'result') => r.outputs[k];

export const content: CalculatorContent = {
  name: 'Density Calculator',
  promise: 'Density from mass and volume, or mass or volume from the density.',
  title: 'Density Calculator: Density, Mass and Volume (ρ = m/V)',
  description:
    'Find density from mass and volume, or the mass or volume from the density, in g/cm³, kg/m³, g/L or lb/ft³ with grams, kilograms, pounds, litres and gallons.',
  summary:
    'Density is mass per unit volume: ρ = m ÷ V. Water has a density of about 1 g/cm³, which is 1,000 kg/m³ or 1 kg per litre. Objects denser than a liquid sink in it, and less dense ones float. Rearranged, mass = density × volume and volume = mass ÷ density, so knowing any two gives the third.',
  synonyms: [
    'mass volume density calculator',
    'how to calculate density',
    'g/cm3 calculator',
    'kg/m3 calculator',
    'mass from density and volume',
    'volume from density',
  ],
  ui: {
    find: 'Find',
    'find.density': 'Density',
    'find.mass': 'Mass',
    'find.volume': 'Volume',
    densityRow: 'Density',
    density: 'Density',
    densityUnit: 'Density unit',
    massRow: 'Mass',
    mass: 'Mass',
    massUnit: 'Mass unit',
    volumeRow: 'Volume',
    volume: 'Volume',
    volumeUnit: 'Volume unit',
    'unit.gcm3': 'g/cm³ (g/mL)',
    'unit.kgm3': 'kg/m³',
    'unit.gL': 'g/L',
    'unit.lbft3': 'lb/ft³',
    'unit.g': 'g',
    'unit.kg': 'kg',
    'unit.lb': 'lb',
    'unit.cm3': 'cm³ (mL)',
    'unit.L': 'litres',
    'unit.m3': 'm³',
    'unit.ft3': 'ft³',
    'unit.galUS': 'US gallons',
    'sym.gcm3': 'g/cm³',
    'sym.kgm3': 'kg/m³',
    'sym.gL': 'g/L',
    'sym.lbft3': 'lb/ft³',
    'sym.g': 'g',
    'sym.kg': 'kg',
    'sym.lb': 'lb',
    'sym.cm3': 'cm³',
    'sym.L': 'L',
    'sym.m3': 'm³',
    'sym.ft3': 'ft³',
    'sym.galUS': 'US gal',
    'out.result': 'Density',
    'out.result.density': 'Density',
    'out.result.mass': 'Mass',
    'out.result.volume': 'Volume',
    'out.gcm3': 'Density in g/cm³',
    'out.kgm3': 'Density in kg/m³',
    'out.kg': 'Mass in kg',
    'out.L': 'Volume in litres',
    explain: 'A density of {rho} g/cm³ means {kg} kg takes up {L} litres.',
    'step.density': 'Density = mass ÷ volume, in kilograms and cubic metres.',
    'step.mass': 'Mass = density × volume.',
    'step.volume': 'Volume = mass ÷ density.',
    'warn.volume': 'The volume must be greater than zero.',
    'warn.density': 'The density must be greater than zero.',
    rounding:
      'Uses exact unit factors (1 lb = 0.45359237 kg, 1 ft³ = 0.028316846592 m³). Results keep 12 significant digits and are shown to 8.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Density">{'ρ = m ÷ V\nm = ρ × V\nV = m ÷ ρ'}</Formula>
      <p>
        1 g/cm³ equals 1 g/mL, 1 kg/L and 1,000 kg/m³. Typical values from OpenStax{' '}
        <em>College Physics</em> Table 11.1: aluminium 2.7, iron or steel 7.8, lead 11.3 and gold
        19.32 g/cm³; water 1.000 at 4 °C; air about 0.00129 g/cm³. Density changes with temperature,
        so liquids and gases are quoted at a stated temperature.
      </p>
    </>
  ),
  examples: [
    {
      id: 'lead',
      title: 'A 90.7 g lead cube with 2 cm sides',
      body: (r) => (
        <p>
          The volume is 2 × 2 × 2 = 8 cm³, so ρ = 90.7 ÷ 8 = <strong>{String(o(r))}</strong>.
          OpenStax <em>Chemistry</em> Example 1.1 rounds this to 11.3 g/cm³.
        </p>
      ),
    },
    {
      id: 'iron',
      title: 'Iron that raises the water level by 4.0 mL',
      body: (r) => (
        <p>
          31.48 g ÷ 4.0 mL = <strong>{String(o(r))}</strong>, which Example 1.2 gives as 7.9 g/mL.
          Measuring the water displaced is an easy way to find the volume of an irregular object.
        </p>
      ),
    },
    {
      id: 'reservoir',
      title: 'The mass of water in a 2.00 × 10⁹ m³ reservoir',
      body: (r, fmt) => (
        <p>
          m = 1,000 kg/m³ × 2.00 × 10⁹ m³ = <strong>{fmt.sig(o(r, 'kg') as number, 3)} kg</strong>,
          as in OpenStax <em>College Physics</em> Example 11.1.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Will it float?</strong> Compare its density with the liquid’s. Ice at 0.917 g/cm³
        floats in water with about 92% of it below the surface.
      </li>
      <li>
        <strong>Irregular objects:</strong> lower the object into a measuring jug of water and use
        the rise in level as its volume.
      </li>
      <li>
        <strong>Specific gravity</strong> is density divided by the density of water, so in g/cm³ it
        is the same number without units.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How do you calculate density?',
      a: 'Divide the mass by the volume. A 500 g block that takes up 200 cm³ has a density of 500 ÷ 200 = 2.5 g/cm³. Make sure the units match the density unit you want: grams with cubic centimetres, or kilograms with cubic metres.',
    },
    {
      q: 'How do I convert g/cm³ to kg/m³?',
      a: 'Multiply by 1,000. A cubic metre holds a million cubic centimetres and a kilogram is a thousand grams, so 1 g/cm³ = 1,000 kg/m³. Aluminium at 2.7 g/cm³ is 2,700 kg/m³.',
    },
    {
      q: 'What is the density of water?',
      a: 'About 1.000 g/cm³, or 1,000 kg/m³, at 4 °C, where it is densest. It is slightly less at room temperature, around 0.998 g/cm³ at 20 °C. Sea water is about 1.025 g/cm³ because of the dissolved salt.',
    },
    {
      q: 'How do I find mass from density and volume?',
      a: 'Multiply them: m = ρ × V. A 2 litre bottle of olive oil at 0.92 kg/L holds about 1.84 kg of oil. Check that the volume unit matches the density unit before multiplying.',
    },
  ],
  ogSample: (r) => `90.7 g in 8 cm³ → ${String(o(r))}`,
};
