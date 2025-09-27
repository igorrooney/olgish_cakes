'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/lib/auth-context';
import { copy } from '@/lib/copy';
import { Eye, EyeOff, Mail, Lock, User, Chrome } from 'lucide-react';

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter valid email address'),
  password: z.string().min(10, copy.password.rules),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const { signUp, signInWithGoogle } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    setError(null);

    const result = await signUp(data.email, data.password, data.name);
    
    if (result.success) {
      setSuccess(true);
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

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="alert alert-success">
          <span>{copy.verifyEmail.banner}</span>
        </div>
        <p className="text-sm text-base-content/70">
          Check your email and click the verification link. Then you can sign in.
        </p>
        <a href="/auth/sign-in" className="btn btn-primary">
          Go to sign in
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      <div className="form-control">
        <label className="label" htmlFor="name">
          <span className="label-text">Full name</span>
        </label>
        <div className="relative">
          <input
            {...register('name')}
            type="text"
            id="name"
            className="input input-bordered w-full pl-10"
            placeholder="Your full name"
            disabled={isLoading}
          />
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/50" />
        </div>
        {errors.name && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.name.message}</span>
          </label>
        )}
      </div>

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
            placeholder="Choose strong password"
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
        <label className="label">
          <span className="label-text-alt text-base-content/70">
            {copy.password.rules}
          </span>
        </label>
      </div>

      <div className="form-control">
        <label className="label" htmlFor="confirmPassword">
          <span className="label-text">Confirm password</span>
        </label>
        <div className="relative">
          <input
            {...register('confirmPassword')}
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            className="input input-bordered w-full pl-10 pr-10"
            placeholder="Type password again"
            disabled={isLoading}
          />
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/50" />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={isLoading}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4 text-base-content/50" />
            ) : (
              <Eye className="h-4 w-4 text-base-content/50" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.confirmPassword.message}</span>
          </label>
        )}
      </div>

      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="loading loading-spinner loading-sm"></span>
        ) : (
          'Create account'
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


