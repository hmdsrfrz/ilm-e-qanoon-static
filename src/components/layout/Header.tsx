import { FileText, GitFork } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUiStore } from '@/store/uiStore';

export default function Header() {
  const toggleSidebar      = useUiStore((s) => s.toggleSidebar);
  const sidebarOpen        = useUiStore((s) => s.sidebarOpen);
  const returnToLanding    = useUiStore((s) => s.returnToLanding);
  const openDocumentViewer = useUiStore((s) => s.openDocumentViewer);
  const navigate           = useNavigate();
  const location           = useLocation();
  const isGraph            = location.pathname === '/graph';

  return (
    <header
      style={{
        flexShrink: 0,
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        borderBottom: '1px solid #2a2a2a',
        backgroundColor: '#0a0a0a',
      }}
    >
      {/* LEFT: hamburger + breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

        {/* Hamburger toggle */}
        <button
          onClick={toggleSidebar}
          title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          {/* Three-line hamburger — pure CSS, no icon library */}
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                display: 'block',
                width: '18px',
                height: '1.5px',
                backgroundColor: sidebarOpen ? '#009942' : '#9A8D80',
                transition: 'background-color 0.15s',
              }}
            />
          ))}
        </button>

        <span
          className="font-mono"
          style={{
            fontSize: '10px', color: '#9A8D80',
            letterSpacing: '0.25em', textTransform: 'uppercase',
          }}
        >
          Constitution of Pakistan · Archive
        </span>
      </div>

      {/* RIGHT: back to landing + status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>

        {/* Graph Explorer */}
        <button
          onClick={() => navigate(isGraph ? '/chat/2f327dd1-c218-4c5e-bd78-8b85e09c9fad' : '/graph')}
          title="Graph Explorer"
          style={{
            display:         'flex',
            alignItems:      'center',
            gap:             '6px',
            backgroundColor: isGraph ? 'rgba(0,153,66,0.1)' : 'transparent',
            border:          `1px solid ${isGraph ? '#009942' : '#2a2a2a'}`,
            cursor:          'pointer',
            fontFamily:      'IBM Plex Mono, monospace',
            fontSize:        '9px',
            color:           isGraph ? '#009942' : '#9A8D80',
            letterSpacing:   '0.25em',
            textTransform:   'uppercase',
            padding:         '4px 10px',
            transition:      'border-color 0.15s, color 0.15s, background-color 0.15s',
          }}
          onMouseEnter={e => {
            if (isGraph) return;
            const b = e.currentTarget;
            b.style.borderColor = '#009942';
            b.style.color       = '#009942';
          }}
          onMouseLeave={e => {
            if (isGraph) return;
            const b = e.currentTarget;
            b.style.borderColor = '#2a2a2a';
            b.style.color       = '#9A8D80';
          }}
        >
          <GitFork size={11} />
          <span className="hidden sm:inline">Graph Explorer</span>
        </button>

        {/* Document viewer */}
        <button
          onClick={openDocumentViewer}
          title="View source document"
          style={{
            display:         'flex',
            alignItems:      'center',
            gap:             '6px',
            backgroundColor: 'transparent',
            border:          '1px solid #2a2a2a',
            cursor:          'pointer',
            fontFamily:      'IBM Plex Mono, monospace',
            fontSize:        '9px',
            color:           '#9A8D80',
            letterSpacing:   '0.25em',
            textTransform:   'uppercase',
            padding:         '4px 10px',
            transition:      'border-color 0.15s, color 0.15s',
          }}
          onMouseEnter={e => {
            const b = e.currentTarget;
            b.style.borderColor = '#009942';
            b.style.color       = '#009942';
          }}
          onMouseLeave={e => {
            const b = e.currentTarget;
            b.style.borderColor = '#2a2a2a';
            b.style.color       = '#9A8D80';
          }}
        >
          <FileText size={11} />
          <span className="hidden sm:inline">View Source</span>
        </button>

        {/* Back to landing */}
        <button
          onClick={returnToLanding}
          style={{
            backgroundColor: 'transparent',
            border: '1px solid #2a2a2a',
            cursor: 'pointer',
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: '9px',
            color: '#9A8D80',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            padding: '4px 10px',
            transition: 'border-color 0.15s, color 0.15s',
          }}
          onMouseEnter={(e) => {
            const b = e.currentTarget;
            b.style.borderColor = '#009942';
            b.style.color = '#009942';
          }}
          onMouseLeave={(e) => {
            const b = e.currentTarget;
            b.style.borderColor = '#2a2a2a';
            b.style.color = '#9A8D80';
          }}
        >
          ← Home
        </button>

        {/* Corpus active status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: '5px', height: '5px',
              borderRadius: '50%', backgroundColor: '#009942',
            }}
            className="animate-pulse-dot"
          />
          <span
            className="font-mono"
            style={{
              fontSize: '9px', color: '#9A8D80',
              letterSpacing: '0.2em', textTransform: 'uppercase',
            }}
          >
            Corpus Active
          </span>
        </div>

      </div>
    </header>
  );
}