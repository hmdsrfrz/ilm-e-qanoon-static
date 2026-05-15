// src/components/layout/SidebarDocuments.tsx
import { useEffect } from 'react';
import { useDocuments } from '@/features/documents/useDocuments';
import { useUiStore } from '@/store/uiStore';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

export function SidebarDocuments() {
  const { documents, loading, refetch } = useDocuments();
  const { selectedDocIds, toggleDocId, selectAllDocs } = useUiStore();

  // Part C: Poll every 30s
  useEffect(() => {
    const interval = setInterval(() => { refetch(); }, 30_000);
    return () => clearInterval(interval);
  }, [refetch]);

  // Show at most 5 documents. Only show non-failed docs.
  const visibleDocs = documents.filter((d) => d.status !== 'failed').slice(0, 5);
  const allSelected = selectedDocIds.length === 0;

  return (
    <div className="p-4 space-y-2 hidden lg:block">
      {/* Section header */}
      <div className="flex items-center justify-between mb-2">
        <p className="font-mono text-[10px] uppercase tracking-widest text-pk-muted">
          Documents
        </p>
        <Link
          to={ROUTES.DOCUMENTS}
          className="font-mono text-[10px] text-pk-green hover:underline tracking-wider"
        >
          Manage →
        </Link>
      </div>

      {/* All Documents checkbox */}
      <label className="flex items-center gap-2 cursor-pointer group">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={selectAllDocs}
          className="accent-pk-green h-3 w-3"
        />
        <span className="font-mono text-[11px] text-pk-muted group-hover:text-pk-paper transition-colors">
          All Documents
        </span>
      </label>

      {/* Individual doc checkboxes */}
      {loading && documents.length === 0 ? (
        <p className="font-mono text-[10px] text-pk-muted pl-1 animate-pulse">Loading...</p>
      ) : (
        visibleDocs.map((doc) => {
          const isReady    = doc.status === 'ready';
          const isIndexing = doc.status === 'indexing';
          const isSelected = selectedDocIds.includes(doc.id);
          const dotColor   = isReady ? 'bg-pk-green' : 'bg-yellow-400';
          const dotPulse   = isIndexing ? 'animate-pulse' : '';

          return (
            <label
              key={doc.id}
              className={`flex items-center gap-2 cursor-pointer group ${
                !isReady ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected && !allSelected}
                disabled={!isReady}
                onChange={() => toggleDocId(doc.id)}
                className="accent-pk-green h-3 w-3"
              />
              <span className={`w-[6px] h-[6px] rounded-full flex-none ${dotColor} ${dotPulse}`} />
              <span className="font-mono text-[11px] text-pk-muted group-hover:text-pk-paper truncate max-w-[130px] transition-colors">
                {doc.filename}
              </span>
            </label>
          );
        })
      )}
    </div>
  );
}
