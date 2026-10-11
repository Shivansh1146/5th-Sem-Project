import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-[440px] flex-shrink-0 bg-[#0d0d0d] border-r border-[#262626] p-10 text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-white/30"
              style={{
                width: `${(i + 1) * 120}px`,
                height: `${(i + 1) * 120}px`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-lg leading-tight">AcadIQ</div>
              <div className="text-xs text-white/60">Academic Query Assistant</div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex gap-1 mb-6">
            {['Ask', '→', 'Retrieve', '→', 'Answer'].map((step, i) => (
              <span
                key={i}
                className={`text-sm font-medium ${step === '→' ? 'text-white/40 mx-1' : 'bg-white/15 px-3 py-1 rounded-full'}`}
              >
                {step}
              </span>
            ))}
          </div>
          <h1 className="text-3xl font-bold leading-snug mb-4">
            Your university questions,<br />answered instantly.
          </h1>
          <p className="text-white/70 text-base leading-relaxed">
            Ask anything about syllabus, exams, fees, hostel, or placement — get accurate answers
            sourced directly from official university documents.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { label: 'Documents', value: '50+' },
              { label: 'Questions Answered', value: '4,800+' },
              { label: 'Satisfaction', value: '87%' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
                <div className="text-xl font-bold">{stat.value}</div>
                <div className="text-xs text-white/60 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-white/40">
          © 2024 University Knowledge Management System
        </div>
      </div>

      {/* Right auth form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[var(--bg-app)]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="h-9 w-9 rounded-xl bg-black text-white dark:bg-white dark:text-black border border-neutral-300 dark:border-neutral-700 flex items-center justify-center">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="font-bold text-lg text-[var(--text-primary)]">AcadIQ</div>
          </div>
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
}
