import { describe, expect, it } from 'vitest';
import { breadcrumbs, faqPage, graph, website } from './jsonld';

describe('jsonld', () => {
  it('escapes < so the JSON cannot break out of the script tag', () => {
    const out = graph(faqPage([{ q: '</script><b>', a: 'x' }]));
    expect(out).not.toContain('</script>');
    expect(JSON.parse(out)['@graph'][0].mainEntity[0].name).toBe('</script><b>');
  });
  it('numbers breadcrumb positions from 1 with absolute URLs', () => {
    const b = breadcrumbs([
      { name: 'Home', path: '/en' },
      { name: 'Finance', path: '/en/finance' },
    ]);
    const items = b.itemListElement as { position: number; item: string }[];
    expect(items.map((i) => i.position)).toEqual([1, 2]);
    expect(items[1]!.item).toMatch(/^https?:\/\/.+\/en\/finance$/);
  });
  it('website has a SearchAction', () => {
    expect(JSON.stringify(website('en'))).toContain('SearchAction');
  });
});
