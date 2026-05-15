import { useState, useEffect, useRef } from 'react';

const LIGHTRAG_URL = import.meta.env.VITE_LIGHTRAG_URL;

interface Progress {
  status:      'indexing' | 'ready' | 'failed' | 'not_found';
  chunks_done: number;
  total:       number;
}

export function useDocumentProgress(
  docId:      string | null,
  onComplete: (status: 'ready' | 'failed', chunksDone: number) => void
) {
  const [progress, setProgress]   = useState<Progress | null>(null);
  const onCompleteRef             = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!docId) return;

    const es = new EventSource(`${LIGHTRAG_URL}/progress/${docId}`);

    es.onmessage = (e) => {
      const data = JSON.parse(e.data) as Progress;
      setProgress(data);
      if (data.status === 'ready' || data.status === 'failed') {
        onCompleteRef.current(data.status, data.chunks_done);
        es.close();
      }
    };

    es.onerror = () => es.close();

    return () => es.close();
  }, [docId]); // onComplete removed — use ref instead

  return progress;
}