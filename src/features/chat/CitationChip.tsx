import { FileText } from 'lucide-react';
import type { Citation } from '@/types';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils';

interface CitationChipProps {
  citation: Citation;
  onClick?: () => void;
  active?: boolean;
}

export function CitationChip({ citation, onClick, active }: CitationChipProps) {
  return (
    <Tooltip
      content={
        <div className="max-w-xs">
          <p className="font-medium">{citation.documentName}</p>
          <p className="text-white/70 text-[10px] mt-0.5">Page {citation.pageNumber} · {citation.relevanceScore}% match</p>
        </div>
      }
    >
      <button
        onClick={onClick}
        aria-label={`Source: ${citation.documentName}, page ${citation.pageNumber}`}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium transition-all duration-150',
          active
            ? 'border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900 shadow-sm'
            : 'border-[var(--border-color)] bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:border-neutral-400 dark:hover:border-neutral-600 hover:text-[var(--text-primary)]',
        )}
      >
        <FileText className="h-2.5 w-2.5 flex-shrink-0" />
        <span className="max-w-[140px] truncate">{citation.documentName.replace('.pdf', '')}</span>
        <span className="text-[var(--text-muted)]">p.{citation.pageNumber}</span>
        <span
          className={cn(
            'rounded-full px-1 py-px',
            citation.relevanceScore >= 85
              ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30'
              : citation.relevanceScore >= 60
              ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30'
              : 'bg-red-100 text-red-600 dark:bg-red-900/30',
          )}
        >
          {citation.relevanceScore}%
        </span>
      </button>
    </Tooltip>
  );
}
