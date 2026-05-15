// src/features/documents/DocumentsPage.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDocuments } from './useDocuments';
import { DocumentUpload } from './DocumentUpload';
import { DocumentList } from './DocumentList';

const DocumentsPage: React.FC = () => {
  const { 
    documents, 
    loading, 
    uploadDocument, 
    deleteDocument, 
    updateDocStatus 
  } = useDocuments();
  
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div className="h-full flex flex-col bg-pk-black">
      {/* Header Area */}
      <div className="px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="font-mono text-[10px] text-pk-green uppercase tracking-[0.4em] mb-1">
              // Document Corpus
            </p>
            <h1 className="font-display text-pk-paper leading-none" style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}>
              INDEXED DOCUMENTS
            </h1>
          </div>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="font-mono text-[11px] uppercase tracking-[0.2em] border border-pk-border text-pk-muted px-6 py-3 hover:border-pk-green hover:text-pk-green transition-all"
          >
            {showUpload ? '← Cancel' : '+ Upload Document'}
          </button>
        </div>
      </div>

      {/* Main Content Scroll Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto px-8 pb-12">
          <AnimatePresence>
            {showUpload && (
              <motion.div
                initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                animate={{ height: 'auto', opacity: 1, marginBottom: 40 }}
                exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden border border-pk-border p-6 bg-pk-green/5"
              >
                <DocumentUpload onUpload={uploadDocument} />
              </motion.div>
            )}
          </AnimatePresence>

          <DocumentList 
            documents={documents}
            loading={loading}
            onDelete={deleteDocument}
            onStatusChange={updateDocStatus}
          />
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;
