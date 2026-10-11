import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadDocument } from '@/services/api';
import { CATEGORIES, DEPARTMENTS, SEMESTERS } from '@/lib/constants';
import { formatBytes, cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/common/Toast';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
  category: string;
  department: string;
  semester?: number;
  error?: string;
}

interface DropZoneProps {
  onUploaded: () => void;
}

export function DropZone({ onUploaded }: DropZoneProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [globalCategory, setGlobalCategory] = useState('General');
  const [globalDepartment, setGlobalDepartment] = useState('All Departments');
  const { toast } = useToast();

  const onDrop = useCallback((accepted: File[]) => {
    const newFiles: UploadFile[] = accepted.map((f) => ({
      id: Math.random().toString(36).slice(2),
      file: f,
      progress: 0,
      status: 'pending',
      category: globalCategory,
      department: globalDepartment,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, [globalCategory, globalDepartment]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'text/plain': ['.txt'] },
    maxSize: 50 * 1024 * 1024,
  });

  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const handleUploadAll = async () => {
    const pending = files.filter((f) => f.status === 'pending');
    if (!pending.length) return;

    for (const uf of pending) {
      setFiles((prev) => prev.map((f) => f.id === uf.id ? { ...f, status: 'uploading' } : f));
      try {
        await uploadDocument(
          uf.file,
          { category: uf.category, department: uf.department, semester: uf.semester },
          (pct) => setFiles((prev) => prev.map((f) => f.id === uf.id ? { ...f, progress: pct } : f)),
        );
        setFiles((prev) => prev.map((f) => f.id === uf.id ? { ...f, status: 'done', progress: 100 } : f));
      } catch {
        setFiles((prev) => prev.map((f) => f.id === uf.id ? { ...f, status: 'error', error: 'Upload failed' } : f));
      }
    }

    const hasSuccess = files.some((f) => f.status === 'done' || pending.some((p) => p.id === f.id));
    if (hasSuccess) {
      toast('Documents uploaded successfully!', 'success');
      onUploaded();
    }
  };

  return (
    <div className="space-y-4">
      {/* Global meta */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">Default Category</label>
          <select
            value={globalCategory}
            onChange={(e) => setGlobalCategory(e.target.value)}
            className="w-full h-9 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">Default Department</label>
          <select
            value={globalDepartment}
            onChange={(e) => setGlobalDepartment(e.target.value)}
            className="w-full h-9 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center cursor-pointer transition-all duration-200',
          isDragActive
            ? 'border-neutral-900 bg-neutral-100 dark:border-neutral-100 dark:bg-neutral-800'
            : 'border-[var(--border-color)] hover:border-neutral-400 dark:hover:border-neutral-600 hover:bg-[var(--bg-muted)]',
        )}
        aria-label="File upload dropzone"
      >
        <input {...getInputProps()} aria-label="File input" />
        <div className={cn(
          'h-12 w-12 rounded-2xl flex items-center justify-center mb-3 transition-all',
          isDragActive ? 'bg-neutral-200 dark:bg-neutral-700' : 'bg-[var(--bg-muted)]',
        )}>
          <Upload className={cn('h-6 w-6', isDragActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]')} />
        </div>
        <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
          {isDragActive ? 'Drop files here…' : 'Drag & drop files here'}
        </p>
        <p className="text-xs text-[var(--text-muted)]">PDF, DOCX, TXT up to 50 MB each</p>
        <button
          type="button"
          className="mt-3 text-xs font-medium text-[var(--text-primary)] underline hover:opacity-80"
          onClick={(e) => e.stopPropagation()}
        >
          or click to browse
        </button>
      </div>

      {/* File list */}
      <AnimatePresence>
        {files.map((uf) => (
          <motion.div
            key={uf.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] overflow-hidden"
          >
            <div className="flex items-center gap-3 p-3.5">
              <div className="h-9 w-9 rounded-lg bg-[var(--bg-muted)] flex items-center justify-center flex-shrink-0">
                <File className="h-4.5 w-4.5 text-[var(--text-primary)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">{uf.file.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{formatBytes(uf.file.size)}</p>
              </div>

              <div className="flex items-center gap-2">
                {uf.status === 'pending' && (
                  <span className="text-xs text-[var(--text-muted)]">Ready</span>
                )}
                {uf.status === 'uploading' && (
                  <>
                    <Loader2 className="h-4 w-4 text-[var(--text-primary)] animate-spin" />
                    <span className="text-xs text-[var(--text-primary)]">{uf.progress}%</span>
                  </>
                )}
                {uf.status === 'done' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                {uf.status === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
                {uf.status === 'pending' && (
                  <button
                    onClick={() => removeFile(uf.id)}
                    className="p-1 rounded hover:bg-[var(--bg-muted)] text-[var(--text-muted)] hover:text-red-500 transition-colors"
                    aria-label="Remove file"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Progress bar */}
            {uf.status === 'uploading' && (
              <div className="h-1 bg-[var(--bg-muted)]">
                <motion.div
                  className="h-full bg-black dark:bg-white rounded-full"
                  style={{ width: `${uf.progress}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {files.some((f) => f.status === 'pending') && (
        <Button
          variant="primary"
          onClick={handleUploadAll}
          className="w-full"
          id="upload-all-btn"
        >
          <Upload className="h-4 w-4" />
          Upload {files.filter((f) => f.status === 'pending').length} File{files.filter((f) => f.status === 'pending').length > 1 ? 's' : ''}
        </Button>
      )}
    </div>
  );
}
