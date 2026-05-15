import { useState, useEffect, useCallback } from 'react';
import { fetchStaticJson } from '@/services/staticApi';

export interface UploadedDocument {
  id:          string;
  filename:    string;
  file_url:    string;
  file_type:   string;
  file_size:   number;
  category:    string;
  bucket_id:   string;
  status:      'indexing' | 'ready' | 'failed';
  chunks_done: number;
  total?:      number;
  uploaded_at: string;
  user_id:     string;
}

export function useDocuments() {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const fetchDocuments = useCallback(async (_signal?: AbortSignal) => {
    try {
      const raw = await fetchStaticJson<Record<string, unknown>[]>('documents.json');
      const mapped: UploadedDocument[] = raw.map((d) => ({
        id:          d.id as string,
        filename:    d.filename as string,
        file_url:    '',
        file_type:   d.file_type as string,
        file_size:   d.file_size as number,
        category:    d.category as string,
        bucket_id:   d.bucket_id as string,
        status:      'ready' as const,
        chunks_done: 0,
        uploaded_at: d.uploaded_at as string,
        user_id:     d.user_id as string,
      }));
      setDocuments(mapped);
    } catch {
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const uploadDocument = async (_file: File, _bucket_id: string): Promise<string> => {
    throw new Error('Document upload is disabled in read-only demo mode.');
  };

  const deleteDocument = async (_docId: string, _filename: string): Promise<void> => {
    throw new Error('Document deletion is disabled in read-only demo mode.');
  };

  const updateDocStatus = (_docId: string, _status: 'ready' | 'failed', _chunksDone: number) => {};

  return { documents, loading, error, uploadDocument, deleteDocument, updateDocStatus, refetch: fetchDocuments };
}
