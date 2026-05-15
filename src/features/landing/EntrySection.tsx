import { useUiStore } from '@/store/uiStore';

const CORPUS = [
  { ref: 'Art. 9',    title: 'Security of Person',               domain: 'Constitution'   },
  { ref: 'Art. 10-A', title: 'Right to Fair Trial',              domain: 'Constitution'   },
  { ref: 'Art. 14',   title: 'Inviolability of Dignity',         domain: 'Constitution'   },
  { ref: 'Art. 19',   title: 'Freedom of Speech',                domain: 'Constitution'   },
  { ref: 'Art. 25',   title: 'Equality of Citizens',             domain: 'Constitution'   },
  { ref: 'S. 302',    title: 'Punishment for Qatl-e-Amd',        domain: 'Penal Code'     },
  { ref: 'S. 420',    title: 'Cheating and Dishonesty',          domain: 'Penal Code'     },
  { ref: 'S. 5',      title: 'Registration of Marriage',         domain: 'Family Law'     },
  { ref: 'Art. 117',  title: 'Burden of Proof',                  domain: 'Evidence'       },
  { ref: 'S. 154',    title: 'First Information Report',         domain: 'Cr.P.C.'        },
  { ref: 'S. 497',    title: 'Bail Provisions',                  domain: 'Cr.P.C.'        },
  { ref: 'Ch. IV',    title: 'Service Regulations',              domain: 'Estacode'       },
];

export default function EntrySection() {
  const enterApp = useUiStore(s => s.enterApp);
  const theme    = useUiStore(s => s.theme);
  const isDark   = theme === 'dark';

  const bg      = isDark ? '#0a0a0a'  : '#F5F0E8';
  const ink     = isDark ? '#F5F0E8'  : '#1a1a1a';
  const accent  = isDark ? '#00b848'  : '#01411C';
  const muted   = isDark ? '#7A6E64'  : '#6B6456';
  const border  = isDark ? '#1e2a1e'  : '#D4CFC7';
  const ctaBg   = isDark ? '#00b848'  : '#01411C';
  const ctaText = isDark ? '#0a0a0a'  : '#F5F0E8';
  const ctaHoverBorder = isDark ? '#00b848' : '#01411C';

  return (
    <section
      style={{ backgroundColor: bg, transition: 'background-color 0.3s ease' }}
      className="min-h-screen flex flex-col px-4 sm:px-8 pt-16 sm:pt-20 pb-16"
    >
      <p className="font-mono uppercase" style={{ fontSize: '10px', letterSpacing: '0.4em', color: muted, marginBottom: '40px', transition: 'color 0.3s ease' }}>
        // Corpus Index
      </p>

      <h2
        className="font-display leading-none"
        style={{ fontSize: 'clamp(44px, 9vw, 140px)', color: ink, marginBottom: '48px', transition: 'color 0.3s ease' }}
      >
        QUERY THE<br />
        <span style={{ color: accent, transition: 'color 0.3s ease' }}>ARCHIVE.</span>
      </h2>

      {/* Corpus list */}
      <div style={{ flex: 1, borderTop: `1px solid ${border}`, marginBottom: '48px', transition: 'border-color 0.3s ease' }}>
        {CORPUS.map((item) => (
          <div
            key={`${item.ref}-${item.domain}`}
            style={{
              display:       'flex',
              alignItems:    'baseline',
              justifyContent:'space-between',
              padding:       '14px 0',
              borderBottom:  `1px solid ${border}`,
              gap:           '12px',
              transition:    'border-color 0.3s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '20px', minWidth: 0 }}>
              <span
                className="font-mono flex-shrink-0"
                style={{ fontSize: '10px', color: accent, letterSpacing: '0.1em', minWidth: '52px', transition: 'color 0.3s ease' }}
              >
                {item.ref}
              </span>
              <span
                className="font-mono truncate"
                style={{ fontSize: '13px', color: ink, transition: 'color 0.3s ease' }}
              >
                {item.title}
              </span>
            </div>
            <span
              className="font-mono uppercase flex-shrink-0 hidden sm:block"
              style={{ fontSize: '9px', color: muted, letterSpacing: '0.2em', transition: 'color 0.3s ease' }}
            >
              {item.domain}
            </span>
          </div>
        ))}
        <div style={{ paddingTop: '12px' }}>
          <span className="font-mono" style={{ fontSize: '10px', color: muted }}>
            + thousands of sections across all domains
          </span>
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col items-start gap-5">
        <p className="font-mono" style={{ fontSize: '11px', color: muted, maxWidth: '380px', lineHeight: 1.7, transition: 'color 0.3s ease' }}>
          Ask in plain Urdu or English. Get exact article and section references, legal context, and plain-language explanation — across all indexed statutes.
        </p>

        <button
          onClick={enterApp}
          className="group flex items-center gap-4 font-mono uppercase active:scale-[0.98] transition-transform"
          style={{
            backgroundColor: ctaBg,
            color:           ctaText,
            fontSize:        '12px',
            letterSpacing:   '0.2em',
            padding:         'clamp(14px, 2.5vw, 20px) clamp(24px, 4vw, 40px)',
            border:          `2px solid ${ctaHoverBorder}`,
            cursor:          'pointer',
            transition:      'background-color 0.2s, color 0.2s, border-color 0.3s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.color = ctaHoverBorder;
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = ctaBg;
            (e.currentTarget as HTMLButtonElement).style.color = ctaText;
          }}
        >
          <span>ENTER THE ARCHIVE</span>
          <span className="text-lg transition-transform duration-200 group-hover:translate-x-1">→</span>
        </button>

        <p className="font-mono uppercase" style={{ fontSize: '9px', color: muted, letterSpacing: '0.3em', transition: 'color 0.3s ease' }}>
          Powered by LightRAG · 6 Legal Domains Indexed
        </p>
      </div>
    </section>
  );
}
