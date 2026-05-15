// src/services/chatApi.ts — static build, no backend
import { loadCachedQueries, scoreSimilarity } from './staticApi';

export interface SourceDoc {
  id:       string;
  filename: string;
}

export interface ChatResponse {
  output:       string;
  sources:      string | null;
  session_id:   string;
  bucket_id?:   string;
  source_docs?: SourceDoc[];
}

export async function sendChatMessage(params: {
  message:    string;
  session_id: string;
  user_id?:   string;
  bucket_id?: string;
  signal?:    AbortSignal;
}): Promise<ChatResponse> {
  const { message, session_id, bucket_id = 'constitution' } = params;

  const cache = await loadCachedQueries();
  const pool  = bucket_id === 'auto' ? cache : cache.filter(q => q.bucket_id === bucket_id);

  const scored = pool
    .map(q => ({ entry: q, score: scoreSimilarity(message, q.query) }))
    .sort((a, b) => b.score - a.score);

  const best = scored[0];

  // Simulate network latency so the thinking bubble shows
  await new Promise<void>(r => setTimeout(r, 700 + Math.random() * 600));
  if (params.signal?.aborted) throw new DOMException('Aborted', 'AbortError');

  if (best && best.score >= 0.18) {
    return {
      output:      best.entry.response,
      sources:     best.entry.sources,
      session_id,
      bucket_id:   best.entry.bucket_id,
      source_docs: best.entry.source_docs,
    };
  }

  const suggestions = scored.slice(0, 4).map(({ entry }) => `- *${entry.query}*`).join('\n');
  const bucketLabel  = bucket_id === 'auto' ? 'any domain' : bucket_id.replace(/_/g, ' ');

  return {
    output:      `**No cached response for this query.**\n\nThis is a read-only demo with pre-computed answers. Your question about **"${message.slice(0, 80)}"** did not match any stored answer in **${bucketLabel}**.\n\n**Try one of these:**\n${suggestions}\n\n*Switch the domain selector to explore other legal areas.*`,
    sources:     null,
    session_id,
    bucket_id:   bucket_id === 'auto' ? 'constitution' : bucket_id,
    source_docs: [],
  };
}
