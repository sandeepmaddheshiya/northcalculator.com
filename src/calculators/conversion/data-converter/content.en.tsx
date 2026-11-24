import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';
import { content as unit } from '../unit-converter/content.en';

const o = (r: { outputs: Record<string, unknown> }) => r.outputs.result as number;

export const content: CalculatorContent = {
  name: 'Data Storage Converter',
  promise: 'Convert bits, bytes, KB, MB, GB, TB and their binary KiB, MiB, GiB, TiB.',
  title: 'Data Storage Converter: GB to GiB, TB to TiB, Mbit to MB',
  description:
    'Convert data sizes between bits and bytes, decimal kilobytes, megabytes, gigabytes and terabytes, and binary kibibytes, mebibytes, gibibytes and tebibytes.',
  summary:
    'Data sizes use two systems. Decimal prefixes follow the SI: a gigabyte (GB) is 10⁹ bytes. Binary prefixes from IEC 80000-13 use powers of 2: a gibibyte (GiB) is 2³⁰ = 1,073,741,824 bytes. Drive makers use GB and TB, while many operating systems show binary sizes, so a 1 TB drive appears as about 931 GiB.',
  synonyms: [
    'GB to GiB',
    'TB to TiB',
    'MB to MiB',
    'megabits to megabytes',
    'bytes converter',
    'storage size converter',
  ],
  ui: { ...unit.ui },
  HowItWorks: () => (
    <>
      <Formula label="Two sets of prefixes">
        {
          'decimal (SI):    1 kB = 10³ B   1 MB = 10⁶ B   1 GB = 10⁹ B   1 TB = 10¹² B\nbinary (IEC):    1 KiB = 2¹⁰ B  1 MiB = 2²⁰ B  1 GiB = 2³⁰ B  1 TiB = 2⁴⁰ B\n1 byte = 8 bits'
        }
      </Formula>
      <p>
        NIST’s page on binary prefixes explains the kibi, mebi, gibi and tebi units adopted so that
        kilo, mega and giga can keep their decimal SI meaning. The gap grows with size: a kibibyte
        is 2.4% larger than a kilobyte, a tebibyte 10% larger than a terabyte.
      </p>
      <p>
        Network speeds are usually given in bits per second, storage in bytes. Divide bits by 8 to
        get bytes.
      </p>
    </>
  ),
  examples: [
    {
      id: 'drive',
      title: 'Why a 1 TB drive shows less space',
      body: (r, fmt) => (
        <p>
          1 TB is 10¹² bytes, and 10¹² ÷ 2⁴⁰ = <strong>{fmt.sig(o(r), 6)} TiB</strong>, about 931
          GiB. No space is missing; it is the same number of bytes counted in larger units.
        </p>
      ),
    },
    {
      id: 'gib',
      title: 'One GiB in bytes',
      body: (r, fmt) => (
        <p>
          2³⁰ = <strong>{fmt.int(o(r))} bytes</strong>, 7.4% more than a decimal gigabyte’s
          1,000,000,000 bytes.
        </p>
      ),
    },
    {
      id: 'internet',
      title: 'A 100 Mbit/s connection in megabytes per second',
      body: (r, fmt) => (
        <p>
          100 megabits ÷ 8 bits per byte = <strong>{fmt.sig(o(r))} MB</strong> each second, so a 1
          GB file takes at least 80 seconds before protocol overhead.
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Watch the b and B.</strong> Mb (megabits) and MB (megabytes) differ by a factor of
        8.
      </li>
      <li>
        <strong>Network speeds are decimal.</strong> 1 Gbit/s is 10⁹ bits per second, the SI meaning
        of giga.
      </li>
      <li>
        <strong>Formatted capacity is lower again.</strong> File systems reserve some space, so
        usable space is a little less than the converted figure.
      </li>
      <li>
        <strong>KB versus kB:</strong> the SI symbol for 1,000 bytes is kB; KiB is 1,024 bytes.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What is the difference between GB and GiB?',
      a: 'A gigabyte (GB) is 1,000,000,000 bytes, using the decimal SI prefix. A gibibyte (GiB) is 1,073,741,824 bytes, using the binary prefix 2³⁰. One GB is 0.9313 GiB, which is why storage looks smaller when an operating system shows binary units.',
    },
    {
      q: 'How many GB are in a TB?',
      a: 'In decimal units, exactly 1,000 GB are in 1 TB. In binary units, 1,024 GiB make 1 TiB. Mixing the two systems gives the familiar result that a 1 TB drive shows as about 931 GiB.',
    },
    {
      q: 'How do I convert megabits to megabytes?',
      a: 'Divide by 8, because a byte has 8 bits. A 50 Mbit/s download speed moves at most 6.25 megabytes per second, before network overhead. To go from megabytes to megabits, multiply by 8.',
    },
    {
      q: 'Why does my 256 GB phone show less storage?',
      a: '256 GB is 256 × 10⁹ bytes, about 238.4 GiB, and the operating system and preinstalled apps also use part of it. The space is not lost; it is measured in a larger unit and partly occupied.',
    },
  ],
  ogSample: (r, fmt) => `1 TB = ${fmt.sig(o(r), 6)} TiB`,
};
