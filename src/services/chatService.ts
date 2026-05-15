// src/services/chatService.ts
// Session and message CRUD backed by the FastAPI backend (Redis).
// Falls back to localStorage when the backend is unreachable.

import type { Session, Message } from '@/services/types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
const USER_ID = 'secy_main';

// ── Local Storage Fallback ────────────────────────────────────────────────────
const LS_SESSIONS_KEY = 'secy_sessions_fallback';
const LS_MESSAGES_KEY = 'secy_messages_fallback';

function getLocalSessions(): Session[] {
  try {
    const raw = localStorage.getItem(LS_SESSIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw).map((s: any) => ({
      ...s,
      createdAt: new Date(s.createdAt),
      updatedAt: new Date(s.updatedAt),
    }));
  } catch { return []; }
}

function saveLocalSessions(sessions: Session[]) {
  localStorage.setItem(LS_SESSIONS_KEY, JSON.stringify(sessions));
}

function getLocalMessages(): Record<string, Message[]> {
  try {
    const raw = localStorage.getItem(LS_MESSAGES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const result: Record<string, Message[]> = {};
    for (const [k, v] of Object.entries(parsed)) {
      result[k] = (v as any[]).map(m => ({ ...m, timestamp: new Date(m.timestamp) }));
    }
    return result;
  } catch { return {}; }
}

function saveLocalMessages(msgs: Record<string, Message[]>) {
  localStorage.setItem(LS_MESSAGES_KEY, JSON.stringify(msgs));
}

// ── Row mappers ───────────────────────────────────────────────────────────────

function rowToSession(row: any): Session {
  return {
    id:        row.id,
    title:     row.title,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    messages:  [],
  };
}

function rowToMessage(row: any): Message {
  return {
    id:        row.id,
    role:      row.role,
    content:   row.content,
    timestamp: new Date(row.created_at),
    sources:   row.sources ?? null,
  };
}

// ── Sessions ──────────────────────────────────────────────────────────────────

export async function fetchSessions(): Promise<Session[]> {
  try {
    const res = await fetch(`${API_URL}/sessions?user_id=${USER_ID}`);
    if (!res.ok) throw new Error(await res.text());
    const { sessions } = await res.json();
    const mapped = (sessions ?? []).map(rowToSession);
    saveLocalSessions(mapped);
    return mapped;
  } catch (err) {
    console.warn('[chatService] fetchSessions fallback to localStorage:', err);
    return getLocalSessions().sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }
}

export async function createSession(title = 'New Chat'): Promise<Session> {
  try {
    const res = await fetch(`${API_URL}/sessions`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ user_id: USER_ID, title }),
    });
    if (!res.ok) throw new Error(await res.text());
    const session = rowToSession(await res.json());
    const sessions = getLocalSessions();
    saveLocalSessions([session, ...sessions]);
    return session;
  } catch (err) {
    console.warn('[chatService] createSession fallback to localStorage:', err);
    const session: Session = {
      id:        crypto.randomUUID(),
      title,
      createdAt: new Date(),
      updatedAt: new Date(),
      messages:  [],
    };
    saveLocalSessions([session, ...getLocalSessions()]);
    return session;
  }
}

export async function updateSessionTitle(id: string, title: string): Promise<void> {
  try {
    const res = await fetch(`${API_URL}/sessions/${id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ title, user_id: USER_ID }),
    });
    if (!res.ok) throw new Error(await res.text());
  } catch (err) {
    console.warn('[chatService] updateSessionTitle fallback to localStorage:', err);
  }
  const sessions = getLocalSessions().map(s =>
    s.id === id ? { ...s, title, updatedAt: new Date() } : s
  );
  saveLocalSessions(sessions);
}

export async function deleteSession(id: string): Promise<void> {
  try {
    const res = await fetch(`${API_URL}/sessions/${id}?user_id=${USER_ID}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(await res.text());
  } catch (err) {
    console.warn('[chatService] deleteSession fallback to localStorage:', err);
  }
  saveLocalSessions(getLocalSessions().filter(s => s.id !== id));
  const msgs = getLocalMessages();
  delete msgs[id];
  saveLocalMessages(msgs);
}

// ── Messages ──────────────────────────────────────────────────────────────────

export async function fetchMessages(sessionId: string): Promise<Message[]> {
  try {
    const res = await fetch(`${API_URL}/sessions/${sessionId}/messages`);
    if (!res.ok) throw new Error(await res.text());
    const { messages } = await res.json();
    return (messages ?? []).map(rowToMessage);
  } catch (err) {
    console.warn('[chatService] fetchMessages fallback to localStorage:', err);
    return (getLocalMessages()[sessionId] ?? []).sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );
  }
}

// insertMessage is a local no-op — the backend persists both user and assistant
// messages atomically inside chat_engine.py when /chat is called.
export async function insertMessage(
  _sessionId: string,
  msg: Omit<Message, 'id' | 'timestamp'>
): Promise<Message> {
  return {
    ...msg,
    id:        crypto.randomUUID(),
    timestamp: new Date(),
  };
}

export async function deleteMessage(_id: string): Promise<void> {
  // No per-message delete endpoint on the backend.
  // Clearing a session resets it locally; individual message deletion is not supported.
}
