import type { ComponentType, ReactNode } from 'react';
import type { ComputeResult, Fmt, InputValues } from './types';

/**
 * Per-locale page content for one calculator (ADR-019). Written by a person, reviewed, and
 * type-checked so every locale supplies every section of BRIEF §5.
 */
export interface CalculatorContent {
  /** H1 and nav name, as people search for it ("Mortgage Calculator"). */
  name: string;
  /** One-sentence promise under the H1 naming the concrete outputs. */
  promise: string;
  /** <title>, 50–60 characters. */
  title: string;
  /** Meta description, 120–160 characters. */
  description: string;
  /** Answer-first summary, 40–70 words (content gate checks the count). */
  summary: string;
  /** Extra search terms (synonyms, abbreviations). */
  synonyms: readonly string[];
  /** All UI strings for this calculator: input/output labels, options, steps, warnings. */
  ui: Record<string, string>;
  /** "How it works": formula, variables, assumptions. */
  HowItWorks: ComponentType<{ fmt: Fmt }>;
  /** ≥2 worked examples; ids match definition.examples, body receives the computed result. */
  examples: readonly {
    id: string;
    title: string;
    body: (r: ComputeResult, fmt: Fmt, inputs: InputValues) => ReactNode;
  }[];
  /** Tips, common mistakes, when not to use it, regional differences. */
  Guidance: ComponentType;
  /** 4–8 specific questions; answers are plain text (also used for FAQPage JSON-LD). */
  faqs: readonly { q: string; a: string }[];
  /** Short sample result for the OG image, from the default inputs. */
  ogSample: (r: ComputeResult, fmt: Fmt) => string;
}
