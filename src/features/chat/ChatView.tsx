import { useEffect, useRef, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, ShieldAlert, Cpu } from 'lucide-react';
import { useChat } from './useChat';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { config } from '@/store/configStore';
import { useChatStore } from '@/store/chatStore';
import WelcomeScreen from '@/features/welcome/WelcomeScreen';

export default function ChatView() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const location = useLocation();
  const initialPrompt = location.state?.initialPrompt as string;
  const initialSent = useRef(false);

  const [bucket, setBucket] = useState('auto');
  // Hardcoded fallback covers all known buckets — the fetch below updates the list
  // if the backend returns additional ones or the set changes.
  const [availableBuckets, setAvailableBuckets] = useState<string[]>([
    'auto', 'constitution', 'family_law', 'federal_admin', 'local_govt', 'procedural_law',
  ]);

  useEffect(() => {
    const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
    fetch(`${API}/buckets`)
      .then(r => r.json())
      .then((d: { buckets: string[] }) => {
        if (d.buckets?.length) setAvailableBuckets(['auto', ...d.buckets]);
      })
      .catch(() => {}); // fallback list stays if fetch fails
  }, []);

  const { messages, isLoading, sendMessage, error } = useChat(sessionId || null, bucket);
  const { sessions } = useChatStore();
  const currentSession = sessions.find((s) => s.id === sessionId);

  // Trigger initial prompt if passed from welcome screen
  useEffect(() => {
    if (sessionId && initialPrompt && !initialSent.current && messages.length === 0) {
      initialSent.current = true;
      sendMessage(initialPrompt);
    }
  }, [sessionId, initialPrompt, sendMessage, messages.length]);

  if (!sessionId || !currentSession) {
    return (
      <div className="flex h-full items-center justify-center p-8 bg-pk-black">
        <div className="flex flex-col items-center gap-4 text-pk-red">
          <ShieldAlert size={48} className="animate-pulse" />
          <h2 className="font-display text-3xl uppercase tracking-widest">Session Not Found</h2>
          <p className="font-mono text-xs opacity-60">ID: {sessionId || 'NULL'}</p>
        </div>
      </div>
    );
  }

  return (
    /*
      Full height flex column.
      height: 100% works because Shell's content area gives it a concrete height.
    */
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: '#0a0a0a',
        position: 'relative',
      }}
    >
      {/* Session Header / Info */}
      <div 
        className="flex items-center justify-between px-6 py-3 border-b border-pk-border/30 bg-pk-black/20 z-10"
        style={{ flexShrink: 0 }}
      >
        <div className="flex items-center gap-3">
          <Terminal size={14} className="text-pk-green opacity-60" />
          <h2 className="font-mono text-[10px] text-pk-paper uppercase tracking-widest truncate max-w-[200px] md:max-w-md">
            {currentSession.title}
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            <Cpu size={12} className="text-pk-muted" />
            <span className="text-[9px] font-mono text-pk-muted uppercase">Kernel: {config.app.version}</span>
          </div>
        </div>
      </div>

      {/* ── Message area: takes all remaining height, scrolls internally ── */}
      <div
        style={{
          flex: 1,
          minHeight: 0,           /* CRITICAL — allows shrinking below content height */
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '24px 32px',
          zIndex: 10,
        }}
      >
        {messages.length === 0 ? (
          <WelcomeScreen onSendMessage={sendMessage} />
        ) : (
          <MessageList messages={messages} />
        )}
      </div>

      {/* ── Input: pinned to bottom, never scrolls away ── */}
      <div
        style={{
          flexShrink: 0,           /* CRITICAL — never shrinks, always visible */
          borderTop: '1px solid #2a2a2a',
          padding: '16px 32px',
          backgroundColor: '#0a0a0a',
          position: 'relative',
          zIndex: 20,
        }}
      >
        <ChatInput
          onSend={sendMessage}
          loading={isLoading}
          disabled={isLoading}
          domain={bucket}
          domains={availableBuckets}
          onDomainChange={setBucket}
        />
        
        {/* Error Overlay (minimal) */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute -top-12 left-6 right-6 p-2 bg-pk-red/20 border border-pk-red/50 text-pk-red text-[10px] font-mono flex items-center justify-between rounded-sm backdrop-blur-md"
            >
              <span className="truncate">{error}</span>
              <button 
                onClick={() => sendMessage(messages[messages.length-1]?.content || '')}
                className="underline uppercase tracking-tighter hover:text-white"
              >
                RETRY_STREAM
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scanline Animation Effect */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] overflow-hidden">
        <div className="w-full h-full bg-scan animate-scan"></div>
      </div>
    </div>
  );
}