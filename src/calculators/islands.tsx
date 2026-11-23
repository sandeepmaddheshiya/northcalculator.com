'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { IslandProps } from '@/components/calc/CalculatorIsland';

/**
 * Client island per calculator id. Each entry is a separate chunk (BRIEF §10: ≤ 30 KB gz per
 * calculator), server-rendered at build time and loaded only on its own page.
 * Every module in registry.ts must have an entry here (checked by the content gate).
 */
export const ISLANDS: Record<string, ComponentType<IslandProps>> = {
  mortgage: dynamic(() => import('./finance/mortgage/Island')),
  loan: dynamic(() => import('./finance/loan/Island')),
  'compound-interest': dynamic(() => import('./finance/compound-interest/Island')),
  percentage: dynamic(() => import('./math/percentage/Island')),
  'scientific-calculator': dynamic(() => import('./math/scientific/Island')),
  bmi: dynamic(() => import('./health/bmi/Island')),
  age: dynamic(() => import('./date-time/age/Island')),
  'unit-converter': dynamic(() => import('./conversion/unit-converter/Island')),
  'currency-converter': dynamic(() => import('./conversion/currency-converter/Island')),
  gpa: dynamic(() => import('./education/gpa/Island')),
  tip: dynamic(() => import('./everyday/tip/Island')),
  discount: dynamic(() => import('./everyday/discount/Island')),
  'sales-tax': dynamic(() => import('./finance/sales-tax/Island')),
  'simple-interest': dynamic(() => import('./finance/simple-interest/Island')),
  'date-difference': dynamic(() => import('./date-time/date-difference/Island')),
  'date-add': dynamic(() => import('./date-time/date-add/Island')),
  fraction: dynamic(() => import('./math/fraction/Island')),
  average: dynamic(() => import('./math/average/Island')),
};

export function CalculatorIslandFor({ id, ...props }: IslandProps & { id: string }) {
  const Island = ISLANDS[id];
  return Island ? <Island {...props} /> : null;
}
