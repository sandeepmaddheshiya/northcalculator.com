import type { CalculatorModule } from '@/calculators/module';
import { definition } from './definition';
import { compute } from './compute';
import snapshot from './rates.snapshot.json';

export const currencyConverter: CalculatorModule = {
  definition,
  compute,
  content: { en: () => import('./content.en').then((m) => m.content) },
  // Build-time snapshot: the page renders a real default result without JavaScript (ADR-007).
  data: async () => snapshot,
};
