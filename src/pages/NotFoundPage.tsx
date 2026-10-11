import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ROUTES } from '../lib/constants';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)] p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="text-8xl font-black text-[var(--text-primary)] tracking-tighter mb-4">
          404
        </div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Page Not Found</h1>
        <p className="text-[var(--text-secondary)] mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button variant="primary" onClick={() => history.back()}>
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Link to={ROUTES.HOME}>
            <Button variant="outline">
              <Home className="h-4 w-4" />
              Home
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
