import { Moon, Sun } from 'lucide-react';
import { useUiStore } from '@/store/uiStore';
import HeroSection    from './HeroSection';
import QuoteTicker    from './QuoteTicker';
import StatementBuild from './StatementBuild';
import EntrySection   from './EntrySection';

function LandingNav() {
  const theme    = useUiStore(s => s.theme);
  const setTheme = useUiStore(s => s.setTheme);
  const isDark   = theme === 'dark';

  const navBg   = isDark ? 'rgba(10,10,10,0.95)'    : 'rgba(245,240,232,0.95)';
  const border  = isDark ? '#1e2a1e'                 : '#D4CFC7';
  const text    = isDark ? '#7A6E64'                 : '#6B6456';
  const iconClr = isDark ? '#7A6E64'                 : '#6B6456';

  return (
    <nav
      style={{
        position:        'fixed',
        top: 0, left: 0, right: 0,
        zIndex:          50,
        backgroundColor: navBg,
        borderBottom:    `1px solid ${border}`,
        backdropFilter:  'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
    >
      <div style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        padding:        '0 clamp(16px, 4vw, 32px)',
        height:         '48px',
      }}>
        <span className="font-mono uppercase" style={{ fontSize: '11px', letterSpacing: '0.3em', color: text }}>
          Ilm-e-Qanoon
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span
            className="font-mono uppercase"
            style={{ fontSize: '11px', letterSpacing: '0.3em', color: text, display: 'none' }}
            // visible on sm+ via inline media — Tailwind class below handles it
          />
          <span
            className="hidden sm:block font-mono uppercase"
            style={{ fontSize: '11px', letterSpacing: '0.3em', color: text }}
          >
            Legal Archive
          </span>

          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label="Toggle theme"
            style={{
              display:    'flex',
              alignItems: 'center',
              padding:    '6px',
              background: 'none',
              border:     'none',
              cursor:     'pointer',
              color:      iconClr,
              borderRadius: '4px',
              transition: 'color 0.2s, opacity 0.2s',
            }}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default function LandingPage() {
  const theme  = useUiStore(s => s.theme);
  const isDark = theme === 'dark';

  return (
    <div
      style={{
        height:          '100%',
        overflowY:       'auto',
        overflowX:       'hidden',
        backgroundColor: isDark ? '#0a0a0a' : '#F5F0E8',
        scrollBehavior:  'smooth',
        transition:      'background-color 0.3s ease',
      }}
    >
      <LandingNav />
      <div style={{ paddingTop: '48px' }}>
        <HeroSection />
        <QuoteTicker />
        <StatementBuild />
        <QuoteTicker reverse />
        <EntrySection />
      </div>
    </div>
  );
}
