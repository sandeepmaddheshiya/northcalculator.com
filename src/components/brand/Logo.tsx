import { WORDMARK } from './wordmark';

/**
 * Inline, themeable NorthCalculator logo (redrawn from the owner's raster, ADR-009).
 * Colours follow tokens so dark mode is automatic. `idPrefix` must be unique per page.
 */
const INK = 'var(--tok-brand-ink)';
const PAPER = 'var(--tok-surface)';
const BLUE = 'var(--tok-brand)';

export function LogoMark({ idPrefix, className }: { idPrefix: string; className?: string }) {
  return (
    <svg viewBox="0 0 120 136" className={className} aria-hidden="true" focusable="false">
      <MarkBody idp={idPrefix} />
    </svg>
  );
}

export function Logo({
  idPrefix,
  className,
  withCom = false,
}: {
  idPrefix: string;
  className?: string;
  withCom?: boolean;
}) {
  const width = 132 + (withCom ? WORDMARK.width : WORDMARK.widthNoCom) + 4;
  return (
    <svg
      viewBox={`0 0 ${width} 136`}
      className={className}
      role="img"
      aria-label="NorthCalculator"
      focusable="false"
    >
      <MarkBody idp={idPrefix} />
      <g transform="translate(132 22)">
        <path d={WORDMARK.north} fill={INK} />
        <path d={WORDMARK.calc} fill={BLUE} />
        {withCom && <path d={WORDMARK.com} fill={INK} />}
      </g>
    </svg>
  );
}

function MarkBody({ idp }: { idp: string }) {
  return (
    <>
      <defs>
        <mask id={`${idp}-ring`} maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="136">
          <rect width="120" height="136" fill="#fff" />
          <rect x="23" y="43" width="74" height="94" rx="14" fill="#000" />
          <path d="M60 8 L74 46 L46 46 Z" fill="#000" />
        </mask>
        <clipPath id={`${idp}-screen`}>
          <rect x="34" y="54" width="52" height="26" rx="4" />
        </clipPath>
      </defs>
      <circle cx="60" cy="66" r="46" fill="none" stroke={BLUE} strokeWidth="4.5" mask={`url(#${idp}-ring)`} />
      <path d="M1 67 L19 61.5 L16.5 67 L19 72.5 Z" fill={BLUE} />
      <path d="M119 67 L101 61.5 L103.5 67 L101 72.5 Z" fill={BLUE} />
      <path d="M60 15 L70.5 42 L60 36.5 L49.5 42 Z" fill={INK} />
      <path d="M55 11 V1 H57.6 L63 7.4 V1 H65 V11 H62.4 L57 4.6 V11 Z" fill={INK} />
      <rect x="28" y="48" width="64" height="84" rx="10" fill={INK} />
      <rect x="34" y="54" width="52" height="26" rx="4" fill={PAPER} />
      <path
        clipPath={`url(#${idp}-screen)`}
        d="M34 78 L47 67.5 L51.5 71 L63 59 L72.5 68.5 L76.5 65.5 L87 75 V81 H34 Z"
        fill={BLUE}
      />
      <rect x="34" y="86" width="24" height="18" rx="3" fill={PAPER} />
      <rect x="62" y="86" width="24" height="18" rx="3" fill={PAPER} />
      <rect x="34" y="108" width="24" height="18" rx="3" fill={PAPER} />
      <rect x="62" y="108" width="24" height="18" rx="3" fill={BLUE} />
      <path
        d="M46 90.5 V99.5 M41.5 95 H50.5 M69.5 95 H78.5 M42.6 113.6 L49.4 120.4 M49.4 113.6 L42.6 120.4"
        stroke={INK}
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M69.5 115 H78.5 M69.5 119 H78.5" stroke={PAPER} strokeWidth="2.4" strokeLinecap="round" fill="none" />
    </>
  );
}
