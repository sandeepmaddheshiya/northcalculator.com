import { llmsTxt } from '@/lib/seo/llms';

export const dynamic = 'force-static';

export function GET() {
  return new Response(llmsTxt(true), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
