import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  MessageSquare,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Monitor,
  ChevronDown,
} from 'lucide-react';
import { useAuthStore, useThemeStore } from '../store';
import { ROUTES } from '../lib/constants';
import { cn, getInitials } from '../lib/utils';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

const NAV_ITEMS = [
  { to: ROUTES.CHAT, icon: MessageSquare, label: 'Chat', roles: ['student', 'admin'] },
  { to: ROUTES.DOCUMENTS, icon: FileText, label: 'Documents', roles: ['admin'] },
  { to: ROUTES.ANALYTICS, icon: BarChart3, label: 'Analytics', roles: ['admin'] },
  { to: ROUTES.SETTINGS, icon: Settings, label: 'Settings', roles: ['student', 'admin'] },
];

function Sidebar({ onClose }: { onClose?: () => void }) {
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const navigate = useNavigate();

  const visibleNav = NAV_ITEMS.filter((item) => user && item.roles.includes(user.role));

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ] as const;

  return (
    <div className="flex h-full flex-col bg-[var(--bg-surface)] border-r border-[var(--border-color)]">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-black text-white dark:bg-white dark:text-black border border-neutral-200 dark:border-neutral-800 flex items-center justify-center">
            <GraduationCap className="h-4 w-4" />
          </div>
          <div>
            <div className="font-bold text-sm text-[var(--text-primary)]">AcadIQ</div>
            <div className="text-xs text-[var(--text-muted)]">Query Assistant</div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--bg-muted)] text-[var(--text-muted)] lg:hidden">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1" aria-label="Main navigation">
        {visibleNav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-[var(--bg-muted)] text-[var(--text-primary)] font-medium'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-primary)]',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn('h-4 w-4 flex-shrink-0', isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]')} />
                {label}
                {isActive && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--text-primary)]"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Theme picker */}
      <div className="px-3 py-2 border-t border-[var(--border-color)]">
        <div className="flex items-center gap-1 bg-[var(--bg-muted)] rounded-lg p-1">
          {themeOptions.map(({ value, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={cn(
                'flex-1 flex items-center justify-center p-1.5 rounded-md transition-all duration-150',
                theme === value
                  ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[var(--shadow-sm)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
              )}
              aria-label={`${value} theme`}
              title={`${value} theme`}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
      </div>

      {/* User profile */}
      <div className="p-3 border-t border-[var(--border-color)]">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex w-full items-center gap-3 rounded-lg p-2 hover:bg-[var(--bg-muted)] transition-colors text-left">
              <div className="h-8 w-8 rounded-full bg-black text-white dark:bg-white dark:text-black border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                {user ? getInitials(user.name) : 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[var(--text-primary)] truncate">{user?.name}</div>
                <div className="text-xs text-[var(--text-muted)] capitalize">{user?.role}</div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-[var(--text-muted)] flex-shrink-0" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              side="top"
              align="start"
              sideOffset={4}
              className="z-50 w-52 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-1 shadow-[var(--shadow-xl)]"
            >
              <DropdownMenu.Item
                onSelect={() => navigate(ROUTES.SETTINGS)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] cursor-pointer outline-none hover:bg-[var(--bg-muted)] transition-colors"
              >
                <Settings className="h-4 w-4 text-[var(--text-muted)]" />
                Settings
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="my-1 h-px bg-[var(--border-color)]" />
              <DropdownMenu.Item
                onSelect={handleLogout}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-500 cursor-pointer outline-none hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </div>
  );
}

export function AppLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-app)]">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-56 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-64 lg:hidden"
            >
              <Sidebar onClose={() => setMobileSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-surface)] lg:hidden">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-muted)] text-[var(--text-secondary)]"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-black text-white dark:bg-white dark:text-black border border-neutral-200 dark:border-neutral-800 flex items-center justify-center">
              <GraduationCap className="h-3.5 w-3.5" />
            </div>
            <span className="font-bold text-sm text-[var(--text-primary)]">AcadIQ</span>
          </div>
        </div>

        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
