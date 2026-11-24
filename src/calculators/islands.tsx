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
  'lcm-gcf': dynamic(() => import('./math/lcm-gcf/Island')),
  cagr: dynamic(() => import('./finance/cagr/Island')),
  margin: dynamic(() => import('./finance/margin/Island')),
  salary: dynamic(() => import('./finance/salary/Island')),
  grade: dynamic(() => import('./education/grade/Island')),
  'final-grade': dynamic(() => import('./education/final-grade/Island')),
  time: dynamic(() => import('./date-time/time/Island')),
  'percentage-change': dynamic(() => import('./math/percentage-change/Island')),
  ratio: dynamic(() => import('./math/ratio/Island')),
  rounding: dynamic(() => import('./math/rounding/Island')),
  'unit-price': dynamic(() => import('./everyday/unit-price/Island')),
  'week-number': dynamic(() => import('./date-time/week-number/Island')),
  'business-days': dynamic(() => import('./date-time/business-days/Island')),
  'percent-difference': dynamic(() => import('./math/percent-difference/Island')),
  'fuel-cost': dynamic(() => import('./everyday/fuel-cost/Island')),
  bmr: dynamic(() => import('./health/bmr/Island')),
  calorie: dynamic(() => import('./health/calorie/Island')),
  'heart-rate': dynamic(() => import('./health/heart-rate/Island')),
  'running-pace': dynamic(() => import('./health/running-pace/Island')),
  exponent: dynamic(() => import('./math/exponent/Island')),
  root: dynamic(() => import('./math/root/Island')),
  logarithm: dynamic(() => import('./math/logarithm/Island')),
  'scientific-notation': dynamic(() => import('./math/scientific-notation/Island')),
  roi: dynamic(() => import('./finance/roi/Island')),
  'savings-goal': dynamic(() => import('./finance/savings-goal/Island')),
  'days-until': dynamic(() => import('./date-time/days-until/Island')),
  'random-number': dynamic(() => import('./math/random-number/Island')),
  dice: dynamic(() => import('./math/dice/Island')),
};

export function CalculatorIslandFor({ id, ...props }: IslandProps & { id: string }) {
  const Island = ISLANDS[id];
  return Island ? <Island {...props} /> : null;
}
