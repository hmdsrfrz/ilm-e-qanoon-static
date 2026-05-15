import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileSearch, Filter } from 'lucide-react';
import type { UploadedDocument } from './useDocuments';
import { DocumentItem } from './DocumentItem';
import { cn } from '@/lib/cn';

interface DocumentListProps {
  documents: UploadedDocument[];
  loading: boolean;
  onDelete: (id: string, filename: string) => void;
  onStatusChange: (id: string, status: 'ready' | 'failed', chunksDone: number) => void;
}

const CATEGORIES = ['All', 'General', 'Constitution', 'Research', 'Personal'];
const STATUSES = ['All', 'Ready', 'Indexing', 'Failed'];

export const DocumentList: React.FC<DocumentListProps> = ({ 
  documents, 
  loading, 
  onDelete, 
  onStatusChange 
}) => {
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredDocs = documents.filter(doc => {
    const categoryMatch = filterCategory === 'All' || doc.category === filterCategory.toLowerCase();
    const statusMatch = filterStatus === 'All' || doc.status === filterStatus.toLowerCase();
    return categoryMatch && statusMatch;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-pk-black/20 border border-pk-border rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-pk-border rounded-xl bg-pk-black/20">
        <div className="p-4 rounded-full bg-pk-black border border-pk-border text-pk-muted mb-4">
          <FileSearch size={32} />
        </div>
        <h3 className="text-pk-paper font-ui text-lg mb-2">No documents uploaded yet</h3>
        <p className="text-pk-muted font-mono text-xs uppercase tracking-widest max-w-xs">
          Upload your first document to enable document-aware responses
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between border-b border-pk-border pb-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-pk-muted uppercase tracking-[0.2em]">
            {filteredDocs.length} Documents
          </span>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-pk-muted" />
            <div className="flex bg-pk-black border border-pk-border rounded p-0.5">
              {STATUSES.map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={cn(
                    "px-2 py-1 rounded text-[10px] font-mono uppercase transition-all",
                    filterStatus === status 
                      ? "bg-pk-black text-pk-green" 
                      : "text-pk-muted hover:text-pk-paper"
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-pk-black border border-pk-border rounded p-0.5">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={cn(
                    "px-2 py-1 rounded text-[10px] font-mono uppercase transition-all",
                    filterCategory === cat 
                      ? "bg-pk-black text-pk-green" 
                      : "text-pk-muted hover:text-pk-paper"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredDocs.length > 0 ? (
            filteredDocs.map(doc => (
              <DocumentItem 
                key={doc.id} 
                doc={doc} 
                onDelete={onDelete} 
                onStatusChange={onStatusChange}
              />
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-10 text-pk-muted font-mono text-xs uppercase tracking-widest"
            >
              No documents match the selected filters
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
