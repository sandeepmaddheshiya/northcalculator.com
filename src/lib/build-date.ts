/**
 * The build's "today" (ISO date, UTC). Server-rendered defaults use it; the client island
 * replaces it with the visitor's local date after hydration. Override with BUILD_DATE for
 * reproducible builds and tests.
 */
export function buildToday(): string {
  return process.env.BUILD_DATE ?? new Date().toISOString().slice(0, 10);
}
