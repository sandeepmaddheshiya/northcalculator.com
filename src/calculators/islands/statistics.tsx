'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { IslandProps } from '@/components/calc/CalculatorIsland';

/** statistics calculators: id → island chunk (ADR-028). Loaded only on statistics pages. */
const ISLANDS: Record<string, ComponentType<IslandProps>> = {
  combinations: dynamic(() => import('../statistics/combinations/Island')),
  'z-score': dynamic(() => import('../statistics/z-score/Island')),
  probability: dynamic(() => import('../statistics/probability/Island')),
  'confidence-interval': dynamic(() => import('../statistics/confidence-interval/Island')),
  'sample-size': dynamic(() => import('../statistics/sample-size/Island')),
  'linear-regression': dynamic(() => import('../statistics/linear-regression/Island')),
  binomial: dynamic(() => import('../statistics/binomial/Island')),
  poisson: dynamic(() => import('../statistics/poisson/Island')),
  percentile: dynamic(() => import('../statistics/percentile/Island')),
  'expected-value': dynamic(() => import('../statistics/expected-value/Island')),
  'standard-deviation': dynamic(() => import('../statistics/standard-deviation/Island')),
  't-test': dynamic(() => import('../statistics/t-test/Island')),
  'two-sample-t-test': dynamic(() => import('../statistics/two-sample-t-test/Island')),
  'chi-square': dynamic(() => import('../statistics/chi-square/Island')),
  'proportion-test': dynamic(() => import('../statistics/proportion-test/Island')),
  'paired-t-test': dynamic(() => import('../statistics/paired-t-test/Island')),
  exponential: dynamic(() => import('../statistics/exponential/Island')),
  anova: dynamic(() => import('../statistics/anova/Island')),
};

export default function Islands({ id, ...props }: IslandProps & { id: string }) {
  const Island = ISLANDS[id];
  return Island ? <Island {...props} /> : null;
}
