import { useRef, useEffect, useCallback, KeyboardEvent } from 'react';
import { useState } from 'react';
import { Send, Filter, ChevronDown } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { CATEGORIES, DEPARTMENTS, SEMESTERS } from '@/lib/constants';
import type { QueryFilters } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface InputBarProps {
  onSend: (query: string, filters: QueryFilters) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function InputBar({ onSend, disabled, placeholder }: InputBarProps) {
  const [value, setValue] = useState('');
  const [filters, setFilters] = useState<QueryFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 180)}px`;
  }, [value]);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed, filters);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [value, filters, disabled, onSend]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasFilters = filters.category || filters.department || filters.semester;

  return (
    <div className="px-4 py-3 border-t border-[var(--border-color)] bg-[var(--bg-surface)]">
      {/* Filters row */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 mb-3 p-3 rounded-xl bg-[var(--bg-muted)] border border-[var(--border-color)]">
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <Filter className="h-3.5 w-3.5" />
            <span className="font-medium">Filters:</span>
          </div>

          {/* Category */}
          <select
            value={filters.category ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value || undefined }))}
            className="h-7 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-2 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-indigo-500"
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Department */}
          <select
            value={filters.department ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, department: e.target.value || undefined }))}
            className="h-7 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-2 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-indigo-500"
            aria-label="Filter by department"
          >
            {DEPARTMENTS.map((d) => <option key={d} value={d === 'All Departments' ? '' : d}>{d}</option>)}
          </select>

          {/* Semester */}
          <select
            value={filters.semester ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, semester: e.target.value ? Number(e.target.value) : undefined }))}
            className="h-7 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-2 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-indigo-500"
            aria-label="Filter by semester"
          >
            <option value="">All Semesters</option>
            {SEMESTERS.map((s) => <option key={s} value={s}>Semester {s}</option>)}
          </select>

          {hasFilters && (
            <button
              onClick={() => setFilters({})}
              className="text-xs text-red-500 hover:text-red-600 ml-auto"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Input area */}
      <div className={cn(
        'flex items-end gap-2 rounded-2xl border bg-[var(--bg-muted)] px-4 py-3 transition-all duration-150',
        'focus-within:border-neutral-400 dark:focus-within:border-neutral-500 focus-within:bg-[var(--bg-surface)] focus-within:shadow-sm',
        'border-[var(--border-color)]',
      )}>
        {/* Filter toggle */}
        <button
          type="button"
          onClick={() => setShowFilters((s) => !s)}
          aria-label="Toggle filters"
          aria-expanded={showFilters}
          className={cn(
            'flex-shrink-0 p-1.5 rounded-lg transition-all duration-150',
            showFilters || hasFilters
              ? 'text-black bg-neutral-200 dark:text-white dark:bg-neutral-800'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)]',
          )}
        >
          <Filter className="h-4 w-4" />
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? 'Ask anything about your university…'}
          disabled={disabled}
          rows={1}
          aria-label="Chat input"
          aria-multiline="true"
          className={cn(
            'flex-1 resize-none bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
            'focus:outline-none leading-relaxed min-h-[24px]',
          )}
        />

        {/* Send button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          aria-label="Send message"
          className={cn(
            'flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center transition-all duration-150',
            value.trim() && !disabled
              ? 'bg-[#0d0d0d] text-white hover:bg-[#2f2f2f] dark:bg-white dark:text-[#0d0d0d] dark:hover:bg-[#eaeaea] shadow-sm'
              : 'bg-[var(--bg-subtle)] text-[var(--text-muted)] cursor-not-allowed',
          )}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>

      <p className="text-center text-[10px] text-[var(--text-muted)] mt-2">
        Press <kbd className="px-1 py-0.5 rounded border border-[var(--border-color)] bg-[var(--bg-muted)] text-[9px]">Enter</kbd> to send ·{' '}
        <kbd className="px-1 py-0.5 rounded border border-[var(--border-color)] bg-[var(--bg-muted)] text-[9px]">Shift+Enter</kbd> for newline
      </p>
    </div>
  );
}
