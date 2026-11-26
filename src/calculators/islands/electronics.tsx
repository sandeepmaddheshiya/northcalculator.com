'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { IslandProps } from '@/components/calc/CalculatorIsland';

/** electronics calculators: id → island chunk (ADR-028). Loaded only on electronics pages. */
const ISLANDS: Record<string, ComponentType<IslandProps>> = {
  'ohms-law': dynamic(() => import('../electronics/ohms-law/Island')),
  'electricity-cost': dynamic(() => import('../electronics/electricity-cost/Island')),
  resistors: dynamic(() => import('../electronics/resistors/Island')),
  'rc-time-constant': dynamic(() => import('../electronics/rc-time-constant/Island')),
  capacitor: dynamic(() => import('../electronics/capacitor/Island')),
  'voltage-divider': dynamic(() => import('../electronics/voltage-divider/Island')),
  coulomb: dynamic(() => import('../electronics/coulomb/Island')),
  reactance: dynamic(() => import('../electronics/reactance/Island')),
  impedance: dynamic(() => import('../electronics/impedance/Island')),
  transformer: dynamic(() => import('../electronics/transformer/Island')),
  'wire-resistance': dynamic(() => import('../electronics/wire-resistance/Island')),
  'rl-circuit': dynamic(() => import('../electronics/rl-circuit/Island')),
  'electric-potential': dynamic(() => import('../electronics/electric-potential/Island')),
};

export default function Islands({ id, ...props }: IslandProps & { id: string }) {
  const Island = ISLANDS[id];
  return Island ? <Island {...props} /> : null;
}
