// src/features/chat/useChat.ts
import { useState, useCallback, useRef, useMemo } from 'react';
import { useChatStore } from '@/store/chatStore';
import { sendChatMessage } from '@/services/chatApi';
import { nanoid } from 'nanoid';

export function useChat(sessionId: string | null, bucket = 'auto') {
  const {
    sessions,
    addMessage,
    pushLocalMessage,
    removeLocalMessage,
    updateSessionTitle,
    getMessages,
  } = useChatStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const titleUpdated              = useRef(false);
  const abortRef                  = useRef<AbortController | null>(null);

  const activeSession = sessions.find((s) => s.id === sessionId);
  const messages      = useMemo(() => activeSession?.messages || [], [activeSession]);

  const sendMessage = useCallback(async (content: string) => {
    if (!sessionId || !content.trim()) return;

    setError(null);
    setIsLoading(true);

    // Allow the previous request to be cancelled
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      // Step 1: Add user message locally (backend also persists it via /chat)
      await addMessage(sessionId, {
        role:    'user',
        content,
      });

      // Step 2: Show thinking placeholder — local only
      const thinkingId = `thinking_${nanoid()}`;
      pushLocalMessage(sessionId, {
        id:        thinkingId,
        role:      'system',
        content:   '__thinking__',
        timestamp: new Date(),
      });

      // Step 3: Call backend /chat
      const response = await sendChatMessage({
        message:    content,
        session_id: sessionId,
        bucket_id:  bucket,
        signal:     controller.signal,
      });

      // Step 4: Remove thinking bubble
      removeLocalMessage(sessionId, thinkingId);

      // Step 5: Add assistant response locally (backend already persisted it)
      await addMessage(sessionId, {
        role:     'assistant',
        content:  response.output,
        sources:  response.sources,
        metadata: {
          model:       'langchain-groq-llama3.3-70b',
          bucket_id:   response.bucket_id,
          source_docs: response.source_docs,
        },
      });

      // Step 6: Auto-title on first user message
      if (!titleUpdated.current) {
        const allMsgs  = getMessages(sessionId);
        const userMsgs = allMsgs.filter((m) => m.role === 'user');
        if (userMsgs.length === 1) {
          titleUpdated.current = true;
          const title = content.slice(0, 40) + (content.length > 40 ? '…' : '');
          await updateSessionTitle(sessionId, title);
        }
      }
    } catch (err: unknown) {
      console.error('Chat error:', err);

      // Remove thinking bubble if still present
      const currentMessages = getMessages(sessionId);
      const thinkingMsg = currentMessages.find((m) => m.content === '__thinking__');
      if (thinkingMsg) removeLocalMessage(sessionId, thinkingMsg.id);

      if (err instanceof Error && err.name === 'AbortError') return;

      const errorMessage =
        err instanceof Error
          ? err.message.includes('Failed to fetch') || err.message.includes('NetworkError')
            ? 'Network error — check that the backend is running.'
            : err.message
          : 'An unexpected error occurred.';

      setError(errorMessage);

      await addMessage(sessionId, {
        role:    'error',
        content: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, bucket, addMessage, pushLocalMessage, removeLocalMessage, updateSessionTitle, getMessages]);

  const retryLast = useCallback(() => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) sendMessage(lastUserMsg.content);
  }, [messages, sendMessage]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    retryLast,
  };
}
