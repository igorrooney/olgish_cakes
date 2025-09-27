'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/lib/auth-context';
import { copy } from '@/lib/copy';
import { Eye, EyeOff, Mail, Lock, Chrome } from 'lucide-react';

const signInSchema = z.object({
  email: z.string().email('Please enter valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    setError(null);

    const result = await signIn(data.email, data.password);
    
    if (result.success) {
      router.push('/account');
    } else {
      setError(result.error || 'Something went wrong');
    }
    
    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    const result = await signInWithGoogle();
    
    if (!result.success) {
      setError(result.error || 'Something went wrong with Google sign in');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      <div className="form-control">
        <label className="label" htmlFor="email">
          <span className="label-text">Email address</span>
        </label>
        <div className="relative">
          <input
            {...register('email')}
            type="email"
            id="email"
            className="input input-bordered w-full pl-10"
            placeholder="your@email.com"
            disabled={isLoading}
          />
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/50" />
        </div>
        {errors.email && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.email.message}</span>
          </label>
        )}
      </div>

      <div className="form-control">
        <label className="label" htmlFor="password">
          <span className="label-text">Password</span>
        </label>
        <div className="relative">
          <input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            id="password"
            className="input input-bordered w-full pl-10 pr-10"
            placeholder="Your password"
            disabled={isLoading}
          />
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/50" />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-base-content/50" />
            ) : (
              <Eye className="h-4 w-4 text-base-content/50" />
            )}
          </button>
        </div>
        {errors.password && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.password.message}</span>
          </label>
        )}
      </div>

      <div className="form-control">
        <label className="label">
          <a href="/auth/forgot" className="label-text-alt link link-primary">
            Forgot password?
          </a>
        </label>
      </div>

      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="loading loading-spinner loading-sm"></span>
        ) : (
          'Sign in'
        )}
      </button>

      <div className="divider">Or continue with</div>

      <button
        type="button"
        className="btn btn-outline w-full"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
      >
        <Chrome className="h-5 w-5" />
        Continue with Google
      </button>
    </form>
  );
}

