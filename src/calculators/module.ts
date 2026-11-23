import type { CalculatorContent } from './content-types';
import type { CalculatorDefinition, ComputeFn } from './types';

/**
 * One calculator folder's server-side surface. Content loads lazily per page. The client island is
 * NOT referenced here: islands are registered in islands.tsx (a client module) so each one becomes
 * its own chunk, loaded only on its page. Importing islands from server code would put every
 * island into the shared layout chunk.
 */
export interface CalculatorModule {
  definition: CalculatorDefinition;
  compute: ComputeFn;
  content: Record<string, () => Promise<CalculatorContent>>;
  /** Optional build-time data (server only), passed to compute() as ctx.data and to the island. */
  data?: () => Promise<unknown>;
}
