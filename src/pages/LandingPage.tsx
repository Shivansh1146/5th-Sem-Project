import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, FileSearch, Sparkles, GraduationCap, Shield, Zap, MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store';
import { ROUTES } from '../lib/constants';

const STEPS = [
  { icon: MessageSquare, title: 'Ask', desc: 'Type your question in natural language — syllabus, exam rules, fees, hostel, placements.' },
  { icon: FileSearch, title: 'Retrieve', desc: 'Our RAG engine searches university documents and finds the most relevant passages.' },
  { icon: Sparkles, title: 'Answer', desc: 'Get a precise, sourced answer with page citations and confidence scores.' },
];

const FEATURES = [
  { icon: Shield, title: 'Source-backed Answers', desc: 'Every answer comes with citations from official university documents.' },
  { icon: Zap, title: 'Instant Results', desc: 'Sub-2 second response times powered by vector search.' },
  { icon: GraduationCap, title: 'University-specific', desc: 'Trained on your institution\'s syllabus, policies, and circulars.' },
  { icon: BookOpen, title: 'Always Up-to-date', desc: 'Admins can upload new documents and they\'re indexed immediately.' },
];

export function LandingPage() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--bg-app)]">
      {/* Navbar */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-[var(--border-color)] bg-[var(--bg-surface)]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-black text-white dark:bg-white dark:text-black border border-neutral-200 dark:border-neutral-800 flex items-center justify-center">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="font-bold text-[var(--text-primary)]">AcadIQ</span>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button variant="primary" size="sm" onClick={() => navigate(ROUTES.CHAT)}>
                Go to Chat <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <>
                <Link to={ROUTES.LOGIN} className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                  Sign In
                </Link>
                <Button variant="primary" size="sm" onClick={() => navigate(ROUTES.SIGNUP)}>
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-28 pb-20 px-6 relative overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-muted)] px-4 py-1.5 text-xs font-medium text-[var(--text-primary)] mb-6">
              <Sparkles className="h-3 w-3" />
              RAG-Powered Academic Assistant
            </span>
            <h1 className="text-5xl font-extrabold text-[var(--text-primary)] leading-tight tracking-tight mb-5">
              Your University Questions,<br />
              <span>
                Answered Instantly
              </span>
            </h1>
            <p className="text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto mb-8">
              Ask anything about your syllabus, exam rules, fees, hostel policies, or placements.
              Get accurate answers sourced directly from official university documents — with citations.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate(isAuthenticated ? ROUTES.CHAT : ROUTES.SIGNUP)}
                id="hero-cta-btn"
              >
                Start Asking Questions
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate(ROUTES.LOGIN)}
              >
                Sign In
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-6 bg-[var(--bg-surface)] border-y border-[var(--border-color)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">How It Works</h2>
            <p className="text-sm text-[var(--text-secondary)]">Three simple steps to get accurate answers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="relative flex flex-col items-center text-center gap-4 p-6 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-color)]"
              >
                <div className="h-12 w-12 rounded-2xl bg-black text-white dark:bg-white dark:text-black border border-neutral-300 dark:border-neutral-700 flex items-center justify-center shadow-sm">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-[var(--text-muted)] mb-1">STEP {i + 1}</div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">{title}</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{desc}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight className="h-5 w-5 text-[var(--text-muted)]" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Why AcadIQ?</h2>
            <p className="text-sm text-[var(--text-secondary)]">Built for university students and administrators</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                viewport={{ once: true }}
                className="flex gap-4 p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] hover:border-neutral-400 dark:hover:border-neutral-600 transition-all duration-200"
              >
                <div className="h-10 w-10 rounded-xl bg-[var(--bg-muted)] flex items-center justify-center flex-shrink-0 text-[var(--text-primary)]">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)] mb-1">{title}</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-[#0d0d0d] text-white dark:bg-[#171717] dark:border-y dark:border-[#303030] text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-3">Ready to get started?</h2>
          <p className="text-white/70 mb-6">Join students already using AcadIQ to get instant answers.</p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate(isAuthenticated ? ROUTES.CHAT : ROUTES.SIGNUP)}
            className="bg-white text-black hover:bg-neutral-200 border-none dark:bg-white dark:text-black"
            id="footer-cta-btn"
          >
            Get Started for Free <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-[var(--border-color)] bg-[var(--bg-surface)] text-center">
        <p className="text-sm text-[var(--text-muted)]">
          © 2024 AcadIQ — University Knowledge Management System
        </p>
      </footer>
    </div>
  );
}
