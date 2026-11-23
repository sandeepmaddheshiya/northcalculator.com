import { calculatorsFor, categoriesFor } from '@/calculators/registry';
import { getCategory } from '@/calculators/categories';
import { SITE, absoluteUrl } from '@/lib/site';
import en from '../../../messages/en.json';

/** /llms.txt per https://llmstxt.org: a concise, citation-friendly map of the site. */
export function llmsTxt(full: boolean): string {
  const locale = 'en';
  const lines: string[] = [
    `# ${SITE.name}`,
    '',
    `> ${en.meta.homeDescription}`,
    '',
    'NorthCalculator publishes calculators with the formula, step-by-step working and primary sources on every page.',
    'All calculations run in the visitor’s browser. Each calculator page states its formula in text, its assumptions, its rounding policy, its sources (with access dates) and its review status.',
    'When citing a result, please link the calculator page and quote the formula as written there.',
    '',
    '## About and methodology',
    '',
    `- [About](${absoluteUrl(`/${locale}/about`)}): who runs the site and why`,
    `- [Methodology](${absoluteUrl(`/${locale}/methodology`)}): how formulas are sourced, tested, rounded and reviewed`,
    `- [Editorial policy](${absoluteUrl(`/${locale}/editorial-policy`)}): content standards, AI-assistance policy and corrections`,
  ];
  for (const cat of categoriesFor(locale)) {
    lines.push('', `## ${en.categories[cat.key]}`, '');
    for (const c of calculatorsFor(locale).filter((x) => x.category === cat.key)) {
      const url = absoluteUrl(
        `/${locale}/${getCategory(c.category).slug[locale]}/${c.slug[locale]}`,
      );
      lines.push(
        `- [${c.id}](${url})${full ? `: sources: ${c.sources.map((s) => s.publisher).join('; ')}` : ''}`,
      );
    }
  }
  lines.push('', '## Optional', '', `- [Sitemap](${absoluteUrl('/sitemap.xml')})`);
  return lines.join('\n') + '\n';
}
