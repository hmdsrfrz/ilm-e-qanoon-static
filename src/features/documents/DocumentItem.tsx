import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  RefreshCw 
} from 'lucide-react';
import type { UploadedDocument } from './useDocuments';
import { useDocumentProgress } from './useDocumentProgress';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/formatDate';

interface DocumentItemProps {
  doc: UploadedDocument;
  onDelete: (id: string, filename: string) => void;
  onStatusChange: (id: string, status: 'ready' | 'failed', chunksDone: number) => void;
}

const getFileIconColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'pdf': return 'text-pk-red';
    case 'docx': return 'text-blue-600';
    case 'txt': return 'text-pk-muted';
    case 'md': return 'text-pk-green';
    default: return 'text-pk-muted';
  }
};

export const DocumentItem: React.FC<DocumentItemProps> = ({ 
  doc, 
  onDelete, 
  onStatusChange 
}) => {
  const progress = useDocumentProgress(
    doc.status === 'indexing' ? doc.id : null,
    (status, chunksDone) => onStatusChange(doc.id, status, chunksDone)
  );

  const displayChunks = progress?.chunks_done ?? doc.chunks_done;
  const displayStatus = progress?.status ?? doc.status;

  const fileSizeMB = (doc.file_size / (1024 * 1024)).toFixed(1);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative border border-pk-border bg-pk-black p-6 hover:border-pk-green/40 transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-start gap-4 flex-1">
          <div className={cn("mt-1", getFileIconColor(doc.file_type))}>
            <FileText size={24} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h3 className="font-mono font-bold text-pk-paper truncate max-w-[350px]">
                {doc.filename}
              </h3>
              <span className="px-2 py-0.5 border border-pk-border text-[9px] font-mono uppercase text-pk-muted tracking-widest">
                {doc.category}
              </span>
              <span className="text-[9px] font-mono text-pk-muted uppercase">
                {fileSizeMB} MB
              </span>
            </div>

            <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest">
              {displayStatus === 'indexing' && (
                <div className="flex items-center gap-2 text-[#B8860B] animate-pulse">
                  <Clock size={12} />
                  <span>Indexing Corpus</span>
                  <span className="text-pk-border">•</span>
                  <span>{displayChunks} Chunks Done</span>
                </div>
              )}
              {displayStatus === 'ready' && (
                <div className="flex items-center gap-2 text-pk-green">
                  <CheckCircle2 size={12} />
                  <span>Archive Ready</span>
                  <span className="text-pk-border">•</span>
                  <span>{displayChunks} Chunks Indexed</span>
                </div>
              )}
              {displayStatus === 'failed' && (
                <div className="flex items-center gap-2 text-pk-red">
                  <AlertCircle size={12} />
                  <span>Index Failed</span>
                </div>
              )}
              <span className="text-pk-muted ml-auto lowercase tracking-normal">
                {formatDate(new Date(doc.uploaded_at))}
              </span>
            </div>

            {displayStatus === 'indexing' && (
              <div className="mt-4 w-full bg-pk-border/20 h-[1px] overflow-hidden">
                <motion.div 
                  className="h-full bg-[#B8860B]"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(displayChunks, 100)}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {displayStatus === 'ready' && (
            <a 
              href={doc.file_url} 
              target="_blank" 
              rel="noopener noreferrer"
              download
              className="p-2 border border-pk-border text-pk-muted hover:border-pk-green hover:text-pk-green transition-all"
              title="Download Source"
            >
              <Download size={14} />
            </a>
          )}
          {displayStatus === 'failed' && (
            <button 
              onClick={() => window.location.reload()}
              className="p-2 border border-pk-border text-pk-muted hover:border-[#B8860B] hover:text-[#B8860B] transition-all"
              title="Retry Index"
            >
              <RefreshCw size={14} />
            </button>
          )}
          <button 
            onClick={() => {
              if (window.confirm(`Are you sure you want to purge ${doc.filename}?`)) {
                onDelete(doc.id, doc.filename);
              }
            }}
            className="p-2 border border-pk-border text-pk-muted hover:border-pk-red hover:text-pk-red transition-all"
            title="Purge Document"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
