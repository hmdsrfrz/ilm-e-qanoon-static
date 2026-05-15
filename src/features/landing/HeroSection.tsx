import { useUiStore } from '@/store/uiStore';

const STATS = [
  { label: 'Articles',      value: '280' },
  { label: 'Legal Domains', value: '6'   },
  { label: 'Amendments',    value: '26'  },
  { label: 'Statutes',      value: '10'  },
];

export default function HeroSection() {
  const theme  = useUiStore(s => s.theme);
  const isDark = theme === 'dark';

  const bg     = isDark ? '#0a0a0a'  : '#F5F0E8';
  const ink    = isDark ? '#F5F0E8'  : '#1a1a1a';
  const accent = isDark ? '#00b848'  : '#01411C';
  const muted  = isDark ? '#7A6E64'  : '#6B6456';
  const border = isDark ? '#1e2a1e'  : '#D4CFC7';

  return (
    <section
      style={{ minHeight: 'calc(100vh - 48px)', backgroundColor: bg, transition: 'background-color 0.3s ease' }}
      className="flex flex-col justify-between px-4 sm:px-8 pt-10 pb-8"
    >
      {/* Headline */}
      <div className="flex-1 flex flex-col justify-center">
        <h1
          className="font-display leading-none"
          style={{ fontSize: 'clamp(56px, 12vw, 200px)', color: ink, transition: 'color 0.3s ease' }}
        >
          <span style={{ display: 'block' }}>
            YOUR{' '}
            <span style={{ color: accent, transition: 'color 0.3s ease' }}>RIGHTS.</span>
          </span>
          <span style={{ display: 'block' }}>
            YOUR{' '}
            <span style={{ color: accent, transition: 'color 0.3s ease' }}>LAW.</span>
          </span>
        </h1>

        <p
          className="font-mono uppercase mt-6 sm:mt-8"
          style={{
            fontSize:      '10px',
            letterSpacing: '0.22em',
            color:         muted,
            maxWidth:      '520px',
            lineHeight:    1.8,
            transition:    'color 0.3s ease',
          }}
        >
          Constitution · Penal Code · Procedural Law
          <br className="hidden sm:block" />
          {' '}Family Law · Evidence · Administration
        </p>
      </div>

      {/* Stats bar */}
      <div
        style={{ borderTop: `1px solid ${border}`, paddingTop: '20px', transition: 'border-color 0.3s ease' }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        {STATS.map((s) => (
          <div key={s.label}>
            <p className="font-mono uppercase" style={{ fontSize: '9px', color: muted, letterSpacing: '0.3em', transition: 'color 0.3s ease' }}>
              {s.label}
            </p>
            <p className="font-display leading-none" style={{ fontSize: 'clamp(32px, 5vw, 48px)', color: accent, transition: 'color 0.3s ease' }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
