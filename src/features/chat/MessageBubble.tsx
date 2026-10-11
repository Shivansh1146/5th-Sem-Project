import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ThumbsUp, ThumbsDown, Copy, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Message, Citation } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { Button } from '@/components/ui/Button';
import { submitFeedback } from '@/services/api';
import { useChatStore } from '@/store';
import { useToast } from '@/components/common/Toast';
import { formatRelative, cn } from '@/lib/utils';
import { CitationChip } from './CitationChip';

function ConfidenceBadge({ level }: { level: 'high' | 'medium' | 'low' }) {
  const config = {
    high: { variant: 'success' as const, label: '● High confidence' },
    medium: { variant: 'warning' as const, label: '◐ Medium confidence' },
    low: { variant: 'danger' as const, label: '○ Low confidence' },
  };
  const { variant, label } = config[level];
  return <Badge variant={variant} className="text-[10px] py-0">{label}</Badge>;
}

interface MessageBubbleProps {
  message: Message;
  onRegenerate?: () => void;
}

export function MessageBubble({ message, onRegenerate }: MessageBubbleProps) {
  const { role, content, citations, confidence, feedback, isStreaming, timestamp, id } = message;
  const { setSelectedCitation } = useChatStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [localFeedback, setLocalFeedback] = useState(feedback);
  const [showCitations, setShowCitations] = useState(true);

  const feedbackMutation = useMutation({
    mutationFn: (value: 'up' | 'down') => submitFeedback(id, value),
    onSuccess: (_, value) => {
      setLocalFeedback(value);
      toast(value === 'up' ? 'Thanks for the positive feedback!' : 'Thanks for your feedback. We\'ll improve.', 'info');
    },
  });

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    toast('Answer copied to clipboard', 'success');
  };

  if (role === 'user') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end px-4 py-2"
      >
        <div className="max-w-[75%]">
          <div className="bg-[#f4f4f4] text-[#0d0d0d] dark:bg-[#2f2f2f] dark:text-[#ececec] border border-[#e5e5e5] dark:border-[#383838] rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed">
            {content}
          </div>
          <p className="text-[10px] text-[var(--text-muted)] text-right mt-1">{formatRelative(timestamp)}</p>
        </div>
      </motion.div>
    );
  }

  // Assistant message
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 px-4 py-2"
    >
      {/* Avatar */}
      <div className="h-8 w-8 rounded-full bg-black text-white dark:bg-white dark:text-black border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5 shadow-sm">
        AI
      </div>

      <div className="flex-1 min-w-0">
        {/* Confidence + time row */}
        <div className="flex items-center gap-2 mb-2">
          {confidence && <ConfidenceBadge level={confidence} />}
          <span className="text-[10px] text-[var(--text-muted)]">{formatRelative(timestamp)}</span>
        </div>

        {/* Content */}
        <div
          className={cn(
            'rounded-2xl rounded-tl-sm bg-[var(--bg-surface)] border border-[var(--border-color)] px-4 py-3.5',
            'shadow-[var(--shadow-sm)]',
          )}
        >
          {isStreaming ? (
            <div className="prose text-sm typing-cursor">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
          ) : (
            <div className="prose text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Citations */}
        {citations && citations.length > 0 && (
          <div className="mt-2.5">
            <button
              onClick={() => setShowCitations((s) => !s)}
              className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors mb-1.5"
            >
              {showCitations ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {citations.length} source{citations.length > 1 ? 's' : ''}
            </button>
            <AnimatePresence>
              {showCitations && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-wrap gap-1.5"
                >
                  {citations.map((cit) => (
                    <CitationChip
                      key={cit.id}
                      citation={cit}
                      onClick={() => setSelectedCitation(cit.id)}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Action buttons */}
        {!isStreaming && (
          <div className="flex items-center gap-1 mt-2.5">
            <Tooltip content="Helpful">
              <button
                onClick={() => feedbackMutation.mutate('up')}
                aria-label="Mark as helpful"
                aria-pressed={localFeedback === 'up'}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all duration-150',
                  localFeedback === 'up'
                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'text-[var(--text-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-primary)]',
                )}
              >
                <ThumbsUp className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
            <Tooltip content="Not helpful">
              <button
                onClick={() => feedbackMutation.mutate('down')}
                aria-label="Mark as not helpful"
                aria-pressed={localFeedback === 'down'}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all duration-150',
                  localFeedback === 'down'
                    ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                    : 'text-[var(--text-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-primary)]',
                )}
              >
                <ThumbsDown className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
            <Tooltip content="Copy">
              <button
                onClick={handleCopy}
                aria-label="Copy answer"
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-[var(--text-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-primary)] transition-all duration-150"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
            {onRegenerate && (
              <Tooltip content="Regenerate">
                <button
                  onClick={onRegenerate}
                  aria-label="Regenerate answer"
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-[var(--text-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-primary)] transition-all duration-150"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              </Tooltip>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
