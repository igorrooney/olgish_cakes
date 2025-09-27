'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Phone, Lock, Trash2, AlertTriangle } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
});

const passwordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(10, 'New password must be at least 10 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { authState, updateProfile, updatePassword, deleteAccount } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'danger'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: authState.user?.name || '',
      phone: authState.userPrivate?.phone || '',
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmitProfile = async (data: ProfileFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await updateProfile(data);
      
      if (result.success) {
        setSuccess('Profile updated successfully!');
        profileForm.reset(data);
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitPassword = async (data: PasswordFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await updatePassword(data.newPassword, data.oldPassword);
      
      if (result.success) {
        setSuccess('Password updated successfully!');
        passwordForm.reset();
      } else {
        setError(result.error || 'Failed to update password');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await deleteAccount();
      
      if (result.success) {
        // Account will be deleted and user will be signed out
        window.location.href = '/';
      } else {
        setError(result.error || 'Failed to delete account');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  if (!authState.isAuthenticated) {
    return (
      <div className="text-center">
        <p>Please sign in to manage your profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">My Profile</h1>
        <p className="text-base-content/70">
          Manage your personal information and account settings.
        </p>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-bordered">
        <button
          className={`tab ${activeTab === 'profile' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <User className="h-4 w-4 mr-2" />
          Profile
        </button>
        <button
          className={`tab ${activeTab === 'password' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          <Lock className="h-4 w-4 mr-2" />
          Password
        </button>
        <button
          className={`tab ${activeTab === 'danger' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('danger')}
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          Danger Zone
        </button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span>{success}</span>
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-4">
            <div className="form-control">
              <label className="label" htmlFor="name">
                <span className="label-text">Full Name</span>
              </label>
              <div className="relative">
                <input
                  {...profileForm.register('name')}
                  type="text"
                  id="name"
                  className="input input-bordered w-full pl-10"
                  placeholder="Your full name"
                  disabled={isLoading}
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/50" />
              </div>
              {profileForm.formState.errors.name && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {profileForm.formState.errors.name.message}
                  </span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label" htmlFor="phone">
                <span className="label-text">Phone Number (Optional)</span>
              </label>
              <div className="relative">
                <input
                  {...profileForm.register('phone')}
                  type="tel"
                  id="phone"
                  className="input input-bordered w-full pl-10"
                  placeholder="Your phone number"
                  disabled={isLoading}
                />
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/50" />
              </div>
              {profileForm.formState.errors.phone && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {profileForm.formState.errors.phone.message}
                  </span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Email Address</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  className="input input-bordered w-full pl-10 bg-base-200"
                  value={authState.user?.email || ''}
                  disabled
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/50" />
              </div>
              <label className="label">
                <span className="label-text-alt text-base-content/70">
                  Email cannot be changed. Contact support if needed.
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                'Update Profile'
              )}
            </button>
          </form>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="space-y-6">
          <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-4">
            <div className="form-control">
              <label className="label" htmlFor="oldPassword">
                <span className="label-text">Current Password</span>
              </label>
              <div className="relative">
                <input
                  {...passwordForm.register('oldPassword')}
                  type="password"
                  id="oldPassword"
                  className="input input-bordered w-full pl-10"
                  placeholder="Your current password"
                  disabled={isLoading}
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/50" />
              </div>
              {passwordForm.formState.errors.oldPassword && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {passwordForm.formState.errors.oldPassword.message}
                  </span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label" htmlFor="newPassword">
                <span className="label-text">New Password</span>
              </label>
              <div className="relative">
                <input
                  {...passwordForm.register('newPassword')}
                  type="password"
                  id="newPassword"
                  className="input input-bordered w-full pl-10"
                  placeholder="Choose new password"
                  disabled={isLoading}
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/50" />
              </div>
              {passwordForm.formState.errors.newPassword && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {passwordForm.formState.errors.newPassword.message}
                  </span>
                </label>
              )}
              <label className="label">
                <span className="label-text-alt text-base-content/70">
                  Use long password, not easy guess. At least 10 characters, please.
                </span>
              </label>
            </div>

            <div className="form-control">
              <label className="label" htmlFor="confirmPassword">
                <span className="label-text">Confirm New Password</span>
              </label>
              <div className="relative">
                <input
                  {...passwordForm.register('confirmPassword')}
                  type="password"
                  id="confirmPassword"
                  className="input input-bordered w-full pl-10"
                  placeholder="Type new password again"
                  disabled={isLoading}
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/50" />
              </div>
              {passwordForm.formState.errors.confirmPassword && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {passwordForm.formState.errors.confirmPassword.message}
                  </span>
                </label>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        </div>
      )}

      {/* Danger Zone Tab */}
      {activeTab === 'danger' && (
        <div className="space-y-6">
          <div className="alert alert-warning">
            <AlertTriangle className="h-6 w-6" />
            <div>
              <h3 className="font-bold">Warning!</h3>
              <div className="text-sm">
                These actions cannot be undone. Please be careful.
              </div>
            </div>
          </div>

          <div className="card bg-base-200">
            <div className="card-body">
              <h3 className="card-title text-error">Delete Account</h3>
              <p className="text-sm text-base-content/70 mb-4">
                Permanently delete your account and all associated data. 
                This action cannot be undone.
              </p>
              
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="btn btn-error"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="alert alert-error">
                    <span>Are you absolutely sure? This will delete your account permanently.</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDeleteAccount}
                      className="btn btn-error"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="loading loading-spinner loading-sm"></span>
                      ) : (
                        'Yes, Delete Account'
                      )}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="btn btn-outline"
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


