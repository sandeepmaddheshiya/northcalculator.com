import type { CalculatorContent } from '@/calculators/content-types';
import { Formula } from '@/components/calc/Formula';

const o = (r: { outputs: Record<string, unknown> }, k = 'result') => r.outputs[k] as number;

export const content: CalculatorContent = {
  name: 'Thin Lens Equation Calculator',
  promise: 'Image distance, focal length or object distance, with magnification and image type.',
  title: 'Thin Lens Calculator: 1/f = 1/do + 1/di and Magnification',
  description:
    'Solve the thin lens equation for image distance, focal length or object distance, with the magnification, lens power in diopters and whether the image is real.',
  summary:
    'For a thin lens, the object distance d_o, image distance d_i and focal length f obey 1/d_o + 1/d_i = 1/f. Converging lenses have positive f and diverging lenses negative f. A positive d_i is a real image on the far side of the lens, a negative one virtual. Magnification m = −d_i/d_o: negative means the image is upside down.',
  synonyms: [
    'lens equation calculator',
    'lens formula calculator',
    'focal length calculator',
    'image distance calculator',
    'magnification calculator optics',
    'diopter calculator',
  ],
  ui: {
    find: 'Find',
    'find.image': 'Image',
    'find.focal': 'Focal length',
    'find.object': 'Object',
    object: 'Object distance d_o',
    image: 'Image distance d_i',
    'image.help': 'Negative for a virtual image on the same side as the object.',
    focal: 'Focal length f',
    'focal.help': 'Positive for a converging lens, negative for a diverging one.',
    unit: 'Distances in',
    'unit.m': 'metres',
    'unit.cm': 'centimetres',
    'unit.mm': 'millimetres',
    'out.result': 'Image distance',
    'out.result.image': 'Image distance d_i',
    'out.result.focal': 'Focal length f',
    'out.result.object': 'Object distance d_o',
    'out.magnification': 'Magnification m',
    'out.kind': 'Image',
    'out.power': 'Lens power (diopters)',
    'kind.real': 'Real',
    'kind.virtual': 'Virtual',
    'kind.inverted': 'inverted',
    'kind.upright': 'upright',
    'kind.larger': 'larger',
    'kind.smaller': 'smaller',
    'kind.same': 'same size',
    explain: 'The image forms at {i} with magnification {m}: {kind}.',
    'step.image': 'd_i = f d_o ÷ (d_o − f), from 1/d_o + 1/d_i = 1/f.',
    'step.focal': 'f = d_o d_i ÷ (d_o + d_i).',
    'step.object': 'd_o = f d_i ÷ (d_i − f).',
    'step.m': 'Magnification m = −d_i ÷ d_o.',
    'warn.zero': 'Distances and the focal length cannot be zero.',
    'warn.infinity': 'An object at the focal point sends parallel rays: the image is at infinity.',
    rounding: 'Results keep 12 significant digits and are shown to 8. Power uses f in metres.',
  },
  HowItWorks: () => (
    <>
      <Formula label="Thin lens equation">{'1/d_o + 1/d_i = 1/f\nd_i = f d_o ÷ (d_o − f)'}</Formula>
      <Formula label="Magnification and power">
        {'m = −d_i ÷ d_o = h_i ÷ h_o\nP = 1/f (f in metres, diopters)'}
      </Formula>
      <p>
        Use the same unit for every distance. An object outside the focal length of a converging
        lens gives a real, inverted image, as in a projector; inside it, a virtual, upright,
        enlarged image, as in a magnifying glass. A diverging lens always gives a virtual, upright,
        smaller image.
      </p>
    </>
  ),
  examples: [
    {
      id: 'bulb',
      title: 'A bulb 0.750 m from a lens with f = 0.500 m',
      body: (r, fmt) => (
        <p>
          d_i = 0.5 × 0.75 ÷ 0.25 = <strong>{fmt.sig(o(r), 4)} m</strong>, magnification{' '}
          {fmt.sig(o(r, 'magnification'), 3)}: real and inverted, as in OpenStax{' '}
          <em>College Physics</em> Example 25.6.
        </p>
      ),
    },
    {
      id: 'magnifier',
      title: 'A magnifying glass, f = 10.0 cm, held 7.50 cm away',
      body: (r, fmt) => (
        <p>
          d_i = <strong>{fmt.sig(o(r), 4)} cm</strong>, a virtual image magnified{' '}
          {fmt.sig(o(r, 'magnification'), 3)} times (Example 25.7). The lens power is{' '}
          {fmt.sig(o(r, 'power'), 3)} D.
        </p>
      ),
    },
    {
      id: 'diverging',
      title: 'A diverging lens, f = −10.0 cm, object at 7.50 cm',
      body: (r, fmt) => (
        <p>
          d_i = <strong>{fmt.sig(o(r), 3)} cm</strong> with m = {fmt.sig(o(r, 'magnification'), 3)}:
          upright and smaller (Example 25.8).
        </p>
      ),
    },
  ],
  Guidance: () => (
    <ul>
      <li>
        <strong>Mind the signs:</strong> a diverging lens needs a negative focal length, and a
        virtual image gives a negative d_i.
      </li>
      <li>
        <strong>Mirrors</strong> use the same equation with their own sign convention, so check your
        course’s rules before reusing it.
      </li>
      <li>
        <strong>Glasses prescriptions</strong> are in diopters: −2.0 D is a diverging lens with f =
        −0.5 m.
      </li>
    </ul>
  ),
  faqs: [
    {
      q: 'What is the thin lens equation?',
      a: '1/d_o + 1/d_i = 1/f, linking the object distance, image distance and focal length. An object 50.0 cm from a lens with f = 10.0 cm forms an image at 12.5 cm, a quarter the size and inverted, as in OpenStax University Physics Example 2.4.',
    },
    {
      q: 'What does a negative image distance mean?',
      a: 'The image is virtual: it forms on the same side of the lens as the object, where light does not actually meet, so it cannot be caught on a screen. A magnifying glass and every diverging lens make virtual images.',
    },
    {
      q: 'How do I find the focal length from two distances?',
      a: 'Use f = d_o d_i ÷ (d_o + d_i). To project a bulb 0.75 m from the lens onto a screen 1.5 m away, you need f = 0.75 × 1.5 ÷ 2.25 = 0.50 m, a converging lens.',
    },
    {
      q: 'What is a diopter?',
      a: 'The unit of lens power, P = 1/f with f in metres. A lens with an 8.00 cm focal length has a power of 1 ÷ 0.08 = 12.5 diopters. Converging lenses have positive power and diverging lenses negative.',
    },
  ],
  ogSample: (r, fmt) => `d_o = 0.75 m, f = 0.5 m → d_i = ${fmt.sig(o(r), 4)} m`,
};
