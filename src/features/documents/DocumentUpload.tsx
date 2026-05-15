import React, { useState, useCallback } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, File, Loader2, Check, Database } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';

interface DocumentUploadProps {
  onUpload: (file: File, bucketId: string) => Promise<string>;
}

export const BUCKETS = [
  {
    id:          'constitution',
    label:       'Constitution',
    description: 'Pakistan Constitution 1973 + amendments',
  },
  {
    id:          'procedural_law',
    label:       'Procedural Law',
    description: 'CPC, CrPC, Evidence Act',
  },
  {
    id:          'family_law',
    label:       'Family Law',
    description: 'Muslim Family Laws, Guardianship, Marriage',
  },
  {
    id:          'federal_admin',
    label:       'Federal Admin',
    description: 'Estacode, Rules of Business',
  },
  {
    id:          'local_govt',
    label:       'Local Govt',
    description: 'Punjab, Sindh, KPK, Balochistan LGAs',
  },
  {
    id:          'penal_law',
    label:       'Penal Law',
    description: 'PPC, Anti-Terrorism Act, NAB Ordinance',
  },
];

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUpload }) => {
  const [file, setFile]           = useState<File | null>(null);
  const [bucketId, setBucketId]   = useState(BUCKETS[0].id);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    if (fileRejections.length > 0) {
      const rejection = fileRejections[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        toast.error('File too large. Maximum is 50MB.');
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        toast.error('Unsupported file type. Use PDF, DOCX, TXT, or MD.');
      } else {
        toast.error(rejection.errors[0]?.message || 'Invalid file');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const f = acceptedFiles[0];
      const ALLOWED = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/markdown'];
      if (!ALLOWED.includes(f.type)) {
        toast.error('Unsupported file type. Use PDF, DOCX, TXT, or MD.');
        return;
      }
      if (f.size > 50 * 1024 * 1024) {
        toast.error('File too large. Maximum is 50MB.');
        return;
      }
      setFile(f);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain':    ['.txt'],
      'text/markdown': ['.md'],
    },
    maxSize:  50 * 1024 * 1024,
    multiple: false,
  });

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    const loadingToast = toast.loading('Uploading document...');
    try {
      await onUpload(file, bucketId);
      toast.success('Uploaded — indexing in background', { id: loadingToast });
      setFile(null);
      setBucketId(BUCKETS[0].id);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      if (message.includes('Already uploaded')) {
        toast.error('This document is already uploaded', { id: loadingToast });
      } else if (message.includes('Already being indexed')) {
        toast('Currently being indexed', { id: loadingToast, icon: '🔄' });
      } else {
        toast.error(message, { id: loadingToast });
      }
    } finally {
      setIsUploading(false);
    }
  };

  const selectedBucket = BUCKETS.find(b => b.id === bucketId)!;

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="w-full"
          >
            <div
              {...getRootProps()}
              className={cn(
                "relative border-2 border-dashed rounded-xl p-12 transition-all duration-300 cursor-pointer text-center",
                isDragActive
                  ? "border-pk-green bg-pk-green-glow/10 shadow-[0_0_20px_rgba(0,255,136,0.1)]"
                  : "border-pk-border bg-pk-black/40 hover:border-pk-green/50"
              )}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-4">
                <div className={cn(
                  "p-4 rounded-full bg-pk-black border border-pk-border transition-colors duration-300",
                  isDragActive ? "text-pk-green border-pk-green" : "text-pk-muted"
                )}>
                  <Upload size={32} />
                </div>
                <div>
                  <p className="text-pk-paper font-ui text-lg mb-1">Drop your document here</p>
                  <p className="text-pk-muted font-mono text-xs uppercase tracking-widest">
                    PDF, DOCX, TXT, MD · MAX 50MB · CLICK TO BROWSE
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="file-ready"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-pk-green bg-pk-green-glow/5 rounded-xl p-6 space-y-6"
          >
            {/* File info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-pk-green/20 text-pk-green">
                  <File size={24} />
                </div>
                <div>
                  <h4 className="font-ui font-bold text-pk-paper">{file.name}</h4>
                  <p className="text-pk-muted font-mono text-xs">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFile(null)}
                className="p-2 text-pk-muted hover:text-pk-red transition-colors"
                disabled={isUploading}
              >
                <X size={20} />
              </button>
            </div>

            {/* Bucket selector */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Database size={12} className="text-pk-green" />
                <label className="text-[10px] font-mono text-pk-muted uppercase tracking-widest">
                  Knowledge Base
                </label>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {BUCKETS.map((bucket) => (
                  <button
                    key={bucket.id}
                    onClick={() => setBucketId(bucket.id)}
                    disabled={isUploading}
                    title={bucket.description}
                    className={cn(
                      "px-3 py-2.5 rounded border font-mono text-left transition-all",
                      bucketId === bucket.id
                        ? "bg-pk-green text-pk-black border-pk-green"
                        : "bg-pk-black text-pk-muted border-pk-border hover:border-pk-green/50 hover:text-pk-paper"
                    )}
                  >
                    <p className="text-[10px] uppercase tracking-wider font-semibold">
                      {bucket.label}
                    </p>
                    <p className={cn(
                      "text-[9px] mt-0.5 leading-tight",
                      bucketId === bucket.id ? "text-pk-black/70" : "text-pk-muted/60"
                    )}>
                      {bucket.description}
                    </p>
                  </button>
                ))}
              </div>
              <p className="mt-2 font-mono text-[9px] text-pk-muted">
                Selected: <span className="text-pk-green">{selectedBucket.label}</span>
                {' '}— {selectedBucket.description}
              </p>
            </div>

            {/* Confirm button */}
            <div className="flex justify-end">
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="min-w-[140px] h-[38px]"
                variant="primary"
              >
                {isUploading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <Check size={16} className="mr-2" />
                    Confirm Upload
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
