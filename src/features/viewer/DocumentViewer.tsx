import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { X, Search, ChevronUp, ChevronDown, FileText, Loader2 } from 'lucide-react';
import { useUiStore } from '@/store/uiStore';
import { useDebounce } from '@/hooks/useDebounce';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

interface Doc { id: string; filename: string; bucket_id: string; status: string; }

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default function DocumentViewer() {
  const isOpen = useUiStore(s => s.documentViewerOpen);
  const close  = useUiStore(s => s.closeDocumentViewer);

  const [docs,       setDocs]       = useState<Doc[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [text,       setText]       = useState('');
  const [filename,   setFilename]   = useState('');
  const [loading,    setLoading]    = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [matchIdx,    setMatchIdx]   = useState(0);
  // Debounce so the expensive regex/split only fires after typing stops
  const search = useDebounce(searchInput, 180);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const matchRefs      = useRef<(HTMLElement | null)[]>([]);

  // Load doc list once when first opened
  useEffect(() => {
    if (!isOpen || docs.length > 0) return;
    fetch(`${API_URL}/documents?user_id=secy_main`)
      .then(r => r.json())
      .then(d => {
        const ready = (d.documents || []).filter((doc: Doc) => doc.status === 'ready');
        setDocs(ready);
        if (ready.length > 0) setSelectedId(ready[0].id);
      })
      .catch(() => {});
  }, [isOpen]);

  // Load text when selection changes
  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    setText('');
    setSearchInput('');
    setMatchIdx(0);
    fetch(`${API_URL}/documents/${selectedId}/text`)
      .then(r => r.json())
      .then(d => { setText(d.text || ''); setFilename(d.filename || ''); })
      .catch(() => setText('Failed to load document.'))
      .finally(() => setLoading(false));
  }, [selectedId]);

  // Focus search when panel opens
  useEffect(() => {
    if (isOpen) setTimeout(() => searchInputRef.current?.focus(), 320);
  }, [isOpen]);

  // Scroll active match into view
  useEffect(() => {
    matchRefs.current[matchIdx]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [matchIdx]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { close(); return; }
      if (e.key === 'Enter' && document.activeElement === searchInputRef.current) {
        e.preventDefault();
        // Read live count from refs — avoids stale totalMatches closure
        const count = matchRefs.current.filter(Boolean).length;
        if (count > 0) setMatchIdx(i => (i + 1) % count);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, close]);

  const totalMatches = useMemo(() => {
    if (!search.trim() || !text) return 0;
    return (text.match(new RegExp(escapeRegex(search), 'gi')) || []).length;
  }, [search, text]);

  // Recomputes only when search term or document text changes — NOT on matchIdx.
  // Active-match highlighting is applied imperatively via refs so navigation
  // never triggers a full document re-render.
  const renderedText = useMemo(() => {
    if (!search.trim() || !text) return null;
    const re    = new RegExp(`(${escapeRegex(search)})`, 'gi');
    const parts = text.split(re);
    matchRefs.current = [];
    let mIdx = 0;
    return parts.map((part, i) => {
      if (re.test(part)) {
        re.lastIndex = 0;
        const idx = mIdx++;
        return (
          <mark
            key={i}
            ref={el => { matchRefs.current[idx] = el; }}
            style={{
              backgroundColor: 'rgba(0,153,66,0.15)',
              color:           '#F8F4EE',
              borderRadius:    '2px',
              padding:         '0 1px',
            }}
          >
            {part}
          </mark>
        );
      }
      return <span key={i}>{part}</span>;
    });
  }, [search, text]);

  // Imperatively update active-match style — no re-render needed
  useEffect(() => {
    matchRefs.current.forEach((el, i) => {
      if (!el) return;
      el.style.backgroundColor = i === matchIdx ? 'rgba(0,153,66,0.5)' : 'rgba(0,153,66,0.15)';
      el.style.outline          = i === matchIdx ? '1px solid #009942' : 'none';
    });
  }, [matchIdx]);

  const prev = useCallback(() => setMatchIdx(i => Math.max(0, i - 1)), []);
  const next = useCallback(() => setMatchIdx(i => Math.min(totalMatches - 1, i + 1)), [totalMatches]);

  return (
    <div
      style={{
        position:        'fixed',
        top:             '48px',   // below the app header
        right:           0,
        bottom:          0,
        width:           'clamp(320px, 40vw, 520px)',
        backgroundColor: '#0d0d0d',
        borderLeft:      '1px solid #2a2a2a',
        display:         'flex',
        flexDirection:   'column',
        transform:       isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition:      'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex:          50,
        // Panel shadow facing left
        boxShadow:       isOpen ? '-8px 0 32px rgba(0,0,0,0.6)' : 'none',
      }}
    >
      {/* ── Top bar ── */}
      <div
        style={{
          display:      'flex',
          alignItems:   'center',
          gap:          '8px',
          padding:      '0 12px',
          height:       '44px',
          borderBottom: '1px solid #2a2a2a',
          flexShrink:   0,
        }}
      >
        <FileText size={12} style={{ color: '#009942', flexShrink: 0 }} />

        {/* Doc selector */}
        <select
          value={selectedId}
          onChange={e => setSelectedId(e.target.value)}
          style={{
            flex:            1,
            minWidth:        0,
            backgroundColor: 'transparent',
            border:          'none',
            borderBottom:    '1px solid #2a2a2a',
            color:           '#F8F4EE',
            fontFamily:      'IBM Plex Mono, monospace',
            fontSize:        '10px',
            padding:         '2px 0',
            cursor:          'pointer',
            outline:         'none',
          }}
        >
          {docs.length === 0 && <option value="">No documents ready</option>}
          {docs.map(d => (
            <option key={d.id} value={d.id} style={{ backgroundColor: '#111' }}>
              {d.filename}
            </option>
          ))}
        </select>

        {/* Close */}
        <button
          onClick={close}
          title="Close (Esc)"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9A8D80', padding: '4px', display: 'flex', flexShrink: 0 }}
        >
          <X size={14} />
        </button>
      </div>

      {/* ── Search bar ── */}
      <div
        style={{
          display:      'flex',
          alignItems:   'center',
          gap:          '8px',
          padding:      '0 12px',
          height:       '40px',
          borderBottom: '1px solid #2a2a2a',
          flexShrink:   0,
        }}
      >
        <Search size={11} style={{ color: '#9A8D80', flexShrink: 0 }} />
        <input
          ref={searchInputRef}
          value={searchInput}
          onChange={e => { setSearchInput(e.target.value); setMatchIdx(0); }}
          placeholder="Search article, section, keyword…"
          style={{
            flex:            1,
            backgroundColor: 'transparent',
            border:          'none',
            borderBottom:    `1px solid ${searchInput ? '#009942' : 'transparent'}`,
            color:           '#F8F4EE',
            fontFamily:      'IBM Plex Mono, monospace',
            fontSize:        '11px',
            padding:         '2px 0',
            outline:         'none',
            transition:      'border-color 0.15s',
          }}
        />
        {searchInput.trim() && (
          <>
            <span style={{
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize:   '9px',
              color:      totalMatches > 0 ? '#009942' : '#9A8D80',
              flexShrink: 0,
              minWidth:   '44px',
              textAlign:  'right',
            }}>
              {totalMatches > 0 ? `${matchIdx + 1}/${totalMatches}` : 'none'}
            </span>
            <button
              onClick={prev}
              disabled={matchIdx === 0}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: matchIdx > 0 ? '#9A8D80' : '#2a2a2a', padding: '2px', display: 'flex' }}
            >
              <ChevronUp size={13} />
            </button>
            <button
              onClick={next}
              disabled={matchIdx >= totalMatches - 1}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: matchIdx < totalMatches - 1 ? '#9A8D80' : '#2a2a2a', padding: '2px', display: 'flex' }}
            >
              <ChevronDown size={13} />
            </button>
          </>
        )}
      </div>

      {/* ── Document body ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '24px' }}>
            <Loader2 size={13} className="animate-spin" style={{ color: '#009942' }} />
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '9px', color: '#9A8D80', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
              Loading…
            </span>
          </div>
        ) : (
          <div
            style={{
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize:   '12px',
              color:      '#C8C3BB',
              lineHeight: 1.85,
              whiteSpace: 'pre-wrap',
              wordBreak:  'break-word',
            }}
          >
            {search.trim() ? renderedText : text}
          </div>
        )}
      </div>

      {/* ── Status bar ── */}
      {!loading && text && (
        <div style={{
          flexShrink:   0,
          padding:      '5px 12px',
          borderTop:    '1px solid #2a2a2a',
          display:      'flex',
          gap:          '12px',
          alignItems:   'center',
        }}>
          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '8px', color: '#9A8D80', letterSpacing: '0.15em', textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {filename}
          </span>
          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '8px', color: '#3a3a3a', flexShrink: 0 }}>
            {text.length.toLocaleString()} chars
          </span>
        </div>
      )}
    </div>
  );
}
