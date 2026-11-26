import type { CalculatorModule } from '@/calculators/module';
import { definition } from './definition';
import { compute } from './compute';

export const anova: CalculatorModule = {
  definition,
  compute,
  content: { en: () => import('./content.en').then((m) => m.content) },
};
