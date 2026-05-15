// src/features/sessions/SessionList.tsx
import { useState, useMemo } from 'react';
import { History, Search, Cpu } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { useDebounce } from '@/hooks/useDebounce';
import { SessionItem } from './SessionItem';

interface SessionListProps {
  onItemClick?: () => void;
}

export function SessionList({ onItemClick }: SessionListProps) {
  const { sessions } = useChatStore();
  const [searchTerm, setSearchTerm] = useState('');

  // Debounce so message-content scanning doesn't run on every keystroke
  const debouncedTerm = useDebounce(searchTerm, 250);

  const filteredSessions = useMemo(() => {
    const term = debouncedTerm.toLowerCase();
    if (!term) return sessions;
    return sessions.filter(s =>
      s.title.toLowerCase().includes(term) ||
      s.messages.some(m => m.content.toLowerCase().includes(term))
    );
  }, [sessions, debouncedTerm]);

  return (
    <div className="flex flex-col h-full bg-pk-black/5 flex-1">
      {/* List Header */}
      <div className="flex items-center justify-between px-2 py-4 text-pk-muted">
        <div className="flex items-center gap-2">
          <History size={14} className="opacity-60" />
          <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-pk-paper/60">
            Stream History
          </span>
        </div>
        <div className="flex items-center gap-1 opacity-40">
          <Cpu size={12} />
          <span className="text-[9px] font-mono">{sessions.length} / 20</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-2 mb-4 relative">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-pk-muted opacity-40" size={14} />
        <input 
          type="text" 
          placeholder="SEARCH CONTEXT..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-pk-black/40 border border-pk-border/20 rounded-sm py-2 pl-9 pr-3 text-[10px] font-mono text-pk-paper placeholder:text-pk-muted/40 focus:outline-none focus:border-pk-green/40 transition-colors"
        />
      </div>

      {/* Actual List */}
      <div className="flex-1 overflow-y-auto px-2 pb-6 space-y-2 scrollbar-thin scrollbar-thumb-pk-border/20">
        {filteredSessions.length > 0 ? (
          filteredSessions.map((session) => (
            <SessionItem 
              key={session.id} 
              session={session} 
              onClick={onItemClick} 
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-8 opacity-20 text-center">
            <div className="border border-pk-muted p-4 rounded-full mb-4">
              <History size={24} />
            </div>
            <p className="font-mono text-[10px] uppercase tracking-widest leading-relaxed">
              {searchTerm ? 'No Context Matches' : 'No Active Neural Streams'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
