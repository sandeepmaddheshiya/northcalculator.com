import 'server-only';
import { getModule } from './registry';
import type { CalculatorContent } from './content-types';

export async function loadContent(id: string, locale: string): Promise<CalculatorContent | null> {
  const loader = getModule(id)?.content[locale];
  return loader ? loader() : null;
}
