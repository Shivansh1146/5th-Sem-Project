import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthLayout } from './layouts/AuthLayout';
import { AppLayout } from './layouts/AppLayout';
import { ThemeProvider } from './components/common/ThemeProvider';
import { ToastProvider } from './components/common/Toast';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ProtectedRoute, GuestRoute } from './features/auth/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ChatPage } from './pages/ChatPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ROUTES } from './lib/constants';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <ErrorBoundary>
            <BrowserRouter>
              <Routes>
                {/* Public */}
                <Route path={ROUTES.HOME} element={<LandingPage />} />

                {/* Guest-only auth routes */}
                <Route element={<AuthLayout />}>
                  <Route
                    path={ROUTES.LOGIN}
                    element={
                      <GuestRoute>
                        <LoginPage />
                      </GuestRoute>
                    }
                  />
                  <Route
                    path={ROUTES.SIGNUP}
                    element={
                      <GuestRoute>
                        <SignupPage />
                      </GuestRoute>
                    }
                  />
                </Route>

                {/* Protected app routes */}
                <Route
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/chat" element={<ChatPage />} />
                  <Route path="/chat/:id" element={<ChatPage />} />
                  <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />

                  {/* Admin-only routes */}
                  <Route
                    path={ROUTES.DOCUMENTS}
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <DocumentsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path={ROUTES.ANALYTICS}
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AnalyticsPage />
                      </ProtectedRoute>
                    }
                  />
                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </BrowserRouter>
          </ErrorBoundary>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
