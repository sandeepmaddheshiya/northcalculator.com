import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';

export const dynamic = 'force-static';

// ADR-008: all major search and AI crawlers are allowed to read content.
const DISALLOW = ['/api/', '/dev/', '/*/search$', '/*/search?', '/*/search-index.json$'];

export default function robots(): MetadataRoute.Robots {
  const agents = [
    'Googlebot',
    'Bingbot',
    'GPTBot',
    'OAI-SearchBot',
    'ChatGPT-User',
    'ClaudeBot',
    'Claude-SearchBot',
    'PerplexityBot',
    'Google-Extended',
    'Applebot',
    'DuckDuckBot',
  ];
  return {
    rules: [
      ...agents.map((userAgent) => ({ userAgent, allow: '/', disallow: DISALLOW })),
      { userAgent: '*', allow: '/', disallow: DISALLOW },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
