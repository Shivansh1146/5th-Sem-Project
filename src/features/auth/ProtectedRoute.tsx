import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { ROUTES } from '@/lib/constants';
import { mockUsers } from '@/mocks/data';
import { Button } from '@/components/ui/Button';
import { ShieldAlert, ArrowLeft, ShieldCheck } from 'lucide-react';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user, switchRole } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
        <div className="h-16 w-16 rounded-2xl bg-[var(--bg-muted)] border border-[var(--border-color)] flex items-center justify-center mb-4 shadow-sm">
          <ShieldAlert className="h-8 w-8 text-[var(--text-primary)]" />
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Admin Access Required</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-md">
          This section is restricted to University Administrators. You are currently signed in as{' '}
          <span className="font-semibold text-[var(--text-primary)]">{user?.name}</span> ({user?.role}).
        </p>
        <div className="flex items-center gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => navigate(ROUTES.CHAT)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Chat
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              switchRole('admin');
            }}
            className="flex items-center gap-2"
          >
            <ShieldCheck className="h-4 w-4" />
            Switch to Admin Demo
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to={ROUTES.CHAT} replace />;
  return <>{children}</>;
}
