'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { IslandProps } from '@/components/calc/CalculatorIsland';

/** finance calculators: id → island chunk (ADR-028). Loaded only on finance pages. */
const ISLANDS: Record<string, ComponentType<IslandProps>> = {
  mortgage: dynamic(() => import('../finance/mortgage/Island')),
  loan: dynamic(() => import('../finance/loan/Island')),
  'compound-interest': dynamic(() => import('../finance/compound-interest/Island')),
  'sales-tax': dynamic(() => import('../finance/sales-tax/Island')),
  'simple-interest': dynamic(() => import('../finance/simple-interest/Island')),
  cagr: dynamic(() => import('../finance/cagr/Island')),
  margin: dynamic(() => import('../finance/margin/Island')),
  salary: dynamic(() => import('../finance/salary/Island')),
  roi: dynamic(() => import('../finance/roi/Island')),
  'savings-goal': dynamic(() => import('../finance/savings-goal/Island')),
  'auto-loan': dynamic(() => import('../finance/auto-loan/Island')),
  dti: dynamic(() => import('../finance/dti/Island')),
  'break-even': dynamic(() => import('../finance/break-even/Island')),
  inflation: dynamic(() => import('../finance/inflation/Island')),
  'debt-payoff': dynamic(() => import('../finance/debt-payoff/Island')),
  vat: dynamic(() => import('../finance/vat/Island')),
  npv: dynamic(() => import('../finance/npv/Island')),
  depreciation: dynamic(() => import('../finance/depreciation/Island')),
};

export default function Islands({ id, ...props }: IslandProps & { id: string }) {
  const Island = ISLANDS[id];
  return Island ? <Island {...props} /> : null;
}
