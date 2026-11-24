'use client';

import { CalculatorIsland, type IslandProps } from '@/components/calc/CalculatorIsland';
import { definition } from './definition';
import { compute } from './compute';

export default function Island(props: IslandProps) {
  return <CalculatorIsland {...props} def={definition} compute={compute} />;
}
