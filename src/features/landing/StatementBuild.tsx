import { useEffect, useRef, useState } from 'react';
import { useUiStore } from '@/store/uiStore';

const LINES = [
  { text: 'The law governs everything.',               big: true,  accent: false },
  { text: 'Most Pakistanis have never read it.',       big: true,  accent: false },
  { text: 'Constitution.',                             big: false, accent: true  },
  { text: 'Penal Code. Family Law.',                   big: false, accent: true  },
  { text: 'Procedure. Evidence. Administration.',      big: false, accent: true  },
  { text: 'Ten statutes. Six legal domains.',          big: true,  accent: false },
  { text: 'All indexed.',                              big: false, accent: false },
  { text: 'Ask in plain language.',                    big: true,  accent: false },
  { text: 'Get the exact text of the law.',            big: false, accent: true  },
  { text: 'No lawyers required.',                      big: true,  accent: false },
];

export default function StatementBuild() {
  const [visible, setVisible] = useState<Set<number>>(new Set());
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  const theme  = useUiStore(s => s.theme);
  const isDark = theme === 'dark';

  const ink    = isDark ? '#F5F0E8' : '#1a1a1a';
  const accent = isDark ? '#00b848' : '#01411C';
  const bg     = isDark ? '#0a0a0a' : '#F5F0E8';

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    refs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisible(prev => new Set([...prev, i]));
            obs.disconnect();
          }
        },
        { threshold: 0.15 },
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  return (
    <section
      style={{
        backgroundColor: bg,
        padding:         'clamp(60px, 10vw, 120px) clamp(16px, 5vw, 32px)',
        transition:      'background-color 0.3s ease',
      }}
    >
      {LINES.map((line, i) => (
        <div
          key={i}
          ref={el => { refs.current[i] = el; }}
          style={{ overflow: 'hidden', marginBottom: '12px' }}
        >
          <div
            className="font-display"
            style={{
              fontSize:   line.big
                ? 'clamp(36px, 7vw, 100px)'
                : 'clamp(24px, 5vw, 72px)',
              lineHeight: 1.05,
              color:      line.accent ? accent : ink,
              opacity:    visible.has(i) ? 1 : 0,
              transform:  visible.has(i) ? 'translateY(0)' : 'translateY(24px)',
              transition: `opacity 0.7s ease ${i * 0.07}s, transform 0.7s ease ${i * 0.07}s, color 0.3s ease`,
            }}
          >
            {line.text}
          </div>
        </div>
      ))}
    </section>
  );
}
