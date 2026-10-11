import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, GraduationCap, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store';
import { login } from '@/services/api';
import { ROUTES } from '@/lib/constants';
import { useToast } from '@/components/common/Toast';
import type { UserRole } from '@/types';
import { cn } from '@/lib/utils';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'admin']),
});

type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login: storeLogin } = useAuthStore();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'student' },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: FormData) => {
    try {
      const res = await login(data.email, data.password, data.role);
      storeLogin(res.user, res.token);
      toast('Welcome back! 👋', 'success');
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
      navigate(from || ROUTES.CHAT, { replace: true });
    } catch (err) {
      toast('Invalid credentials. Please try again.', 'error');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">Welcome back</h1>
      <p className="text-sm text-[var(--text-secondary)] mb-8">
        Sign in to your account to continue
      </p>

      {/* Role picker */}
      <div className="mb-6">
        <label className="text-sm font-medium text-[var(--text-primary)] mb-2 block">Sign in as</label>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="User role">
          {([
            { value: 'student', label: 'Student', icon: GraduationCap, desc: 'Access chat & resources' },
            { value: 'admin', label: 'Admin', icon: ShieldCheck, desc: 'Manage documents & analytics' },
          ] as { value: UserRole; label: string; icon: typeof GraduationCap; desc: string }[]).map(
            ({ value, label, icon: Icon, desc }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={selectedRole === value}
                onClick={() => setValue('role', value)}
                className={cn(
                  'flex flex-col items-start gap-1 rounded-xl border p-3.5 text-left transition-all duration-150',
                  selectedRole === value
                    ? 'border-neutral-900 bg-neutral-100 dark:border-neutral-100 dark:bg-neutral-800'
                    : 'border-[var(--border-color)] hover:border-neutral-400 dark:hover:border-neutral-600 hover:bg-[var(--bg-muted)]',
                )}
              >
                <Icon className={cn('h-5 w-5', selectedRole === value ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]')} />
                <span className={cn('text-sm font-semibold text-[var(--text-primary)]')}>
                  {label}
                </span>
                <span className="text-xs text-[var(--text-muted)]">{desc}</span>
              </button>
            ),
          )}
        </div>
        {errors.role && <p className="mt-1 text-xs text-red-500">{errors.role.message}</p>}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Input
          id="login-email"
          type="email"
          label="Email address"
          placeholder="you@university.edu"
          autoComplete="email"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          id="login-password"
          type={showPassword ? 'text' : 'password'}
          label="Password"
          placeholder="Enter your password"
          autoComplete="current-password"
          leftIcon={<Lock className="h-4 w-4" />}
          rightIcon={
            <button type="button" onClick={() => setShowPassword((p) => !p)} tabIndex={-1} aria-label="Toggle password visibility">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex items-center justify-between text-sm mt-1">
          <label className="flex items-center gap-2 cursor-pointer text-[var(--text-secondary)]">
            <input type="checkbox" className="rounded border-[var(--border-color)] accent-black dark:accent-white" />
            Remember me
          </label>
          <a href="#" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium underline">
            Forgot password?
          </a>
        </div>

        <Button type="submit" variant="primary" size="lg" loading={isSubmitting} className="mt-2 w-full">
          Sign In
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
        Don't have an account?{' '}
        <Link to={ROUTES.SIGNUP} className="font-semibold text-[var(--text-primary)] underline hover:opacity-80">
          Sign up
        </Link>
      </p>

      {/* Demo hint */}
      <div className="mt-6 rounded-xl bg-[var(--bg-muted)] border border-[var(--border-color)] p-3.5">
        <p className="text-xs text-[var(--text-muted)] text-center">
          <span className="font-medium text-[var(--text-secondary)]">Demo:</span> Any email + password (6+ chars) works.
          Choose your role above.
        </p>
      </div>
    </div>
  );
}
