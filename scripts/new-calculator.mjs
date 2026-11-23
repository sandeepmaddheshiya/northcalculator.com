#!/usr/bin/env node
/**
 * Scaffold a calculator (BRIEF §13): `pnpm new:calculator <category> <id>`
 * e.g. `pnpm new:calculator finance simple-interest`.
 * Creates the six files of the calculator contract and registers the module and its island.
 * The templates contain TODO(...) markers that the content gate rejects, so an unfinished
 * calculator can never pass CI or ship.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const [category, id] = process.argv.slice(2);
const categories = [
  ...readFileSync('src/calculators/categories.ts', 'utf8').matchAll(/key: '([a-z-]+)'/g),
].map((m) => m[1]);
if (!category || !id || !categories.includes(category) || !/^[a-z][a-z0-9-]*$/.test(id)) {
  console.error(
    `Usage: pnpm new:calculator <category> <id>\n  category: ${categories.join(', ')}\n  id: lowercase-with-dashes`,
  );
  process.exit(1);
}
const dir = path.join('src/calculators', category, id);
if (existsSync(dir)) {
  console.error(`${dir} already exists`);
  process.exit(1);
}
const camel = id.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
const today = new Date().toISOString().slice(0, 10);
const schema =
  {
    finance: 'FinanceApplication',
    health: 'HealthApplication',
    education: 'EducationalApplication',
  }[category] ?? 'UtilitiesApplication';

const files = {
  'definition.ts': `import type { CalculatorDefinition } from '@/calculators/types';

export const definition: CalculatorDefinition = {
  id: '${id}',
  slug: { en: '${id}-calculator' },
  category: '${category}',
  tags: ['TODO(tags)'],
  difficulty: 'basic',
  ymyl: ${['finance', 'health'].includes(category)},
  schemaCategory: '${schema}',
  roundingKey: 'rounding',
  inputs: [{ id: 'x', param: 'x', type: 'number', labelKey: 'x', default: 1 }],
  outputs: [{ id: 'result', labelKey: 'out.result', format: 'number', primary: true }],
  sources: [{ title: 'TODO(source)', publisher: 'TODO(publisher)', url: 'https://TODO.example', accessed: '${today}' }],
  review: { status: 'pending' },
  draftedWith: 'ai-assisted',
  version: '1.0.0',
  changelog: [{ version: '1.0.0', date: '${today}', note: 'First published.' }],
  related: [],
  examples: [
    { id: 'one', inputs: { x: 1 }, expect: { result: 1 } },
    { id: 'two', inputs: { x: 2 }, expect: { result: 2 } },
  ],
  locales: ['en'],
  contentUpdated: '${today}',
};
`,
  'compute.ts': `import type { ComputeFn, ComputeResult } from '@/calculators/types';

/** TODO(formula): state the formula and cite its source here. */
export const compute: ComputeFn = (inputs) => {
  const x = typeof inputs.x === 'number' ? inputs.x : null;
  if (x === null) {
    const none: ComputeResult = { outputs: { result: null }, steps: [], warnings: [] };
    return none;
  }
  return { outputs: { result: x }, steps: [], warnings: [] };
};
`,
  'compute.test.ts': `import { describe, expect, it } from 'vitest';
import { makeFmt } from '@/calculators/fmt';
import { compute } from './compute';
import { definition } from './definition';

const ctx = { today: '${today}', fmt: makeFmt('en') };

describe('${id}: independent reference values', () => {
  // TODO(tests): ≥ 2 values from independent, verified sources, then typical, boundary, zero,
  // negative, huge, invalid and locale cases (≥ 10 tests in total).
  it.todo('reference value 1');
});

describe('${id}: worked examples match the published prose', () => {
  it.each(definition.examples.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    const r = compute({ ...e.inputs } as never, ctx);
    for (const [k, v] of Object.entries(e.expect)) expect(r.outputs[k]).toBe(v);
  });
});
`,
  'content.en.tsx': `import type { CalculatorContent } from '@/calculators/content-types';

export const content: CalculatorContent = {
  name: 'TODO(name)',
  promise: 'TODO(promise)',
  title: 'TODO(title: 50–60 characters)',
  description: 'TODO(description: 120–160 characters)',
  summary: 'TODO(summary: 40–70 words)',
  synonyms: [],
  ui: { x: 'TODO(label)', 'out.result': 'TODO(label)', rounding: 'TODO(rounding policy)' },
  HowItWorks: () => <p>TODO(how it works)</p>,
  examples: [
    { id: 'one', title: 'TODO(example)', body: () => <p>TODO(example)</p> },
    { id: 'two', title: 'TODO(example)', body: () => <p>TODO(example)</p> },
  ],
  Guidance: () => <p>TODO(guidance)</p>,
  faqs: [],
  ogSample: () => 'TODO(og sample)',
};
`,
  'Island.tsx': `'use client';

import { CalculatorIsland, type IslandProps } from '@/components/calc/CalculatorIsland';
import { definition } from './definition';
import { compute } from './compute';

export default function Island(props: IslandProps) {
  return <CalculatorIsland {...props} def={definition} compute={compute} />;
}
`,
  'index.ts': `import type { CalculatorModule } from '@/calculators/module';
import { definition } from './definition';
import { compute } from './compute';

export const ${camel}: CalculatorModule = {
  definition,
  compute,
  content: { en: () => import('./content.en').then((m) => m.content) },
};
`,
};

mkdirSync(dir, { recursive: true });
for (const [name, body] of Object.entries(files)) writeFileSync(path.join(dir, name), body);

const reg = 'src/calculators/registry.ts';
let r = readFileSync(reg, 'utf8');
r = r.replace(
  /(import \{ \w+ \} from '\.\/[^']+';\n)(?!import \{ \w+ \} from '\.\/)/,
  `$1import { ${camel} } from './${category}/${id}';\n`,
);
r = r.replace(
  /(export const MODULES: readonly CalculatorModule\[\] = \[\n(?:  \w+,\n)*)/,
  `$1  ${camel},\n`,
);
writeFileSync(reg, r);

const isl = 'src/calculators/islands.tsx';
let s = readFileSync(isl, 'utf8');
s = s.replace(
  /(export const ISLANDS[^{]+\{\n(?:.*\n)*?)(\};)/,
  `$1  '${id}': dynamic(() => import('./${category}/${id}/Island')),\n$2`,
);
writeFileSync(isl, s);

console.log(
  `Created ${dir} and registered it. Replace every TODO(...) marker; the content gate fails until you do.`,
);
