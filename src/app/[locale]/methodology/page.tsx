import { resolveLocale } from '@/i18n/server';
import { StaticPage, staticPageMetadata } from '@/components/content/StaticPage';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return staticPageMetadata(resolveLocale((await params).locale), 'methodology');
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  return <StaticPage locale={resolveLocale((await params).locale)} id="methodology" />;
}
