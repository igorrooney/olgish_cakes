import { Metadata } from 'next';
import SignInForm from './sign-in-form';

export const metadata: Metadata = {
  title: 'Sign In | Olgish Cakes',
  description: 'Sign in to your Olgish Cakes account to view orders and manage your profile.',
  robots: 'noindex, nofollow',
};

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">
            Welcome back
          </h1>
          <p className="mt-2 text-base-content/70">
            Sign in to your account, please
          </p>
        </div>
        
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <SignInForm />
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-base-content/70">
            Don't have account?{' '}
            <a href="/auth/sign-up" className="link link-primary">
              Sign up here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

