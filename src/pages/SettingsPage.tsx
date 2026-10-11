import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sun, Moon, Monitor, Trash2, User, Bell, Shield, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore, useThemeStore } from '../store';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/common/Toast';
import { getInitials, cn } from '../lib/utils';
import type { Theme } from '../types';
import { Dialog, DialogContent } from '../components/ui/Dialog';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  department: z.string().optional(),
});

type ProfileData = z.infer<typeof profileSchema>;

const themeOptions: { value: Theme; label: string; icon: React.ElementType; desc: string }[] = [
  { value: 'light', label: 'Light', icon: Sun, desc: 'White backgrounds and light surfaces' },
  { value: 'dark', label: 'Dark', icon: Moon, desc: 'Dark backgrounds, easy on the eyes' },
  { value: 'system', label: 'System', icon: Monitor, desc: 'Follows your OS preference' },
];

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border-color)] bg-[var(--bg-muted)]">
        <Icon className="h-4 w-4 text-[var(--text-primary)]" />
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export function SettingsPage() {
  const { user, updateUser, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const { toast } = useToast();
  const [clearHistoryOpen, setClearHistoryOpen] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      department: user?.department ?? '',
    },
  });

  const onSave = async (data: ProfileData) => {
    await new Promise((r) => setTimeout(r, 800));
    updateUser({ name: data.name, email: data.email, department: data.department });
    toast('Profile updated successfully', 'success');
  };

  const handleClearHistory = () => {
    toast('Chat history cleared', 'success');
    setClearHistoryOpen(false);
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">Manage your account and preferences</p>
      </div>

      <div className="max-w-2xl space-y-5">
        {/* Profile */}
        <Section title="Profile Information" icon={User}>
          <div className="flex items-center gap-4 mb-5">
            <div className="h-16 w-16 rounded-2xl bg-black text-white dark:bg-white dark:text-black border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-xl font-bold">
              {user ? getInitials(user.name) : 'U'}
            </div>
            <div>
              <p className="font-semibold text-[var(--text-primary)]">{user?.name}</p>
              <p className="text-sm text-[var(--text-muted)]">{user?.email}</p>
              <span className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-[var(--text-primary)] bg-[var(--bg-muted)] border border-[var(--border-color)] px-2 py-0.5 rounded-full capitalize">
                {user?.role}
              </span>
            </div>
          </div>
          <form onSubmit={handleSubmit(onSave)} className="space-y-4">
            <Input
              id="settings-name"
              label="Full Name"
              placeholder="Your full name"
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              id="settings-email"
              type="email"
              label="Email Address"
              placeholder="your@email.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              id="settings-dept"
              label="Department"
              placeholder="e.g. Computer Science"
              {...register('department')}
            />
            <Button type="submit" variant="primary" loading={isSubmitting} id="save-profile-btn">
              Save Changes
            </Button>
          </form>
        </Section>

        {/* Theme */}
        <Section title="Appearance" icon={Sun}>
          <div className="grid grid-cols-3 gap-3">
            {themeOptions.map(({ value, label, icon: Icon, desc }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all duration-150',
                  theme === value
                    ? 'border-neutral-900 bg-neutral-100 dark:border-neutral-100 dark:bg-neutral-800'
                    : 'border-[var(--border-color)] hover:border-neutral-400 dark:hover:border-neutral-600 hover:bg-[var(--bg-muted)]',
                )}
                aria-pressed={theme === value}
                aria-label={`${label} theme`}
              >
                <Icon className={cn('h-5 w-5', theme === value ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]')} />
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-tight">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </Section>

        {/* Notifications */}
        <Section title="Notifications" icon={Bell}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Email notifications</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Receive updates about system changes</p>
            </div>
            <button
              onClick={() => setNotifications((n) => !n)}
              aria-checked={notifications}
              role="switch"
              aria-label="Toggle email notifications"
              className={cn(
                'relative h-6 w-11 rounded-full transition-all duration-200 focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2',
                notifications ? 'bg-black dark:bg-white' : 'bg-[var(--bg-subtle)]',
              )}
            >
              <motion.span
                animate={{ x: notifications ? 20 : 2 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className={cn('absolute top-1 h-4 w-4 rounded-full shadow-sm', notifications ? 'bg-white dark:bg-black' : 'bg-white dark:bg-neutral-400')}
              />
            </button>
          </div>
        </Section>

        {/* Data */}
        <Section title="Data & Privacy" icon={Shield}>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-muted)] border border-[var(--border-color)]">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Clear chat history</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Permanently delete all your conversations</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setClearHistoryOpen(true)}
                id="clear-history-btn"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">Sign out everywhere</p>
                <p className="text-xs text-red-400 mt-0.5">Sign out from all devices</p>
              </div>
              <Button variant="danger" size="sm" onClick={logout} id="signout-btn">
                Sign Out
              </Button>
            </div>
          </div>
        </Section>
      </div>

      {/* Clear History Dialog */}
      <Dialog open={clearHistoryOpen} onOpenChange={setClearHistoryOpen}>
        <DialogContent
          title="Clear Chat History"
          description="This will permanently delete all your chat conversations. This action cannot be undone."
        >
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={() => setClearHistoryOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleClearHistory} id="confirm-clear-history-btn">
              Clear History
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
