import { useNavigate } from 'react-router-dom';
import { useChatStore } from '@/store/chatStore';
import { useUiStore } from '@/store/uiStore';
import { SidebarDocuments } from './SidebarDocuments';

export default function Sidebar() {
  const navigate        = useNavigate();
  const sessions        = useChatStore((s) => s.sessions);
  const activeSessionId = useChatStore((s) => s.activeSessionId);
  const createSession   = useChatStore((s) => s.createSession);
  const selectSession   = useChatStore((s) => s.selectSession);
  const sidebarOpen     = useUiStore((s) => s.sidebarOpen);

  const handleNewQuery = async () => {
    const id = await createSession();
    navigate(`/chat/${id}`);
  };

  const handleSelectSession = async (id: string) => {
    await selectSession(id);
    navigate(`/chat/${id}`);
  };

  return (
    <aside
      style={{
        /*
          Width transitions between 200px (open) and 0px (closed).
          overflow: hidden clips content when width is 0.
          transition on width creates the slide animation.
          flexShrink: 0 ensures the aside never collapses on its own.
        */
        width: sidebarOpen ? '200px' : '0px',
        flexShrink: 0,
        height: '100%',
        overflow: 'hidden',
        backgroundColor: '#0a0a0a',
        borderRight: sidebarOpen ? '1px solid #2a2a2a' : 'none',
        transition: 'width 0.25s ease, border 0.25s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Inner content at fixed 200px width — never squishes */}
      <div
        style={{
          width: '200px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >

        {/* ── ZONE 1: Header ── */}
        <div
          style={{
            flexShrink: 0,
            padding: '20px 16px 16px',
            borderBottom: '1px solid #2a2a2a',
          }}
        >
          <p
            style={{
              fontSize: '20px',
              color: '#009942',
              lineHeight: 1.2,
              fontFamily: "'Jameel Noori Nastaleeq', 'Urdu Typesetting', 'Noto Nastaliq Urdu', serif",
              direction: 'rtl',
              textAlign: 'right',
            }}
          >
            علمِ قانون
          </p>
          <p
            className="font-mono"
            style={{
              fontSize: '9px',
              color: '#9A8D80',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              marginTop: '4px',
              marginBottom: '16px',
            }}
          >
            Pakistan · 1973
          </p>

          {/* Status dot */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <span
              style={{
                width: '6px', height: '6px',
                borderRadius: '50%',
                backgroundColor: '#009942',
                flexShrink: 0,
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
              Corpus Loaded
            </span>
          </div>

          {/* New Query button */}
          <button
            onClick={handleNewQuery}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '8px 12px',
              border: '1px solid #2a2a2a',
              backgroundColor: 'transparent',
              color: 'rgba(245,240,232,0.5)',
              cursor: 'pointer',
              transition: 'border-color 0.15s, color 0.15s',
            }}
            className="font-mono uppercase hover:border-pk-green hover:text-pk-green"
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#009942';
              (e.currentTarget as HTMLButtonElement).style.color = '#009942';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#2a2a2a';
              (e.currentTarget as HTMLButtonElement).style.color = 'rgba(245,240,232,0.5)';
            }}
          >
            <span style={{ fontSize: '11px', letterSpacing: '0.15em' }}>+ New Query</span>
          </button>
        </div>

        {/* ── ZONE 2: Sessions scroll ── */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            padding: '12px 0',
          }}
        >
          <p
            className="font-mono"
            style={{
              fontSize: '10px', color: '#9A8D80',
              letterSpacing: '0.3em', textTransform: 'uppercase',
              padding: '0 16px', marginBottom: '8px',
            }}
          >
            Queries
          </p>
          
          {sessions.length === 0 ? (
            <p
              className="font-mono"
              style={{ fontSize: '11px', color: '#9A8D80', padding: '8px 16px' }}
            >
              No queries yet
            </p>
          ) : (
            sessions.map((session) => {
              const isActive = session.id === activeSessionId;
              return (
                <div
                  key={session.id}
                  onClick={() => handleSelectSession(session.id)}
                  style={{
                    padding: '10px 16px',
                    cursor: 'pointer',
                    borderBottom: '1px solid rgba(42,42,42,0.5)',
                    borderLeft: isActive ? '2px solid #009942' : '2px solid transparent',
                    backgroundColor: isActive ? 'rgba(0,153,66,0.08)' : 'transparent',
                    transition: 'background-color 0.1s',
                  }}
                  className="hover:bg-pk-green/5"
                >
                  <p
                    className="font-mono"
                    style={{
                      fontSize: '11px',
                      color: isActive ? '#F5F0E8' : 'rgba(245,240,232,0.55)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {session.title}
                  </p>
                  <p
                    className="font-mono"
                    style={{ fontSize: '9px', color: '#9A8D80', marginTop: '2px', letterSpacing: '0.1em' }}
                  >
                    {new Date(session.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* ── ZONE 3: Documents ── */}
        <div style={{ flexShrink: 0, borderTop: '1px solid #2a2a2a' }}>
          <SidebarDocuments />
        </div>

        {/* ── ZONE 4: Footer ── */}
        <div
          style={{
            flexShrink: 0,
            padding: '10px 16px',
            borderTop: '1px solid #2a2a2a',
          }}
        >
          <p
            className="font-mono"
            style={{
              fontSize: '9px', color: '#9A8D80',
              textAlign: 'center', letterSpacing: '0.2em', textTransform: 'uppercase',
            }}
          >
            Archive v1.0
          </p>
        </div>

      </div>
    </aside>
  );
}