import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search, Filter, ChevronUp, ChevronDown, Trash2, RefreshCw, Eye, MoreHorizontal,
  FileText, ChevronLeft, ChevronRight, Upload, Plus,
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import { listDocuments, deleteDocument, reindexDocument } from '@/services/api';
import { DropZone } from '@/features/documents/DropZone';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent } from '@/components/ui/Dialog';
import { DocumentRowSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/common/ErrorBoundary';
import { useToast } from '@/components/common/Toast';
import { CATEGORIES, DEPARTMENTS, STATUS_LABELS } from '@/lib/constants';
import { formatBytes, formatDate, cn } from '@/lib/utils';
import type { Document, DocumentStatus } from '@/types';

type SortKey = 'name' | 'uploadDate' | 'size' | 'status' | 'category';

const statusVariant: Record<DocumentStatus, 'success' | 'warning' | 'default' | 'danger'> = {
  indexed: 'success',
  processing: 'warning',
  uploaded: 'default',
  failed: 'danger',
};

function SortHeader({ label, sortKey, current, dir, onSort }: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  dir: 'asc' | 'desc';
  onSort: (k: SortKey) => void;
}) {
  const active = current === sortKey;
  return (
    <button
      onClick={() => onSort(sortKey)}
      className={cn('flex items-center gap-1 text-xs font-semibold uppercase tracking-wide transition-colors', active ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]')}
    >
      {label}
      {active ? (dir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : <ChevronDown className="h-3 w-3 opacity-30" />}
    </button>
  );
}

export function DocumentsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState<DocumentStatus | ''>('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortKey>('uploadDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['documents', { search, category, department, status, page, sortBy, sortDir }],
    queryFn: () => listDocuments({ search, category: category || undefined, department: department || undefined, status: (status || undefined) as DocumentStatus | undefined, page, pageSize: 10, sortBy, sortDir }),
    placeholderData: (prev) => prev,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast('Document deleted successfully', 'success');
      setDeleteTarget(null);
    },
    onError: () => toast('Failed to delete document', 'error'),
  });

  const reindexMutation = useMutation({
    mutationFn: reindexDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast('Document queued for re-indexing', 'info');
    },
    onError: () => toast('Re-index failed', 'error'),
  });

  const handleSort = (key: SortKey) => {
    if (sortBy === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(key); setSortDir('asc'); }
    setPage(1);
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Document Management</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            Manage university documents for RAG indexing
          </p>
        </div>
        <Button variant="primary" onClick={() => setUploadOpen(true)} id="upload-doc-btn">
          <Plus className="h-4 w-4" />
          Upload Documents
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
          <input
            type="search"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search documents…"
            aria-label="Search documents"
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-muted)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          aria-label="Filter by category"
          className="h-9 rounded-lg border border-[var(--border-color)] bg-[var(--bg-muted)] px-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={department}
          onChange={(e) => { setDepartment(e.target.value); setPage(1); }}
          aria-label="Filter by department"
          className="h-9 rounded-lg border border-[var(--border-color)] bg-[var(--bg-muted)] px-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {DEPARTMENTS.map((d) => <option key={d} value={d === 'All Departments' ? '' : d}>{d}</option>)}
        </select>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value as DocumentStatus | ''); setPage(1); }}
          aria-label="Filter by status"
          className="h-9 rounded-lg border border-[var(--border-color)] bg-[var(--bg-muted)] px-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Statuses</option>
          {(Object.entries(STATUS_LABELS) as [DocumentStatus, string][]).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_100px_80px_56px] items-center gap-4 px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-muted)]">
          <SortHeader label="Name" sortKey="name" current={sortBy} dir={sortDir} onSort={handleSort} />
          <SortHeader label="Category" sortKey="category" current={sortBy} dir={sortDir} onSort={handleSort} />
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Department</span>
          <SortHeader label="Uploaded" sortKey="uploadDate" current={sortBy} dir={sortDir} onSort={handleSort} />
          <SortHeader label="Size" sortKey="size" current={sortBy} dir={sortDir} onSort={handleSort} />
          <SortHeader label="Status" sortKey="status" current={sortBy} dir={sortDir} onSort={handleSort} />
          <span />
        </div>

        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => <DocumentRowSkeleton key={i} />)
        ) : isError ? (
          <ErrorState message="Failed to load documents" onRetry={refetch} />
        ) : (data?.data.length ?? 0) === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <FileText className="h-12 w-12 text-[var(--text-muted)]" />
            <p className="text-sm text-[var(--text-secondary)]">No documents found</p>
            <Button variant="primary" size="sm" onClick={() => setUploadOpen(true)}>
              <Upload className="h-3.5 w-3.5" />
              Upload First Document
            </Button>
          </div>
        ) : (
          data?.data.map((doc) => (
            <div
              key={doc.id}
              className="grid grid-cols-[2fr_1fr_1fr_1fr_100px_80px_56px] items-center gap-4 px-4 py-3.5 border-b border-[var(--border-color)] last:border-b-0 hover:bg-[var(--bg-muted)] transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-8 w-8 rounded-lg bg-[var(--bg-muted)] flex items-center justify-center flex-shrink-0">
                  <FileText className="h-4 w-4 text-[var(--text-primary)]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">{doc.name}</p>
                  {doc.pageCount && <p className="text-xs text-[var(--text-muted)]">{doc.pageCount} pages</p>}
                </div>
              </div>
              <span className="text-xs text-[var(--text-secondary)]">{doc.category}</span>
              <span className="text-xs text-[var(--text-secondary)] truncate">{doc.department}</span>
              <span className="text-xs text-[var(--text-secondary)]">{formatDate(doc.uploadDate)}</span>
              <span className="text-xs text-[var(--text-secondary)]">{formatBytes(doc.size)}</span>
              <Badge variant={statusVariant[doc.status]} dot>
                {STATUS_LABELS[doc.status]}
              </Badge>

              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
                    aria-label="Document actions"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    side="left"
                    align="start"
                    sideOffset={4}
                    className="z-50 w-44 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-1 shadow-[var(--shadow-xl)]"
                  >
                    <DropdownMenu.Item className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] cursor-pointer outline-none hover:bg-[var(--bg-muted)] transition-colors">
                      <Eye className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                      View Document
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      onSelect={() => reindexMutation.mutate(doc.id)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] cursor-pointer outline-none hover:bg-[var(--bg-muted)] transition-colors"
                    >
                      <RefreshCw className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                      Re-index
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator className="my-1 h-px bg-[var(--border-color)]" />
                    <DropdownMenu.Item
                      onSelect={() => setDeleteTarget(doc)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-500 cursor-pointer outline-none hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, data.total)} of {data.total} documents
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)} aria-label="Previous page">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={cn(
                  'h-8 w-8 rounded-lg text-sm font-medium transition-colors',
                  p === page ? 'bg-black text-white dark:bg-white dark:text-black font-semibold' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]',
                )}
              >
                {p}
              </button>
            ))}
            <Button variant="outline" size="sm" disabled={page === data.totalPages} onClick={() => setPage((p) => p + 1)} aria-label="Next page">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent title="Upload Documents" description="Add new documents to the knowledge base for indexing." className="max-w-lg">
          <DropZone onUploaded={() => { queryClient.invalidateQueries({ queryKey: ['documents'] }); setUploadOpen(false); }} />
        </DialogContent>
      </Dialog>

      {/* Delete confirm Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent title="Delete Document" description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button
              variant="danger"
              loading={deleteMutation.isPending}
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              id="confirm-delete-btn"
            >
              Delete Document
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
