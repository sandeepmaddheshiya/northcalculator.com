import type { ReactNode } from 'react';
import { Icon } from './Icon';

const TONES = {
  info: { cls: 'border-brand/30 bg-brand-wash', icon: 'info', iconCls: 'text-brand' },
  warn: { cls: 'border-warning/30 bg-warning-wash', icon: 'warning', iconCls: 'text-warning' },
  danger: { cls: 'border-danger/30 bg-danger-wash', icon: 'warning', iconCls: 'text-danger' },
  success: { cls: 'border-success/30 bg-success-wash', icon: 'check', iconCls: 'text-success' },
} as const;

/** Inline note. Left rule + tinted wash; never a floating card. */
export function Callout({
  tone = 'info',
  title,
  children,
}: {
  tone?: keyof typeof TONES;
  title?: string;
  children: ReactNode;
}) {
  const t = TONES[tone];
  return (
    <div
      className={`flex gap-3 border-s-2 py-3 ps-4 pe-4 ${t.cls}`}
      role={tone === 'danger' ? 'alert' : undefined}
    >
      <Icon name={t.icon} size={18} className={`mt-0.5 shrink-0 ${t.iconCls}`} />
      <div className="text-sm text-text">
        {title && <p className="font-semibold">{title}</p>}
        <div className={title ? 'mt-0.5' : ''}>{children}</div>
      </div>
    </div>
  );
}
