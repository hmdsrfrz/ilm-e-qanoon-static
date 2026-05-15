// src/store/chatStore.ts
import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { Session, Message } from '@/services/types';
import * as chatService from '@/services/chatService';

interface ChatState {
  sessions:           Session[];
  activeSessionId:    string | null;
  loadingSessionId:   string | null;   // which session's messages are being fetched
  isLoadingSessions:  boolean;

  // Session actions
  loadSessions:       () => Promise<void>;
  createSession:      (title?: string) => Promise<string>;            // returns new session id
  selectSession:      (id: string) => Promise<void>;    // loads messages
  deleteSession:      (id: string) => Promise<void>;
  updateSessionTitle: (id: string, title: string) => Promise<void>;

  // Message actions (optimistic — add locally, then persist)
  addMessage:         (sessionId: string, msg: Omit<Message, 'id' | 'timestamp'>) => Promise<Message>;
  getMessages:        (sessionId: string) => Message[];
  replaceMessage:     (sessionId: string, tempId: string, msg: Message) => void;
  clearSession:       (sessionId: string) => Promise<void>;
  
  // Local-only actions (e.g. for thinking bubble)
  pushLocalMessage:   (sessionId: string, msg: Message) => void;
  removeLocalMessage: (sessionId: string, id: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  sessions:          [],
  activeSessionId:   null,
  loadingSessionId:  null,
  isLoadingSessions: false,

  loadSessions: async () => {
    set({ isLoadingSessions: true });
    try {
      const sessions = await chatService.fetchSessions();
      set({ sessions, isLoadingSessions: false });
    } catch (err) {
      console.error('[chatStore] loadSessions failed:', err);
      set({ isLoadingSessions: false });
    }
  },

  createSession: async (title = 'New Chat') => {
    const session = await chatService.createSession(title);
    set((s) => ({ sessions: [session, ...s.sessions], activeSessionId: session.id }));
    return session.id;
  },

  selectSession: async (id) => {
    const existing = get().sessions.find((s) => s.id === id);
    if (!existing) return;

    // If messages already loaded, just switch
    if (existing.messages.length > 0) {
      set({ activeSessionId: id });
      return;
    }

    set({ activeSessionId: id, loadingSessionId: id });
    try {
      const messages = await chatService.fetchMessages(id);
      set((s) => ({
        sessions: s.sessions.map((sess) =>
          sess.id === id ? { ...sess, messages } : sess
        ),
        loadingSessionId: null,
      }));
    } catch (err) {
      console.error('[chatStore] fetchMessages failed:', err);
      set({ loadingSessionId: null });
    }
  },

  deleteSession: async (id) => {
    await chatService.deleteSession(id);
    set((s) => {
      const sessions = s.sessions.filter((sess) => sess.id !== id);
      const activeSessionId =
        s.activeSessionId === id ? (sessions[0]?.id ?? null) : s.activeSessionId;
      return { sessions, activeSessionId };
    });
  },

  updateSessionTitle: async (id, title) => {
    await chatService.updateSessionTitle(id, title);
    set((s) => ({
      sessions: s.sessions.map((sess) =>
        sess.id === id ? { ...sess, title } : sess
      ),
    }));
  },

  addMessage: async (sessionId, msgData) => {
    // 1. Optimistic local insert with a temp ID
    const tempId = `temp_${nanoid()}`;
    const tempMsg: Message = {
      ...msgData,
      id: tempId,
      timestamp: new Date(),
    };

    set((s) => ({
      sessions: s.sessions.map((sess) =>
        sess.id === sessionId
          ? { ...sess, messages: [...sess.messages, tempMsg] }
          : sess
      ),
    }));

    // 2. Persist to Supabase (skip for thinking placeholders — role='system' + content='__thinking__')
    if (msgData.content === '__thinking__') return tempMsg;

    try {
      const persistedMsg = await chatService.insertMessage(sessionId, msgData);

      // 3. Replace temp ID with real Supabase UUID
      set((s) => ({
        sessions: s.sessions.map((sess) =>
          sess.id === sessionId
            ? {
                ...sess,
                messages: sess.messages.map((m) =>
                  m.id === tempId ? persistedMsg : m
                ),
              }
            : sess
        ),
      }));

      return persistedMsg;
    } catch (err) {
      console.error('[chatStore] addMessage persist failed:', err);
      // Keep optimistic message even on failure — user still sees the chat
      return tempMsg;
    }
  },

  getMessages: (sessionId) => {
    return get().sessions.find((s) => s.id === sessionId)?.messages ?? [];
  },

  replaceMessage: (sessionId, tempId, newMsg) => {
    set((s) => ({
      sessions: s.sessions.map((sess) =>
        sess.id === sessionId
          ? {
              ...sess,
              messages: sess.messages.map((m) => (m.id === tempId ? newMsg : m)),
            }
          : sess
      ),
    }));
  },

  clearSession: async (sessionId) => {
    set((s) => ({
      sessions: s.sessions.map((sess) =>
        sess.id === sessionId ? { ...sess, messages: [] } : sess
      ),
    }));
  },

  pushLocalMessage: (sessionId, msg) =>
    set((s) => ({
      sessions: s.sessions.map((sess) =>
        sess.id === sessionId
          ? { ...sess, messages: [...sess.messages, msg] }
          : sess
      ),
    })),

  removeLocalMessage: (sessionId, id) =>
    set((s) => ({
      sessions: s.sessions.map((sess) =>
        sess.id === sessionId
          ? { ...sess, messages: sess.messages.filter((m) => m.id !== id) }
          : sess
      ),
    })),
}));
