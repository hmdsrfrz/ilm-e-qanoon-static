// Static data utilities — all data served from /static-data/
const BASE = '/static-data';

export async function fetchStaticJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}/${path}`);
  if (!res.ok) throw new Error(`Static data not found: ${path} (${res.status})`);
  return res.json() as Promise<T>;
}

const STOP = new Set([
  'a','an','the','is','are','was','were','be','been','being',
  'have','has','had','do','does','did','will','would','could',
  'should','may','might','shall','can','of','in','to','for',
  'on','at','by','from','with','about','and','or','but','not',
  'what','how','when','where','who','which','why','that','this',
  'it','its','he','she','they','we','you','i','me','him','her',
  'them','us','my','your','his','our','their',
]);

function tokenize(text: string): string[] {
  return text.toLowerCase().split(/[\s\W]+/).filter(w => w.length > 2 && !STOP.has(w));
}

export function scoreSimilarity(query: string, candidate: string): number {
  const qTokens = tokenize(query);
  const cTokens = new Set(tokenize(candidate));
  if (qTokens.length === 0 || cTokens.size === 0) return 0;
  let hits = 0;
  for (const w of qTokens) if (cTokens.has(w)) hits++;
  const overlap = hits / Math.max(qTokens.length, cTokens.size);
  const phraseBonus = candidate.toLowerCase().includes(query.toLowerCase().slice(0, 30)) ? 0.3 : 0;
  return Math.min(1, overlap + phraseBonus);
}

export interface CachedQuery {
  id:          string;
  bucket_id:   string;
  query:       string;
  response:    string;
  sources:     string | null;
  source_docs: Array<{ id: string; filename: string }>;
}

let _cachePromise: Promise<CachedQuery[]> | null = null;

export function loadCachedQueries(): Promise<CachedQuery[]> {
  if (!_cachePromise) {
    _cachePromise = fetchStaticJson<CachedQuery[]>('cached-queries.json');
  }
  return _cachePromise;
}
