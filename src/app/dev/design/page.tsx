import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Logo, LogoMark } from '@/components/brand/Logo';
import { Icon, type IconName } from '@/components/ui/Icon';
import { CategoryGlyph, type CategoryKey } from '@/components/ui/CategoryGlyph';
import { Button } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Callout';
import { Kbd } from '@/components/ui/Kbd';
import { ResultList } from '@/components/calc/ResultList';
import { Formula } from '@/components/calc/Formula';
import { DataTable } from '@/components/calc/DataTable';
import { Prose } from '@/components/content/Prose';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { contrast } from '@/lib/contrast';
import { formatNumber } from '@/engine/format';
import { validationMessages, themeLabels } from '@/i18n/labels';
import { PercentDemo } from './PercentDemo';
import { GalleryControls } from './GalleryControls';

/* Real numbers: a $400,000 home, 20% down, 6.5% APR, 30 years (standard annuity formula). */
function mortgage(principal: number, annualRate: number, years: number) {
  const r = annualRate / 12;
  const n = years * 12;
  const payment = (principal * r * (1 + r) ** n) / ((1 + r) ** n - 1);
  let balance = principal;
  const firstYear: { month: number; interest: number; principal: number; balance: number }[] = [];
  for (let m = 1; m <= 12; m++) {
    const interest = balance * r;
    const princ = payment - interest;
    balance -= princ;
    firstYear.push({ month: m, interest, principal: princ, balance });
  }
  return { payment, total: payment * n, interest: payment * n - principal, firstYear };
}

function tokens(block: 'light' | 'dark') {
  const css = readFileSync(path.join(process.cwd(), 'src/app/globals.css'), 'utf8');
  const s = css.slice(css.indexOf(`/* tokens:${block} */`), css.indexOf(`/* /tokens:${block} */`));
  return [...s.matchAll(/--tok-([a-z-]+):\s*(#[0-9a-f]{6});/g)].map((m) => ({
    name: m[1]!,
    hex: m[2]!,
  }));
}

const ICONS: IconName[] = [
  'search',
  'copy',
  'link',
  'print',
  'reset',
  'check',
  'steps',
  'download',
  'swap',
  'info',
  'warning',
  'lock',
  'globe',
  'sun',
  'moon',
  'monitor',
  'north',
  'close',
  'chevronDown',
  'chevronRight',
  'arrowRight',
  'menu',
];
const CATS: CategoryKey[] = [
  'finance',
  'math',
  'health',
  'date-time',
  'conversion',
  'education',
  'everyday',
  'geometry',
  'statistics',
  'physics',
  'electronics',
  'chemistry',
  'construction',
];

function Section({
  id,
  title,
  note,
  children,
}: {
  id: string;
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="grid grid-cols-[minmax(0,1fr)] gap-6 border-t border-line py-12 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-12"
    >
      <header>
        <h2 className="font-mono text-xs tracking-[0.16em] text-brand uppercase">{title}</h2>
        {note && <p className="mt-2 text-sm text-muted">{note}</p>}
      </header>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

export default async function DesignGallery() {
  const m = mortgage(320_000, 0.065, 30);
  const usd = (n: number) =>
    formatNumber(n, 'en-US', { kind: 'currency', currency: 'USD', decimals: 2 });
  const light = tokens('light');
  const dark = tokens('dark');
  const [msgs, theme] = await Promise.all([validationMessages('en'), themeLabels('en')]);

  return (
    <main className="mx-auto max-w-[1240px] px-4 pb-24 sm:px-6">
      <div className="flex items-center justify-between py-6">
        <Logo idPrefix="gal" className="h-8 w-auto" />
        <div className="flex items-center gap-3">
          <GalleryControls />
          <ThemeToggle labels={theme} />
        </div>
      </div>
      <h1 className="mt-6 text-3xl font-semibold">Design system</h1>
      <p className="mt-2 max-w-2xl text-muted">
        The precision instrument: typography does the work, color is spent on meaning, and the
        result is the hero. Every number on this page is computed, not typed. Source of truth:{' '}
        <code className="font-mono text-sm">docs/design-system.md</code>.
      </p>

      <Section
        id="brand"
        title="Brand"
        note="Redrawn from the owner’s logo as SVG. Colors follow theme tokens."
      >
        <div className="flex flex-wrap items-end gap-10">
          <Logo idPrefix="g1" withCom className="h-16 w-auto" />
          <LogoMark idPrefix="g2" className="h-16 w-auto" />
          <LogoMark idPrefix="g3" className="h-8 w-auto" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/favicon.svg" alt="Favicon" width={32} height={32} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/favicon.svg" alt="Favicon at 16 pixels" width={16} height={16} />
        </div>
      </Section>

      <Section
        id="color"
        title="Color"
        note="Semantic tokens only. Contrast against the page background is computed live and enforced by tests."
      >
        {[
          ['Light', light],
          ['Dark', dark],
        ].map(([label, list]) => {
          const tk = list as { name: string; hex: string }[];
          const bg = tk.find((t) => t.name === 'bg')!.hex;
          return (
            <div key={label as string} className="mb-8">
              <h3 className="mb-3 text-sm font-semibold">{label as string}</h3>
              <ul className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
                {tk.map((t) => (
                  <li key={t.name} className="flex items-center gap-3">
                    <span
                      className="size-9 shrink-0 rounded-xs border border-line"
                      style={{ background: t.hex }}
                    />
                    <span className="min-w-0 text-xs">
                      <span className="block font-medium">{t.name}</span>
                      <span className="num block font-mono text-subtle">
                        {t.hex} · {contrast(t.hex, bg).toFixed(2)}:1
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </Section>

      <Section
        id="type"
        title="Typography"
        note="IBM Plex Sans for words, Plex Mono for formulas, units and working. All figures are tabular and lining."
      >
        <div className="space-y-5">
          <p className="num text-result font-semibold tracking-tight">{usd(m.payment)}</p>
          <p className="text-3xl font-semibold tracking-tight">Mortgage calculator</p>
          <p className="text-2xl font-semibold">How the monthly payment is worked out</p>
          <p className="text-xl font-semibold">Worked example</p>
          <p className="max-w-[68ch] text-[17px] leading-[1.7]">
            Body text sits at 17px with a 1.7 line height and a 68-character measure, so
            explanations read comfortably on phones and desktops alike.
          </p>
          <p className="text-sm text-muted">Secondary text, 14px, muted.</p>
          <p className="font-mono text-sm">M = P × r(1 + r)ⁿ ÷ ((1 + r)ⁿ − 1)</p>
          <div className="num grid max-w-md grid-cols-2 gap-x-8 font-mono text-sm">
            <span>1,111,111.11</span>
            <span>8,888,888.88</span>
            <span> 12,34,567.00</span>
            <span> −0.07</span>
          </div>
        </div>
      </Section>

      <Section
        id="calculator"
        title="Calculator island"
        note="Live results with no Calculate button. Try typing “1 000”, “$15” or “2,5”. Enter moves to the next field."
      >
        <PercentDemo messages={msgs} />
      </Section>

      <Section
        id="results"
        title="Results"
        note={`Computed: $400,000 home, 20% down, 6.5% APR, 30-year fixed.`}
      >
        <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-2">
          <ResultList
            items={[
              { label: 'Monthly principal & interest', value: usd(m.payment), emphasis: true },
              { label: 'Loan amount', value: usd(320_000) },
              { label: 'Total of 360 payments', value: usd(m.total) },
              { label: 'Total interest', value: usd(m.interest) },
            ]}
          />
          <Formula
            label="Annuity payment"
            where={[
              { symbol: 'M', meaning: 'monthly payment' },
              { symbol: 'P', meaning: 'loan amount ($320,000)' },
              { symbol: 'r', meaning: 'monthly rate (6.5% ÷ 12)' },
              { symbol: 'n', meaning: 'number of payments (360)' },
            ]}
          >
            {'M = P · r(1 + r)ⁿ / ((1 + r)ⁿ − 1)'}
          </Formula>
        </div>
        <div className="mt-8">
          <DataTable
            caption="First year of the amortization schedule"
            columns={['Month', 'Interest', 'Principal', 'Balance']}
            rows={m.firstYear.map((r) => [
              r.month,
              usd(r.interest),
              usd(r.principal),
              usd(r.balance),
            ])}
          />
        </div>
      </Section>

      <Section id="controls" title="Controls">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">
            <Icon name="link" size={18} /> Copy link
          </Button>
          <Button>
            <Icon name="print" size={18} /> Print
          </Button>
          <Button variant="ghost">
            <Icon name="reset" size={18} /> Reset
          </Button>
          <Button size="sm">
            <Icon name="steps" size={16} /> Show the working
          </Button>
          <Button disabled>Disabled</Button>
          <span className="text-sm text-muted">
            Search with <Kbd>Ctrl K</Kbd> or <Kbd>/</Kbd>
          </span>
        </div>
      </Section>

      <Section
        id="notes"
        title="Notes and warnings"
        note="A left rule and tinted wash. Never a floating card."
      >
        <div className="grid max-w-2xl gap-3">
          <Callout tone="info">
            Rates are reference rates published once a day, not live trading prices.
          </Callout>
          <Callout tone="warn" title="Educational estimate">
            BMI does not distinguish muscle from fat. See a clinician for a personal assessment.
          </Callout>
          <Callout tone="danger">The down payment is larger than the home price.</Callout>
          <Callout tone="success">Link copied. It reopens this exact result.</Callout>
        </div>
      </Section>

      <Section
        id="icons"
        title="Icons and glyphs"
        note="Drawn for NorthCalculator on a 24-unit grid with a 1.6 stroke."
      >
        <ul className="grid grid-cols-6 gap-4 sm:grid-cols-11">
          {ICONS.map((n) => (
            <li key={n} className="flex flex-col items-center gap-1 text-muted">
              <Icon name={n} size={24} />
              <span className="text-[10px] text-subtle">{n}</span>
            </li>
          ))}
        </ul>
        <ul className="mt-8 flex flex-wrap gap-6">
          {CATS.map((c) => (
            <li key={c} className="flex items-center gap-2 text-sm font-medium">
              <CategoryGlyph category={c} size={28} />
              {c}
            </li>
          ))}
        </ul>
      </Section>

      <Section id="prose" title="Explanation content">
        <Prose>
          <h2>How the monthly payment is calculated</h2>
          <p>
            A fixed-rate mortgage is repaid in equal monthly installments. Each payment first covers
            the interest that built up over the month; the rest reduces the balance. Early on, most
            of the payment is interest: in month one of this example,{' '}
            {usd(m.firstYear[0]!.interest)} of the {usd(m.payment)} payment is interest.
          </p>
          <ul>
            <li>The rate used is the annual rate divided by 12.</li>
            <li>
              Intermediate values keep full precision; only the displayed amounts are rounded to
              cents.
            </li>
          </ul>
        </Prose>
      </Section>
    </main>
  );
}
