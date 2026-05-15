import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MarkdownRenderer from './MarkdownRenderer';
import { BUCKETS } from '@/features/documents/DocumentUpload';

interface SourceDoc { id: string; filename: string; }

interface Message {
  id:        string;
  role:      'user' | 'assistant' | 'error' | 'system';
  content:   string;
  timestamp: Date;
  sources?:  string | null;
  metadata?: Record<string, unknown>;
}

interface Props {
  message: Message;
}

export default function MessageBubble({ message }: Props) {
  const [sourcesOpen, setSourcesOpen] = useState(false);

  if (message.content === '__thinking__') return null;

  const ts = new Date(message.timestamp).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  /* ── USER MESSAGE ─────────────────────────────────────────────────── */
  if (message.role === 'user') {
    return (
      <div
        style={{
          padding: '16px 0',
          borderBottom: '1px solid rgba(42,42,42,0.6)',
        }}
      >
        <p
          style={{
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: '9px',
            color: '#9A8D80',
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}
        >
          &gt; Query &nbsp;·&nbsp; {ts}
        </p>
        <p
          style={{
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: '13px',
            color: 'rgba(245,240,232,0.75)',
            lineHeight: 1.7,
          }}
        >
          {message.content}
        </p>
      </div>
    );
  }

  /* ── ASSISTANT MESSAGE ────────────────────────────────────────────── */
  if (message.role === 'assistant') {
    return (
      <div
        style={{
          padding: '20px 0',
          borderBottom: '1px solid rgba(42,42,42,0.6)',
          /*
            LEFT BORDER only in green — NOT background.
            This is the only green on the bubble.
          */
          borderLeft: '2px solid #009942',
          paddingLeft: '20px',
        }}
      >
        {/* Citation header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '14px',
          }}
        >
          <span
            style={{
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: '9px',
              color: '#009942',
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
            }}
          >
            # Archive Response
          </span>
          <span
            style={{
              width: '48px',
              height: '1px',
              backgroundColor: 'rgba(0,153,66,0.25)',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: '9px',
              color: '#9A8D80',
              letterSpacing: '0.1em',
            }}
          >
            {ts}
          </span>
        </div>

        {/* Response body */}
        <MarkdownRenderer content={message.content} />

        {/* Sources panel */}
        {message.sources && (
          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #2a2a2a' }}>
            {/* Source attribution tags — bucket + PDFs */}
            {(() => {
              const bucketId   = message.metadata?.bucket_id as string | undefined;
              const sourceDocs = message.metadata?.source_docs as SourceDoc[] | undefined;
              const bucket     = BUCKETS.find(b => b.id === bucketId);
              return (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                  {bucket && (
                    <span style={{
                      fontFamily: 'IBM Plex Mono, monospace',
                      fontSize: '9px',
                      color: '#009942',
                      border: '1px solid rgba(0,153,66,0.35)',
                      padding: '2px 8px',
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                    }}>
                      {bucket.label}
                    </span>
                  )}
                  {sourceDocs?.map(doc => (
                    <span key={doc.id} style={{
                      fontFamily: 'IBM Plex Mono, monospace',
                      fontSize: '9px',
                      color: '#9A8D80',
                      border: '1px solid #2a2a2a',
                      padding: '2px 8px',
                      letterSpacing: '0.1em',
                    }}>
                      {doc.filename}
                    </span>
                  ))}
                </div>
              );
            })()}

            <button
              onClick={() => setSourcesOpen(!sourcesOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'IBM Plex Mono, monospace',
                fontSize: '9px',
                color: '#9A8D80',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                padding: 0,
              }}
            >
              <span style={{ color: '#009942' }}>{sourcesOpen ? '▼' : '▶'}</span>
              Raw retrieval context
            </button>

            <AnimatePresence>
              {sourcesOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div
                    style={{
                      marginTop: '12px',
                      padding: '12px 16px',
                      backgroundColor: 'rgba(0,0,0,0.4)',
                      borderLeft: '2px solid #2a2a2a',
                      fontSize: '11px',
                      color: '#9A8D80',
                      lineHeight: 1.7,
                      maxHeight: '300px',
                      overflowY: 'auto',
                    }}
                  >
                    <MarkdownRenderer content={message.sources} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    );
  }

  /* ── ERROR MESSAGE ────────────────────────────────────────────────── */
  if (message.role === 'error') {
    return (
      <div
        style={{
          padding: '14px 16px',
          borderLeft: '2px solid #8B0000',
          backgroundColor: 'rgba(139,0,0,0.06)',
          marginBottom: '8px',
        }}
      >
        <p
          style={{
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: '9px',
            color: '#8B0000',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            marginBottom: '6px',
          }}
        >
          ! System Error
        </p>
        <p
          style={{
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: '12px',
            color: 'rgba(139,0,0,0.8)',
            lineHeight: 1.6,
          }}
        >
          {message.content}
        </p>
      </div>
    );
  }

  return null;
}