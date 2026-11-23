import { resolveLocale } from '@/i18n/server';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { ogImage } from '@/lib/og';
import { MODULES, getModule } from '@/calculators/registry';
import { loadContent } from '@/calculators/content-loader';
import { makeFmt } from '@/calculators/fmt';
import { defaultValues } from '@/calculators/url-state';
import { buildToday } from '@/lib/build-date';
import { fill } from '@/lib/fill';

export const dynamic = 'force-static';
export const dynamicParams = false;

/** Static OG images: /{locale}/og/home.png and /{locale}/og/{calculatorId}.png with a sample result. */
export function generateStaticParams() {
  return routing.locales.flatMap((locale) => [
    { locale, name: 'home.png' },
    ...MODULES.filter((m) => m.definition.locales.includes(locale)).map((m) => ({
      locale,
      name: `${m.definition.id}.png`,
    })),
  ]);
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ locale: string; name: string }> },
) {
  const p = await params;
  const locale = resolveLocale(p.locale);
  const id = p.name.replace(/\.png$/, '');
  const mod = id === 'home' ? undefined : getModule(id);
  if (mod) {
    const [content, data, tc] = await Promise.all([
      loadContent(id, locale),
      mod.data?.(),
      getTranslations({ locale, namespace: 'categories' }),
    ]);
    const def = mod.definition;
    const today = buildToday();
    const inputs = defaultValues(def, today);
    const currency =
      def.currency && 'fixed' in def.currency
        ? def.currency.fixed
        : def.currency
          ? String(inputs[def.currency.input])
          : 'USD';
    const fmt = makeFmt(locale, currency);
    const r = mod.compute(inputs, {
      today,
      fmt,
      data,
      t: (k, v) => fill(content!.ui[k] ?? k, v ?? {}),
    });
    return ogImage({
      title: content!.name,
      kicker: tc(def.category),
      sample: content!.ogSample(r, fmt),
    });
  }
  const t = await getTranslations({ locale, namespace: 'home' });
  return ogImage({ title: t('title'), kicker: t('eyebrow') });
}
