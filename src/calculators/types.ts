/**
 * The calculator definition contract (BRIEF §3). Every calculator is one folder:
 *   definition.ts  → `CalculatorDefinition` (metadata, inputs, outputs, sources, review)
 *   compute.ts     → pure `compute(inputs, ctx)`; no DOM, no I/O, deterministic
 *   compute.test.ts→ ≥10 tests incl. ≥2 independent reference cases
 *   content.<locale>.tsx → unique human-written page content (ADR-019)
 *   Island.tsx     → client island (generic renderer or a custom component)
 *   index.ts       → the CalculatorModule registered in registry.ts
 * The content gate (content-gate.test.ts) fails the build if required fields are missing.
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
  /** Show this input only when another input has one of these values (e.g. unit system). */
  showIf?: { input: string; in: readonly (string | boolean)[] };
  /** Text shown inside the field: '$' prefix comes from the currency input automatically. */
  prefixKey?: string;
  suffixKey?: string;
  /** Label lookup varies with another input's value: ui[`${labelKey}.${value}`]. */
  labelBy?: string;
  /** Secondary input, shown inside the collapsible "More options" group. */
  advanced?: boolean;
  /** Consecutive inputs with the same row id render side by side under one legend (ui[legendKey]). */
  row?: { id: string; legendKey: string };
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
  /**
   * Options depend on another input's value (e.g. units filtered by quantity). When that input
   * changes and the current value is no longer allowed, `fallback[value]` (or the first allowed
   * option) is selected.
   */
  optionsBy?: {
    input: string;
    map: Record<string, readonly string[]>;
    fallback?: Record<string, string>;
  };
  /** Render a swap button that exchanges this input's value with another select's. */
  swapWith?: string;
}

export interface TextInput extends InputBase {
  type: 'text';
  default: string;
  maxLength: number;
  /** Render as a textarea (lists of numbers). */
  multiline?: boolean;
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
  NumberInput | DateInput | SelectInput | ToggleInput | TextInput | ListInput;

export interface CalculatorOutput {
  id: string;
  labelKey: string;
  format: NumberFormatKind | 'sig' | 'date' | 'duration' | 'text';
  primary?: boolean;
  /** Fixed decimals for display (rounding policy is documented in the definition). */
  decimals?: number;
  /** Display format chosen by another input's value (e.g. percentage mode). */
  formatBy?: { input: string; map: Record<string, CalculatorOutput['format']> };
  /** Label lookup varies with an input's value: ui[`${labelKey}.${value}`], falling back to ui[labelKey]. */
  labelBy?: string;
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

export type CellFormat = 'money' | 'number' | 'integer' | 'percent' | 'sig' | 'text' | 'date';

export interface ResultTable {
  /** ui key of the table caption. */
  captionKey: string;
  columns: readonly { key: string; format: CellFormat }[];
  rows: readonly (readonly (string | number)[])[];
}

export interface ResultSeries {
  /** ui key of the series label. */
  key: string;
  points: readonly (readonly [number, number])[];
  tone: 'brand' | 'ink' | 'accent';
}

export interface ComputeResult {
  /** null = cannot compute with the current inputs (an error/warning explains why). */
  outputs: Record<string, number | string | null>;
  steps: Step[];
  /** One plain-language sentence interpreting the result (ui key + formatted values). */
  explain?: { key: string; values: Record<string, string | number> };
  chart?: {
    xKey: string;
    yFormat: CellFormat;
    series: readonly ResultSeries[];
    summaryKey: string;
    summaryValues: Record<string, string | number>;
  };
  table?: ResultTable;
  /** Full-precision data for CSV export (e.g. the monthly amortization schedule). */
  csv?: {
    filename: string;
    columns: readonly string[];
    rows: readonly (readonly (string | number)[])[];
  };
  warnings: Warning[];
}

/** Formatting helpers handed to compute() so step text uses the visitor's number format. */
export interface Fmt {
  locale: string;
  currency: string;
  money: (n: number, decimals?: number) => string;
  num: (n: number, maxDecimals?: number) => string;
  int: (n: number) => string;
  pct: (n: number, maxDecimals?: number) => string;
  date: (iso: string, style?: 'long' | 'medium' | 'month') => string;
  /** Significant digits, switching to scientific notation for very large or small values. */
  sig: (n: number, digits?: number) => string;
}

export interface ComputeContext {
  /** Fixed "today" for deterministic tests / SSR. ISO date. */
  today: string;
  fmt: Fmt;
  /** Build-time data the calculator needs (e.g. the currency rate snapshot); see CalculatorModule.data. */
  data?: unknown;
  /**
   * The calculator's own UI strings with {placeholders} filled, for text outputs that must be
   * localised (e.g. "36 years, 6 months"). Missing keys return the key.
   */
  t?: (key: string, values?: Record<string, string | number>) => string;
}

export type InputValue = number | string | boolean | null | readonly Record<string, unknown>[];
export type InputValues = Record<string, InputValue>;
export type ComputeFn = (inputs: InputValues, ctx: ComputeContext) => ComputeResult;

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
  /** Id of a select input holding an ISO currency code, or a fixed currency for this calculator. */
  currency?: { input: string } | { fixed: string };
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
  /** Internal audit trail (content-guidelines §7); never rendered. */
  draftedWith: 'none' | 'ai-assisted';
  version: string;
  changelog: readonly ChangelogEntry[];
  related: readonly string[];
  examples: readonly WorkedExample[];
  /** Locales whose content is fully translated and reviewed (BRIEF §8). */
  locales: readonly Locale[];
  /** ISO date of last substantive content change (drives sitemap lastmod). */
  contentUpdated: string;
  /** schema.org applicationCategory for WebApplication JSON-LD. */
  schemaCategory:
    'FinanceApplication' | 'HealthApplication' | 'EducationalApplication' | 'UtilitiesApplication';
  /** How results are rounded, stated on the page (BRIEF §3). */
  roundingKey: string;
}
