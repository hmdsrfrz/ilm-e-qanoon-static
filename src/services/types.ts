// src/services/types.ts

export type MessageRole = 'user' | 'assistant' | 'error' | 'system';

export interface Message {
  id:          string;
  role:        MessageRole;
  content:     string;
  timestamp:   Date;
  sources?:    string | null;
  metadata?:   Record<string, unknown>;
  isStreaming?: boolean;
}

export interface Session {
  id:        string;
  title:     string;
  createdAt: Date;
  updatedAt: Date;
  messages:  Message[];
}
