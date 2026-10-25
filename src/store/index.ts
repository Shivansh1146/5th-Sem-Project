import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Theme, UserRole } from '../types';
import { mockUsers } from '../mocks/data';

// ─── Role Session ─────────────────────────────────────────────────────────────

export interface RoleSession {
  user: User | null;
  token: string | null;
  theme: Theme;
}

// ─── Auth Store ───────────────────────────────────────────────────────────────

interface AuthState {
  activeRole: UserRole;
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  studentSession: RoleSession;
  adminSession: RoleSession;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  switchRole: (targetRole: UserRole) => void;
}

const initialStudentSession: RoleSession = {
  user: mockUsers.student,
  token: 'mock-student-token',
  theme: 'dark',
};

const initialAdminSession: RoleSession = {
  user: mockUsers.admin,
  token: 'mock-admin-token',
  theme: 'dark',
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      activeRole: 'student',
      user: mockUsers.student,
      token: 'mock-student-token',
      isAuthenticated: true,
      studentSession: initialStudentSession,
      adminSession: initialAdminSession,

      login: (user, token) => {
        localStorage.setItem('rag_token', token);
        const role = user.role;
        set((state) => {
          const targetTheme =
            role === 'admin' ? state.adminSession.theme : state.studentSession.theme;
          useThemeStore.getState().setTheme(targetTheme);
          return {
            activeRole: role,
            user,
            token,
            isAuthenticated: true,
            studentSession:
              role === 'student' ? { ...state.studentSession, user, token } : state.studentSession,
            adminSession:
              role === 'admin' ? { ...state.adminSession, user, token } : state.adminSession,
          };
        });
      },

      logout: () => {
        localStorage.removeItem('rag_token');
        set((state) => {
          if (state.activeRole === 'student') {
            return {
              user: null,
              token: null,
              isAuthenticated: false,
              studentSession: { ...state.studentSession, user: null, token: null },
            };
          } else {
            return {
              user: null,
              token: null,
              isAuthenticated: false,
              adminSession: { ...state.adminSession, user: null, token: null },
            };
          }
        });
      },

      updateUser: (updates) => {
        set((state) => {
          if (!state.user) return state;
          const updatedUser = { ...state.user, ...updates };
          return {
            user: updatedUser,
            studentSession:
              state.activeRole === 'student'
                ? { ...state.studentSession, user: updatedUser }
                : state.studentSession,
            adminSession:
              state.activeRole === 'admin'
                ? { ...state.adminSession, user: updatedUser }
                : state.adminSession,
          };
        });
      },

      switchRole: (targetRole) => {
        const state = get();
        const session = targetRole === 'admin' ? state.adminSession : state.studentSession;
        const targetUser = session.user ?? (targetRole === 'admin' ? mockUsers.admin : mockUsers.student);
        const targetToken = session.token ?? (targetRole === 'admin' ? 'mock-admin-token' : 'mock-student-token');
        localStorage.setItem('rag_token', targetToken);

        // Apply this role's isolated theme preference
        useThemeStore.getState().setTheme(session.theme);

        set({
          activeRole: targetRole,
          user: targetUser,
          token: targetToken,
          isAuthenticated: true,
        });
      },
    }),
    {
      name: 'rag-auth-v2',
      partialize: (state) => ({
        activeRole: state.activeRole,
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        studentSession: state.studentSession,
        adminSession: state.adminSession,
      }),
    },
  ),
);

// ─── Theme Store ──────────────────────────────────────────────────────────────

interface ThemeState {
  theme: Theme;
  studentTheme: Theme;
  adminTheme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark',
      studentTheme: 'dark',
      adminTheme: 'dark',
      setTheme: (theme) => {
        const auth = useAuthStore.getState();
        const role = auth.activeRole ?? (auth.user?.role || 'student');

        set((state) => ({
          theme,
          studentTheme: role === 'student' ? theme : state.studentTheme,
          adminTheme: role === 'admin' ? theme : state.adminTheme,
        }));

        // Persist theme to active role's session
        if (role === 'admin') {
          useAuthStore.setState((s) => ({
            adminSession: { ...s.adminSession, theme },
          }));
        } else {
          useAuthStore.setState((s) => ({
            studentSession: { ...s.studentSession, theme },
          }));
        }
      },
    }),
    { name: 'rag-theme-v2' },
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
