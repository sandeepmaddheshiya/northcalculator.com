import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';

/**
 * Build-time OG image (1200×630). Typography-led, matching the site: the title,
 * an optional sample result in tabular figures, and the brand mark. No stock imagery.
 */
export async function ogImage({
  title,
  kicker,
  sample,
}: {
  title: string;
  kicker: string;
  sample?: string;
}) {
  const dir = path.join(process.cwd(), 'assets/fonts');
  const [regular, semibold] = await Promise.all([
    readFile(path.join(dir, 'ibm-plex-sans-latin-400-normal.woff')),
    readFile(path.join(dir, 'ibm-plex-sans-latin-600-normal.woff')),
  ]);
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px 80px',
        background: '#f6f8fb',
        backgroundImage:
          'linear-gradient(#e3e8ef 1px, transparent 1px), linear-gradient(90deg, #e3e8ef 1px, transparent 1px)',
        backgroundSize: '32px 32px',
        color: '#0b1f3a',
        fontFamily: 'Plex',
      }}
    >
      <div
        style={{
          display: 'flex',
          fontSize: 28,
          letterSpacing: 4,
          color: '#0a5cc0',
          textTransform: 'uppercase',
        }}
      >
        {kicker}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            fontSize: 76,
            fontWeight: 600,
            lineHeight: 1.05,
            letterSpacing: -2,
            maxWidth: 980,
          }}
        >
          {title}
        </div>
        {sample && <div style={{ marginTop: 28, fontSize: 44, color: '#4a5870' }}>{sample}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', fontSize: 34, fontWeight: 600 }}>
        <span>North</span>
        <span style={{ color: '#0a5cc0' }}>Calculator</span>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Plex', data: regular, weight: 400, style: 'normal' },
        { name: 'Plex', data: semibold, weight: 600, style: 'normal' },
      ],
    },
  );
}
