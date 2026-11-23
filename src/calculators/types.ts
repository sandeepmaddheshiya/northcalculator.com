/**
 * The calculator definition contract (BRIEF §3). Every calculator is one folder:
 *   definition.ts  → `CalculatorDefinition` (metadata, inputs, outputs, sources, review)
 *   compute.ts     → pure `compute(inputs, ctx)`; no DOM, no I/O, deterministic
 *   compute.test.ts→ ≥10 tests incl. ≥2 independent reference cases
 *   content.<locale>.mdx → unique human-written page content
 * The content gate (scripts/check-content.mjs) fails the build if required fields are missing.
 */
import type { CategoryKey } from '@/components/ui/CategoryGlyph';
import type { NumberFormatKind } from '@/engine/format';

export type Locale = string;
export type LocalizedSlug = Record<Locale, string>;

interface InputBase {
  id: string;
  /** i18n key under the calculator's message namespace. */
  labelKey: string;
  helpKey?: string;
  /** Short URL param name (BRIEF §6: compact, human-readable). */
  param: string;
  /** Contains personal data (salary, health): stays on device, excluded from history unless saved. */
  sensitive?: boolean;
}

export interface NumberInput extends InputBase {
  type: 'number' | 'currency' | 'percent';
  default: number;
  min?: number;
  max?: number;
  step?: number;
  /** Allow negative values (default false). */
  allowNegative?: boolean;
  /** Integer only. */
  integer?: boolean;
}

export interface UnitNumberInput extends InputBase {
  type: 'unit-number';
  default: number;
  /** Unit ids from the engine unit graph, e.g. ['kg', 'lb']. */
  units: readonly string[];
  defaultUnit: string;
  min?: number;
  max?: number;
}

export interface DateInput extends InputBase {
  type: 'date';
  /** ISO date or the token 'today' (resolved on the client; SSR uses the build date). */
  default: string | 'today';
  min?: string;
  max?: string;
}

export interface SelectInput extends InputBase {
  type: 'select' | 'segmented';
  options: readonly { value: string; labelKey: string }[];
  default: string;
}

export interface ToggleInput extends InputBase {
  type: 'toggle';
  default: boolean;
}

export interface ListInput extends InputBase {
  type: 'list';
  /** Column definitions for table-like inputs (e.g. GPA courses). */
  columns: readonly Exclude<CalculatorInput, ListInput>[];
  default: readonly Record<string, unknown>[];
  maxRows: number;
}

export type CalculatorInput =
  NumberInput | UnitNumberInput | DateInput | SelectInput | ToggleInput | ListInput;

export interface CalculatorOutput {
  id: string;
  labelKey: string;
  format: NumberFormatKind | 'date' | 'duration' | 'text';
  primary?: boolean;
  /** Fixed decimals for display (rounding policy is documented in the definition). */
  decimals?: number;
}

export interface Step {
  /** i18n key describing the step, interpolated with `values`. */
  key: string;
  values?: Record<string, string | number>;
  /** Plain-text maths for this step, e.g. "240 × 15 ÷ 100 = 36". */
  math?: string;
}

export interface Warning {
  key: string;
  values?: Record<string, string | number>;
  level: 'info' | 'warn';
}

export interface ComputeResult<O extends string = string> {
  outputs: Record<O, number | string | null>;
  steps: Step[];
  series?: { id: string; points: [number, number][] }[];
  table?: { columns: string[]; rows: (string | number)[][] };
  warnings: Warning[];
}

export interface ComputeContext {
  /** Formatting locale (may be region-specific, e.g. en-IN). */
  locale: string;
  /** Fixed "today" for deterministic tests / SSR. ISO date. */
  today: string;
}

export interface Source {
  title: string;
  publisher: string;
  url: string;
  /** ISO date the source was accessed and checked. */
  accessed: string;
  /** Optional precise locator: section, page, table. */
  locator?: string;
}

export interface Review {
  status: 'pending' | 'reviewed';
  reviewer?: string;
  /** ISO date; only present when status is 'reviewed' (ADR-011). */
  date?: string;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  note: string;
}

export interface WorkedExample {
  id: string;
  /** Input values; also used to build the "try this example" deep link. */
  inputs: Record<string, unknown>;
  /** Expected primary output, asserted by tests (prose and tool can never disagree). */
  expect: Record<string, number | string>;
}

export interface CalculatorDefinition {
  id: string;
  slug: LocalizedSlug;
  category: CategoryKey;
  subcategory?: string;
  tags: readonly string[];
  difficulty: 'basic' | 'advanced';
  /** Your Money or Your Life: requires disclaimer near the result (BRIEF §9). */
  ymyl: boolean;
  /** ISO 3166 regions where this calculator applies; omitted = universal. */
  regions?: readonly string[];
  inputs: readonly CalculatorInput[];
  outputs: readonly CalculatorOutput[];
  sources: readonly Source[];
  review: Review;
  version: string;
  changelog: readonly ChangelogEntry[];
  related: readonly string[];
  examples: readonly WorkedExample[];
  /** Locales whose content is fully translated and reviewed (BRIEF §8). */
  locales: readonly Locale[];
  /** ISO date of last substantive content change (drives sitemap lastmod). */
  contentUpdated: string;
}
