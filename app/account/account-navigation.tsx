'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { 
  User, 
  ShoppingBag, 
  MapPin, 
  Settings, 
  LogOut,
  Home
} from 'lucide-react';

const navigationItems = [
  {
    id: 'overview',
    label: 'Overview',
    href: '/account',
    icon: Home,
  },
  {
    id: 'orders',
    label: 'My Orders',
    href: '/account/orders',
    icon: ShoppingBag,
  },
  {
    id: 'addresses',
    label: 'Addresses',
    href: '/account/addresses',
    icon: MapPin,
  },
  {
    id: 'profile',
    label: 'Profile',
    href: '/account/profile',
    icon: User,
  },
];

export default function AccountNavigation() {
  const { authState, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (authState.isLoading) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-center justify-center">
            <span className="loading loading-spinner loading-md"></span>
          </div>
        </div>
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body text-center">
          <p className="mb-4">Please sign in to access your account</p>
          <a href="/auth/sign-in" className="btn btn-primary">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex items-center gap-3 mb-6">
          <div className="avatar placeholder">
            <div className="bg-primary text-primary-content rounded-full w-12">
              <span className="text-xl">
                {authState.user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          </div>
          <div>
            <h2 className="font-bold">{authState.user?.name || 'User'}</h2>
            <p className="text-sm text-base-content/70">{authState.user?.email}</p>
          </div>
        </div>

        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <a
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-primary text-primary-content' 
                    : 'hover:bg-base-200'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        <div className="divider"></div>

        <button
          onClick={handleSignOut}
          className="btn btn-outline btn-error w-full"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

