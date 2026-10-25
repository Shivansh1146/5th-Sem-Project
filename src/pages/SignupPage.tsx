import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, User, GraduationCap, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store';
import { signup } from '@/services/api';
import { ROUTES } from '@/lib/constants';
import { useToast } from '@/components/common/Toast';
import type { UserRole } from '@/types';
import { cn } from '@/lib/utils';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['student', 'admin']),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export function SignupPage() {
  const [showPw, setShowPw] = useState(false);
  const navigate = useNavigate();
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
      const res = await signup(data.name, data.email, data.password, data.role);
      storeLogin(res.user, res.token);
      toast('Account created! Welcome to AcadIQ 🎓', 'success');
      navigate(ROUTES.CHAT, { replace: true });
    } catch (err) {
      toast('Signup failed. Please try again.', 'error');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">Create your account</h1>
      <p className="text-sm text-[var(--text-secondary)] mb-6">
        Join thousands of students getting instant answers
      </p>

      {/* Role picker */}
      <div className="mb-5">
        <label className="text-sm font-medium text-[var(--text-primary)] mb-2 block">I am a</label>
        <div className="grid grid-cols-2 gap-2" role="radiogroup">
          {([
            { value: 'student', label: 'Student', icon: GraduationCap },
            { value: 'admin', label: 'Admin / Faculty', icon: ShieldCheck },
          ] as { value: UserRole; label: string; icon: typeof GraduationCap }[]).map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setValue('role', value)}
              className={cn(
                'flex items-center gap-2.5 rounded-xl border p-3 transition-all duration-150',
                selectedRole === value
                  ? 'border-[var(--text-primary)] bg-[var(--bg-subtle)] ring-1 ring-[var(--text-primary)] shadow-sm'
                  : 'border-[var(--border-color)] hover:border-neutral-400 dark:hover:border-neutral-600 hover:bg-[var(--bg-muted)] opacity-80 hover:opacity-100',
              )}
            >
              <Icon className={cn('h-4 w-4', selectedRole === value ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]')} />
              <span className={cn('text-sm font-medium text-[var(--text-primary)]')}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Input
          id="signup-name"
          label="Full name"
          placeholder="Aryan Mehta"
          autoComplete="name"
          leftIcon={<User className="h-4 w-4" />}
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          id="signup-email"
          type="email"
          label="Email address"
          placeholder="you@university.edu"
          autoComplete="email"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          id="signup-password"
          type={showPw ? 'text' : 'password'}
          label="Password"
          placeholder="Create a strong password"
          autoComplete="new-password"
          leftIcon={<Lock className="h-4 w-4" />}
          rightIcon={
            <button type="button" onClick={() => setShowPw((p) => !p)} tabIndex={-1} aria-label="Toggle password">
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          id="signup-confirm-password"
          type={showPw ? 'text' : 'password'}
          label="Confirm password"
          placeholder="Re-enter password"
          autoComplete="new-password"
          leftIcon={<Lock className="h-4 w-4" />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <Button type="submit" variant="primary" size="lg" loading={isSubmitting} className="mt-2 w-full">
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className="font-semibold text-[var(--text-primary)] underline hover:opacity-80">
          Sign in
        </Link>
      </p>
    </div>
  );
}
