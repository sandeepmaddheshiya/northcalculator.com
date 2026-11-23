import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

/** Unit names and symbols, keyed by engine unit id. */
const UNITS: Record<string, [name: string, symbol: string]> = {
  mm: ['Millimetre', 'mm'],
  cm: ['Centimetre', 'cm'],
  m: ['Metre', 'm'],
  km: ['Kilometre', 'km'],
  um: ['Micrometre', 'µm'],
  in: ['Inch', 'in'],
  ft: ['Foot', 'ft'],
  yd: ['Yard', 'yd'],
  mi: ['Mile', 'mi'],
  nmi: ['Nautical mile', 'nmi'],
  mg: ['Milligram', 'mg'],
  g: ['Gram', 'g'],
  kg: ['Kilogram', 'kg'],
  t: ['Tonne (metric ton)', 't'],
  oz: ['Ounce', 'oz'],
  lb: ['Pound', 'lb'],
  st: ['Stone', 'st'],
  ton_us: ['US short ton', 'short ton'],
  ton_uk: ['UK long ton', 'long ton'],
  ml: ['Millilitre', 'mL'],
  l: ['Litre', 'L'],
  m3: ['Cubic metre', 'm³'],
  cm3: ['Cubic centimetre', 'cm³'],
  tsp_us: ['US teaspoon', 'tsp'],
  tbsp_us: ['US tablespoon', 'tbsp'],
  floz_us: ['US fluid ounce', 'US fl oz'],
  cup_us: ['US cup', 'cup'],
  pt_us: ['US pint', 'US pt'],
  qt_us: ['US quart', 'US qt'],
  gal_us: ['US gallon', 'US gal'],
  floz_uk: ['Imperial fluid ounce', 'imp fl oz'],
  pt_uk: ['Imperial pint', 'imp pt'],
  gal_uk: ['Imperial gallon', 'imp gal'],
  in3: ['Cubic inch', 'in³'],
  ft3: ['Cubic foot', 'ft³'],
  c: ['Celsius', '°C'],
  f: ['Fahrenheit', '°F'],
  k: ['Kelvin', 'K'],
  r: ['Rankine', '°R'],
  mm2: ['Square millimetre', 'mm²'],
  cm2: ['Square centimetre', 'cm²'],
  m2: ['Square metre', 'm²'],
  ha: ['Hectare', 'ha'],
  km2: ['Square kilometre', 'km²'],
  in2: ['Square inch', 'in²'],
  ft2: ['Square foot', 'ft²'],
  yd2: ['Square yard', 'yd²'],
  acre: ['Acre', 'ac'],
  mi2: ['Square mile', 'mi²'],
  mps: ['Metre per second', 'm/s'],
  kmh: ['Kilometre per hour', 'km/h'],
  mph: ['Mile per hour', 'mph'],
  kn: ['Knot', 'kn'],
  fps: ['Foot per second', 'ft/s'],
  pa: ['Pascal', 'Pa'],
  kpa: ['Kilopascal', 'kPa'],
  mpa: ['Megapascal', 'MPa'],
  bar: ['Bar', 'bar'],
  mbar: ['Millibar', 'mbar'],
  atm: ['Standard atmosphere', 'atm'],
  psi: ['Pound per square inch', 'psi'],
  torr: ['Torr', 'Torr'],
  mmhg: ['Millimetre of mercury', 'mmHg'],
  inhg: ['Inch of mercury', 'inHg'],
  j: ['Joule', 'J'],
  kj: ['Kilojoule', 'kJ'],
  mj: ['Megajoule', 'MJ'],
  cal: ['Calorie (thermochemical)', 'cal'],
  kcal: ['Kilocalorie (food calorie)', 'kcal'],
  wh: ['Watt-hour', 'Wh'],
  kwh: ['Kilowatt-hour', 'kWh'],
  btu: ['British thermal unit (IT)', 'Btu'],
  ev: ['Electronvolt', 'eV'],
  w: ['Watt', 'W'],
  kw: ['Kilowatt', 'kW'],
  mw: ['Megawatt', 'MW'],
  hp: ['Horsepower (mechanical)', 'hp'],
  ps: ['Metric horsepower', 'PS'],
  btuh: ['Btu per hour', 'Btu/h'],
  bit: ['Bit', 'bit'],
  byte: ['Byte', 'B'],
  kb: ['Kilobyte (1000 B)', 'kB'],
  mb: ['Megabyte (10⁶ B)', 'MB'],
  gb: ['Gigabyte (10⁹ B)', 'GB'],
  tb: ['Terabyte (10¹² B)', 'TB'],
  pb: ['Petabyte (10¹⁵ B)', 'PB'],
  kib: ['Kibibyte (1024 B)', 'KiB'],
  mib: ['Mebibyte (2²⁰ B)', 'MiB'],
  gib: ['Gibibyte (2³⁰ B)', 'GiB'],
  tib: ['Tebibyte (2⁴⁰ B)', 'TiB'],
  kbit: ['Kilobit', 'kbit'],
  mbit: ['Megabit', 'Mbit'],
  gbit: ['Gigabit', 'Gbit'],
  ms: ['Millisecond', 'ms'],
  s: ['Second', 's'],
  min: ['Minute', 'min'],
  h: ['Hour', 'h'],
  d: ['Day', 'd'],
  wk: ['Week', 'wk'],
  yr: ['Julian year (365.25 days)', 'yr'],
  kmpl: ['Kilometres per litre', 'km/L'],
  l100km: ['Litres per 100 km', 'L/100 km'],
  mpg_us: ['Miles per US gallon', 'mpg (US)'],
  mpg_uk: ['Miles per imperial gallon', 'mpg (UK)'],
};

const QUANTITY_NAMES: Record<string, string> = {
  length: 'Length',
  mass: 'Weight and mass',
  volume: 'Volume',
  temperature: 'Temperature',
  area: 'Area',
  speed: 'Speed',
  pressure: 'Pressure',
  energy: 'Energy',
  power: 'Power',
  data: 'Data size',
  time: 'Time',
  fuel: 'Fuel economy',
};

const o = (r: { outputs: Record<string, unknown> }, k: string) => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Unit Converter',
  promise: 'Convert length, weight, volume, temperature and 8 more quantities with exact factors.',
  title: 'Unit Converter: Length, Weight, Temperature and More',
  description:
    'Convert between metric, US and imperial units for length, weight, volume, temperature, area, speed, pressure, energy, power, data, time and fuel economy.',
  summary:
    'Each conversion goes through the quantity’s SI unit using factors that are exact by definition: an inch is exactly 2.54 cm, a pound exactly 0.45359237 kg and a US gallon exactly 231 cubic inches. Temperature scales have different zero points, so they use formulas, not a single factor. Fuel economy in litres per 100 km is the reciprocal of distance per volume.',
  synonyms: [
    'metric converter',
    'conversion calculator',
    'cm to inches',
    'kg to lbs',
    'Fahrenheit to Celsius',
    'miles to km',
    'liters to gallons',
    'GB to GiB',
    'mpg to L/100km',
  ],
  ui: {
    q: 'Quantity',
    ...Object.fromEntries(Object.entries(QUANTITY_NAMES).map(([k, v]) => [`q.${k}`, v])),
    v: 'Value',
    from: 'From',
    to: 'To',
    ...Object.fromEntries(
      Object.entries(UNITS).map(([id, [name, sym]]) => [`u.${id}`, `${name} (${sym})`]),
    ),
    ...Object.fromEntries(Object.entries(UNITS).map(([id, [, sym]]) => [`s.${id}`, sym])),
    'out.result': 'Result',
    'out.relation': 'Conversion',
    'out.exact': 'Factor',
    'exact.yes': 'Exact by definition',
    'exact.no': 'Conventional value, rounded (inch of mercury)',
    'f.c.f': '°F = °C × 9/5 + 32',
    'f.f.c': '°C = (°F − 32) × 5/9',
    'f.c.k': 'K = °C + 273.15',
    'f.k.c': '°C = K − 273.15',
    'f.f.k': 'K = (°F − 32) × 5/9 + 273.15',
    'f.k.f': '°F = (K − 273.15) × 9/5 + 32',
    'f.c.r': '°R = (°C + 273.15) × 9/5',
    'f.r.c': '°C = (°R − 491.67) × 5/9',
    'f.f.r': '°R = °F + 459.67',
    'f.r.f': '°F = °R − 459.67',
    'f.reciprocal': 'L/100 km = 100 ÷ (km per litre)',
    explain: '{v} {from} is {r} {to}.',
    'step.toBase': 'Convert to the SI unit ({base}).',
    'step.fromBase': 'Convert from the SI unit to the target unit.',
    'step.reciprocal':
      'Fuel use per distance is the reciprocal of distance per fuel: convert to km per litre, then take 100 ÷ that value.',
    'table.caption': 'The same value in every unit',
    'table.unit': 'Unit',
    'table.value': 'Value',
    'warn.belowZero': 'This is below absolute zero (0 K), which is physically impossible.',
    'warn.fuelZero': 'Fuel economy must be greater than zero.',
    'warn.undefined': 'This conversion has no finite result.',
    rounding:
      'Factors are exact definitions, so results are exact apart from binary floating-point rounding. Values are kept to 12 significant digits and shown to 10, switching to scientific notation below 0.000001 or above 10¹⁵.',
  },
  HowItWorks: () => (
    <>
      <p>
        Every unit is defined by how many of the quantity’s SI unit it contains. The calculator
        converts your value into that SI unit, then into the target unit:
      </p>
      <Formula
        label="Linear units"
        where={[
          { symbol: 'f_from', meaning: 'SI units in one source unit' },
          { symbol: 'f_to', meaning: 'SI units in one target unit' },
        ]}
      >
        {'result = value × f_from ÷ f_to'}
      </Formula>
      <p>
        The factors are exact by international agreement. The 1959 yard and pound agreement fixed 1
        yard = 0.9144 m and 1 pound = 0.45359237 kg. From those, 1 inch = 2.54 cm, 1 mile = 1.609344
        km, and a US gallon, defined as 231 cubic inches, is 3.785411784 L. The imperial gallon is
        defined directly as 4.54609 L. These are the values in NIST Handbook 44 and NIST Special
        Publication 811.
      </p>
      <h3>Temperature</h3>
      <p>
        Celsius and Fahrenheit have different zero points, so converting them needs an offset as
        well as a scale factor:
      </p>
      <Formula label="Temperature">
        {'°F = °C × 9/5 + 32\n°C = (°F − 32) × 5/9\nK  = °C + 273.15'}
      </Formula>
      <h3>Data: kilobytes and kibibytes</h3>
      <p>
        SI prefixes are powers of 10, so a gigabyte (GB) is 10⁹ bytes. Binary prefixes, standardised
        by the IEC, are powers of 2: a gibibyte (GiB) is 2³⁰ = 1,073,741,824 bytes. Drive makers use
        GB. Many operating systems count in GiB but label it “GB”, which is why a new drive looks
        smaller than advertised.
      </p>
      <h3>Fuel economy</h3>
      <p>
        Miles per gallon and kilometres per litre measure distance per fuel. Litres per 100 km
        measures fuel per distance, so it is a reciprocal: L/100 km = 100 ÷ (km/L). A car that
        doubles its mpg halves its L/100 km. US and imperial mpg differ because the gallons differ
        by about 20%.
      </p>
    </>
  ),
  examples: [
    {
      id: 'oven',
      title: 'An oven set to 350 °F, in Celsius',
      body: (r, fmt) => (
        <p>
          Subtract 32, then multiply by 5/9: (350 − 32) × 5/9 = 318 × 5/9 ={' '}
          <strong>{fmt.sig(o(r, 'result'), 6)} °C</strong>. Recipes usually round this to 175 or 180
          °C. For a fan (convection) oven, recipes typically suggest a further reduction, so check
          the recipe.
        </p>
      ),
    },
    {
      id: 'drive',
      title: 'Why a 1 TB drive shows about 931 GB',
      body: (r, fmt) => (
        <p>
          The drive holds 1 TB = 10¹² bytes. An operating system that counts in binary units divides
          by 2³⁰ = 1,073,741,824 bytes per GiB: 10¹² ÷ 2³⁰ ={' '}
          <strong>{fmt.sig(o(r, 'result'), 6)} GiB</strong>. Nothing is missing. The same capacity
          is measured with a larger unit and then labelled “GB”.
        </p>
      ),
    },
    {
      id: 'fuel',
      title: '30 miles per US gallon in litres per 100 km',
      body: (r, fmt) => (
        <p>
          First convert to kilometres per litre: 30 × 1.609344 km ÷ 3.785411784 L = 12.754 km/L.
          Then take the reciprocal per 100 km: 100 ÷ 12.754 ={' '}
          <strong>{fmt.sig(o(r, 'result'), 4)} L/100 km</strong>. The same 30 mpg on a UK (imperial)
          figure would be about 9.4 L/100 km, because an imperial gallon is larger.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Check which gallon, pint or ton you mean.</strong> A US pint is 473 mL and an
        imperial pint 568 mL. A US short ton is 2,000 lb and a UK long ton 2,240 lb. Recipes, fuel
        figures and shipping weights from the UK and the US are not interchangeable.
      </li>
      <li>
        <strong>Kilocalories are food calories.</strong> A food label’s “Calories” or “kcal” are
        kilocalories (4,184 J each). Choose kilocalories, not calories, when converting nutrition
        figures to kilojoules.
      </li>
      <li>
        <strong>Network speeds are in bits, file sizes in bytes.</strong> A 100 Mbit/s connection
        moves at most 12.5 MB of data per second (100 ÷ 8), and less after protocol overhead.
      </li>
      <li>
        <strong>Keep the precision of your input.</strong> The converter shows up to 10 significant
        digits, but if your measurement was “about 6 ft”, report about 1.8 m, not 1.8288 m.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'How many centimetres are in an inch?',
      a: 'Exactly 2.54. Since the 1959 international agreement on the yard and pound, the inch has been defined as 25.4 mm. To convert inches to centimetres, multiply by 2.54. To go from centimetres to inches, divide by 2.54.',
    },
    {
      q: 'How do I convert Fahrenheit to Celsius in my head?',
      a: 'Subtract 30 and halve the result for a rough answer: 70 °F becomes about 20 °C (the exact answer is 21.1 °C). The exact formula is °C = (°F − 32) × 5/9. The two scales meet at −40, where −40 °F equals −40 °C.',
    },
    {
      q: 'Why does my 1 TB hard drive show less space than advertised?',
      a: 'Manufacturers use decimal units: 1 TB is 10¹² bytes. Many operating systems divide by binary units (1 GiB = 2³⁰ bytes) but still write “GB”, so the drive appears as about 931 GB. The storage is all there. Only the unit of measurement differs.',
    },
    {
      q: 'What is the difference between a US gallon and an imperial gallon?',
      a: 'A US gallon is 231 cubic inches, exactly 3.785411784 litres. An imperial gallon, used in the UK, is defined as exactly 4.54609 litres, about 20% larger. This is why UK fuel economy figures in mpg look better than US ones for the same car.',
    },
    {
      q: 'How many pounds are in a kilogram?',
      a: 'About 2.20462. The pound is defined as exactly 0.45359237 kg, so one kilogram is 1 ÷ 0.45359237 = 2.2046226 lb. For quick estimates, multiply kilograms by 2.2. In the UK, body weight is often given in stone, which is 14 pounds.',
    },
  ],
  ogSample: (r, fmt) => `1 mile = ${fmt.sig(o(r, 'result'), 7)} km`,
};
