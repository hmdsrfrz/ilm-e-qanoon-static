// src/features/chat/MessageList.tsx
import { memo, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import ThinkingBubble from './ThinkingBubble';
import type { Message } from '@/services/types';

interface MessageListProps {
  messages: Message[];
}

export const MessageList = memo(({ messages }: MessageListProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);  // Only scroll on NEW messages, not re-renders

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 custom-scrollbar">
      {messages.map((msg) => (
        msg.content === '__thinking__' 
          ? <ThinkingBubble key={msg.id} /> 
          : <MessageBubble key={msg.id} message={msg} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
});

MessageList.displayName = 'MessageList';
