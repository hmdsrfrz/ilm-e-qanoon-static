// src/features/sessions/SessionItem.tsx
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/formatDate';
import type { Session } from '@/services/types';
import { useChatStore } from '@/store/chatStore';
import { X } from 'lucide-react';

interface SessionItemProps {
  session: Session;
  onClick?: () => void;
}

export function SessionItem({ session, onClick }: SessionItemProps) {
  const { deleteSession } = useChatStore();

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('TERMINATE THIS QUERY? Session data will be purged.')) {
      deleteSession(session.id);
    }
  };

  return (
    <NavLink
      to={`/chat/${session.id}`}
      onClick={onClick}
      className={({ isActive }) => cn(
        "group relative flex flex-col px-4 py-3 cursor-pointer border-b border-pk-border/50 font-mono text-[11px] transition-all duration-100",
        isActive 
          ? "border-l-2 border-l-pk-green text-pk-paper bg-pk-green/10" 
          : "border-l-2 border-l-transparent text-pk-paper/60 hover:text-pk-paper hover:bg-pk-green/5"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="truncate flex-1">{session.title || 'NULL QUERY'}</p>
        <button 
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-60 hover:opacity-100 transition-opacity p-0.5 hover:text-pk-red"
        >
          <X size={10} />
        </button>
      </div>
      
      <p className="text-pk-muted text-[9px] mt-0.5 tracking-widest uppercase">
        {formatDate(session.updatedAt)}
      </p>
    </NavLink>
  );
}
