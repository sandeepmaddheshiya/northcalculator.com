'use client';

import { useState } from 'react';
import { NumberField, type ValidationMessages } from '@/components/ui/NumberField';
import { ResultHero } from '@/components/calc/ResultHero';
import { Steps } from '@/components/calc/Steps';
import { Segmented } from '@/components/ui/Segmented';
import { formatNumber } from '@/engine/format';

/** Gallery demo of the calculator island: live "X% of Y" with real arithmetic. */
export function PercentDemo({ messages }: { messages: ValidationMessages }) {
  const [pct, setPct] = useState<number | null>(15);
  const [base, setBase] = useState<number | null>(240);
  const [region, setRegion] = useState<'en-US' | 'en-IN' | 'de'>('en-US');
  const result =
    pct !== null && base !== null ? Math.round(((pct * base) / 100) * 1e10) / 1e10 : null;
  const f = (n: number) => formatNumber(n, region, { maxDecimals: 4 });

  return (
    <form
      className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="space-y-5">
        <NumberField
          label="Percentage"
          value={pct}
          onChange={setPct}
          suffix="%"
          formatLocale={region}
          messages={messages}
          allowNegative
        />
        <NumberField
          label="Of the number"
          value={base}
          onChange={setBase}
          formatLocale={region}
          messages={messages}
          allowNegative
        />
        <Segmented
          label="Number format"
          value={region}
          onChange={setRegion}
          options={[
            { value: 'en-US', label: '1,234.5' },
            { value: 'en-IN', label: '1,23,456' },
            { value: 'de', label: '1.234,5' },
          ]}
        />
      </div>
      <div className="rounded-md border border-line bg-grid bg-surface p-6">
        <ResultHero
          label={`${pct === null ? '…' : f(pct)}% of ${base === null ? '…' : f(base)}`}
          value={result}
          format={f}
          caption={result === null ? undefined : `That is ${f(pct!)} hundredths of ${f(base!)}.`}
        />
        {result !== null && (
          <div className="mt-6 border-t border-line pt-5">
            <Steps
              steps={[
                {
                  text: 'Turn the percentage into a decimal by dividing by 100.',
                  math: `${f(pct!)} ÷ 100 = ${f(pct! / 100)}`,
                },
                {
                  text: 'Multiply the decimal by the number.',
                  math: `${f(pct! / 100)} × ${f(base!)} = ${f(result)}`,
                },
              ]}
            />
          </div>
        )}
      </div>
    </form>
  );
}
