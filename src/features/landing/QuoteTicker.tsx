import { useUiStore } from '@/store/uiStore';

// Direct statutory text from indexed corpus — no person attribution
const QUOTES = [
  `No person shall be deprived of life or liberty save in accordance with law. — Art. 9, Constitution`,
  `All citizens are equal before law and entitled to equal protection of law. — Art. 25, Constitution`,
  `Every person shall be entitled to a fair trial for the determination of civil rights or criminal charges. — Art. 10-A, Constitution`,
  `No person shall be subjected to torture for the purpose of extracting evidence. — Art. 14, Constitution`,
  `Whoever desires a court to give judgment must prove that the facts they assert exist. — Qanun-e-Shahadat, Art. 117`,
  `Every marriage solemnised under Muslim Law shall be registered. — Muslim Family Laws Ordinance, 1961`,
  `No person arrested shall be detained without being informed of the grounds for such arrest. — Art. 10, Constitution`,
  `The State shall ensure the elimination of Riba as expeditiously as possible. — Art. 38(f), Constitution`,
  `No person shall be compelled to be a witness against himself. — Art. 13(b), Constitution`,
  `The dignity of man and the privacy of home shall be inviolable. — Art. 14, Constitution`,
];

const tickerContent = QUOTES.join('     ·     ');

interface Props { reverse?: boolean; }

export default function QuoteTicker({ reverse = false }: Props) {
  const theme  = useUiStore(s => s.theme);
  const isDark = theme === 'dark';

  const bg     = isDark ? '#0d1a0d' : '#111111';
  const topB   = isDark ? '#1e2a1e' : '#2a2a2a';
  const botB   = isDark ? '#1e2a1e' : '#2a2a2a';

  return (
    <div
      style={{
        backgroundColor: bg,
        borderTop:       `1px solid ${topB}`,
        borderBottom:    `1px solid ${botB}`,
        overflow:        'hidden',
        padding:         '14px 0',
        width:           '100%',
        transition:      'background-color 0.3s ease',
      }}
    >
      <div
        style={{
          display:   'flex',
          whiteSpace: 'nowrap',
          width:     'max-content',
          animation: `ticker 80s linear infinite ${reverse ? 'reverse' : 'normal'}`,
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.animationPlayState = 'paused'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.animationPlayState = 'running'; }}
      >
        <span
          className="font-quote"
          style={{
            fontSize:  '12px',
            color:     'rgba(245,240,232,0.78)',
            fontStyle: 'italic',
            padding:   '0 40px',
          }}
        >
          {tickerContent}&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp;{tickerContent}
        </span>
      </div>
    </div>
  );
}
