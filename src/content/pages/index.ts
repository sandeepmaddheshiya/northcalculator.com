import type { ComponentType } from 'react';
import About from './en/about';
import Methodology from './en/methodology';
import EditorialPolicy from './en/editorial-policy';
import Privacy from './en/privacy';
import Terms from './en/terms';
import Contact from './en/contact';

export type StaticPageId =
  'about' | 'methodology' | 'editorialPolicy' | 'privacy' | 'terms' | 'contact';

export const STATIC_PAGE_PATHS: Record<StaticPageId, string> = {
  about: '/about',
  methodology: '/methodology',
  editorialPolicy: '/editorial-policy',
  privacy: '/privacy',
  terms: '/terms',
  contact: '/contact',
};

/** Per-locale page bodies. A locale without an entry does not get the page (BRIEF §8). */
export const STATIC_PAGES: Record<string, Record<StaticPageId, ComponentType>> = {
  en: {
    about: About,
    methodology: Methodology,
    editorialPolicy: EditorialPolicy,
    privacy: Privacy,
    terms: Terms,
    contact: Contact,
  },
};

export const STATIC_PAGE_DESCRIPTIONS: Record<string, Record<StaticPageId, string>> = {
  en: {
    about:
      'Who builds NorthCalculator, why it exists, and the promises it makes about accuracy and privacy.',
    methodology:
      'How NorthCalculator sources formulas, tests every calculation, handles rounding and dates, and states review status.',
    editorialPolicy:
      'Writing standards, AI-assistance policy, independence and the corrections process behind every NorthCalculator page.',
    privacy:
      'Calculator inputs never leave your device. No analytics, no tracking cookies, and nothing sold or shared.',
    terms:
      'Terms of use for NorthCalculator: educational estimates, accuracy, acceptable use and limitation of liability.',
    contact:
      'How to contact NorthCalculator, report an error in a result, or suggest a new calculator.',
  },
};
