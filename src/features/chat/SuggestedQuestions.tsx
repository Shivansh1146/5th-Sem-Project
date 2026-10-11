import { motion } from 'framer-motion';
import { GraduationCap, Sparkles } from 'lucide-react';
import { SUGGESTED_QUESTIONS } from '@/lib/constants';

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
}

export function SuggestedQuestions({ onSelect }: SuggestedQuestionsProps) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-10"
      >
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-black text-white dark:bg-white dark:text-black mb-5 shadow-sm border border-neutral-200 dark:border-neutral-800">
          <GraduationCap className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
          How can I help you today?
        </h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-sm">
          Ask anything about your university — syllabus, exams, fees, hostel, placements and more.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-2xl">
        {SUGGESTED_QUESTIONS.map((q, i) => (
          <motion.button
            key={q}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            onClick={() => onSelect(q)}
            className="flex items-start gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-3.5 text-left text-sm text-[var(--text-secondary)] hover:border-neutral-400 dark:hover:border-neutral-600 hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)] hover:shadow-[var(--shadow-sm)] transition-all duration-150 group"
            aria-label={`Ask: ${q}`}
          >
            <Sparkles className="h-4 w-4 text-neutral-400 group-hover:text-[var(--text-primary)] mt-0.5 flex-shrink-0 transition-colors" />
            <span>{q}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
