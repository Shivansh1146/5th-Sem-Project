import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, ExternalLink } from 'lucide-react';
import { useChatStore } from '@/store';
import { mockChats } from '@/mocks/data';
import { useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';

function highlightText(text: string, highlight: string): React.ReactNode {
  if (!highlight) return text;
  const parts = text.split(new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === highlight.toLowerCase() ? (
      <mark key={i} className="bg-amber-200 dark:bg-amber-800/50 text-[var(--text-primary)] rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

export function SourcePanel() {
  const { sourcePanelOpen, selectedCitationId, setSelectedCitation, setSourcePanelOpen } = useChatStore();
  const { id: chatId } = useParams<{ id?: string }>();

  // Find the citation from all messages in the active chat
  const chat = mockChats.find((c) => c.id === chatId) ?? mockChats[0];
  const allCitations = chat?.messages.flatMap((m) => m.citations ?? []) ?? [];
  const citation = allCitations.find((c) => c.id === selectedCitationId);

  const handleClose = () => {
    setSelectedCitation(null);
    setSourcePanelOpen(false);
  };

  return (
    <AnimatePresence>
      {sourcePanelOpen && (
        <motion.div
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="w-80 flex-shrink-0 border-l border-[var(--border-color)] bg-[var(--bg-surface)] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-500" />
              <span className="text-sm font-semibold text-[var(--text-primary)]">Source Document</span>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg hover:bg-[var(--bg-muted)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              aria-label="Close source panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {citation ? (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Document info */}
              <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 p-3.5">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-4.5 w-4.5 text-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 truncate">
                      {citation.documentName}
                    </p>
                    <p className="text-xs text-indigo-500 mt-0.5">Page {citation.pageNumber}</p>
                  </div>
                </div>
              </div>

              {/* Relevance score */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-[var(--text-secondary)]">Relevance Score</span>
                  <span className={cn(
                    'text-xs font-bold',
                    citation.relevanceScore >= 85 ? 'text-emerald-500' : citation.relevanceScore >= 60 ? 'text-amber-500' : 'text-red-500',
                  )}>
                    {citation.relevanceScore}%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[var(--bg-muted)] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${citation.relevanceScore}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={cn(
                      'h-full rounded-full',
                      citation.relevanceScore >= 85 ? 'bg-emerald-500' : citation.relevanceScore >= 60 ? 'bg-amber-500' : 'bg-red-500',
                    )}
                  />
                </div>
              </div>

              {/* Snippet */}
              <div>
                <p className="text-xs font-medium text-[var(--text-secondary)] mb-2">Extracted Passage</p>
                <div className="rounded-xl bg-[var(--bg-muted)] border border-[var(--border-color)] p-3.5">
                  <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                    {highlightText(citation.snippet, citation.matchedText)}
                  </p>
                </div>
              </div>

              {/* Matched text */}
              <div>
                <p className="text-xs font-medium text-[var(--text-secondary)] mb-2">Matched Phrase</p>
                <div className="rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/20 p-3">
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                    "{citation.matchedText}"
                  </p>
                </div>
              </div>

              {/* Action */}
              <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border-color)] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] transition-colors">
                <ExternalLink className="h-4 w-4" />
                View Full Document
              </button>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6 text-center">
              <div>
                <FileText className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-3" />
                <p className="text-sm text-[var(--text-secondary)]">Click a source citation to view the matched passage</p>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
