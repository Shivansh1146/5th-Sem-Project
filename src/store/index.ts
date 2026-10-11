import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Theme } from '../types';

// ─── Auth Store ───────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => {
        localStorage.setItem('rag_token', token);
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('rag_token');
        set({ user: null, token: null, isAuthenticated: false });
      },
      updateUser: (updates) =>
        set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),
    }),
    {
      name: 'rag-auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    },
  ),
);

// ─── Theme Store ──────────────────────────────────────────────────────────────

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'rag-theme' },
  ),
);

// ─── Chat Store ───────────────────────────────────────────────────────────────

interface ChatState {
  activeChatId: string | null;
  sidebarOpen: boolean;
  sourcePanelOpen: boolean;
  selectedCitationId: string | null;
  setActiveChatId: (id: string | null) => void;
  setSidebarOpen: (open: boolean) => void;
  setSourcePanelOpen: (open: boolean) => void;
  setSelectedCitation: (id: string | null) => void;
}

export const useChatStore = create<ChatState>()((set) => ({
  activeChatId: null,
  sidebarOpen: true,
  sourcePanelOpen: false,
  selectedCitationId: null,
  setActiveChatId: (id) => set({ activeChatId: id }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSourcePanelOpen: (open) => set({ sourcePanelOpen: open }),
  setSelectedCitation: (id) => set({ selectedCitationId: id, sourcePanelOpen: id !== null }),
}));
