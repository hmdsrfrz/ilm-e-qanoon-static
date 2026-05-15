// src/lib/parseWebhookResponse.ts

/**
 * Normalises n8n response shapes.
 * n8n returns varying shapes — normalise all of them to a single string.
 */
export function parseWebhookResponse(raw: unknown): string {
  if (typeof raw === 'string') return raw;
  
  if (typeof raw === 'object' && raw !== null) {
    const r = raw as Record<string, unknown>;
    return (
      (typeof r.output === 'string' ? r.output : null) ??
      (typeof r.text === 'string' ? r.text : null) ??
      (typeof r.message === 'string' ? r.message : null) ??
      (typeof r.response === 'string' ? r.response : null) ??
      (typeof r.reply === 'string' ? r.reply : null) ??
      (Array.isArray(r) && typeof r[0]?.output === 'string' ? r[0].output : null) ??
      JSON.stringify(raw, null, 2)
    );
  }
  
  return String(raw);
}

/**
 * Extracts sources field from n8n response.
 * Returns null if no sources found or string is empty.
 */
export function parseWebhookSources(raw: unknown): string | null {
  if (typeof raw === 'object' && raw !== null) {
    const r = raw as Record<string, unknown>;
    if (typeof r.sources === 'string' && r.sources.trim()) {
      return r.sources;
    }
  }
  return null;
}
