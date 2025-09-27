import { Metadata } from 'next';
import { AuthProvider } from '@/lib/auth-context';
import AccountNavigation from './account-navigation';

export const metadata: Metadata = {
  title: 'My Account | Olgish Cakes',
  description: 'Manage your account, view orders, and update your profile at Olgish Cakes.',
  robots: 'noindex, nofollow',
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-base-200">
        <div className="container mx-auto px-4 py-8">
          <div className="breadcrumbs text-sm mb-6">
            <ul>
              <li><a href="/" className="link link-hover">Home</a></li>
              <li>My Account</li>
            </ul>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/4">
              <AccountNavigation />
            </div>
            
            <div className="lg:w-3/4">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}

