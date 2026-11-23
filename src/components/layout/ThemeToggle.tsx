'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@/components/ui/Icon';

type Theme = 'system' | 'light' | 'dark';
const ORDER: Theme[] = ['system', 'light', 'dark'];
const ICON = { system: 'monitor', light: 'sun', dark: 'moon' } as const;

function apply(theme: Theme) {
  const el = document.documentElement;
  if (theme === 'system') delete el.dataset.theme;
  else el.dataset.theme = theme;
  try {
    if (theme === 'system') localStorage.removeItem('nc-theme');
    else localStorage.setItem('nc-theme', theme);
  } catch {
    /* storage unavailable: theme still applies for this page view */
  }
}

export interface ThemeLabels {
  label: string;
  system: string;
  light: string;
  dark: string;
}

export function ThemeToggle({ labels }: { labels: ThemeLabels }) {
  const t = (k: keyof ThemeLabels) => labels[k];
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    const forced = document.documentElement.dataset.theme;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync with the pre-paint script's choice
    if (forced === 'light' || forced === 'dark') setTheme(forced);
  }, []);

  const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length]!;
  return (
    <button
      type="button"
      onClick={() => {
        apply(next);
        setTheme(next);
      }}
      className="text-muted hover:bg-sunken hover:text-text inline-flex size-10 items-center justify-center rounded-md transition-colors"
      aria-label={`${t('label')}: ${t(theme)}. ${t(next)}?`}
      title={`${t('label')}: ${t(theme)}`}
    >
      <Icon name={ICON[theme]} />
    </button>
  );
}
