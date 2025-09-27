'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { account, databases, COLLECTIONS, DATABASE_ID } from './appwrite';
import { Models } from 'appwrite';
import { AuthState, UserPrivate, UserRole } from '@/types/auth';
import { copy } from './copy';

const AuthContext = createContext<{
  authState: AuthState;
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (password: string, oldPassword?: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: { name?: string; phone?: string }) => Promise<{ success: boolean; error?: string }>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
} | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    userPrivate: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Initialize auth state
  useEffect(() => {
    initializeAuth();
  }, []);

  async function initializeAuth() {
    try {
      const user = await account.get();
      if (user) {
        await loadUserPrivate(user.$id);
      }
    } catch (error) {
      // User not authenticated
      console.log('No authenticated user');
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }

  async function loadUserPrivate(userId: string) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS_PRIVATE,
        [`userId=${userId}`]
      );
      
      if (response.documents.length > 0) {
        const userPrivate = response.documents[0] as UserPrivate;
        setAuthState(prev => ({
          ...prev,
          userPrivate,
          isAuthenticated: true,
        }));
      }
    } catch (error) {
      console.error('Error loading user private data:', error);
    }
  }

  async function signUp(email: string, password: string, name: string) {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // Create Appwrite user
      await account.create('unique()', email, password, name);
      
      // Send verification email
      await account.createVerification(`${window.location.origin}/auth/verify`);
      
      return { success: true };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { 
        success: false, 
        error: error.message || copy.error.serverError 
      };
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }

  async function signIn(email: string, password: string) {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      await account.createEmailSession(email, password);
      const user = await account.get();
      
      await loadUserPrivate(user.$id);
      
      return { success: true };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { 
        success: false, 
        error: error.message || copy.error.serverError 
      };
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }

  async function signInWithGoogle() {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // Redirect to Google OAuth
      account.createOAuth2Session('google', `${window.location.origin}/auth/callback`, `${window.location.origin}/auth/sign-in`);
      
      return { success: true };
    } catch (error: any) {
      console.error('Google sign in error:', error);
      return { 
        success: false, 
        error: error.message || copy.error.serverError 
      };
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }

  async function signOut() {
    try {
      await account.deleteSession('current');
      setAuthState({
        user: null,
        userPrivate: null,
        isLoading: false,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  async function resetPassword(email: string) {
    try {
      await account.createRecovery(email, `${window.location.origin}/auth/reset-password`);
      return { success: true };
    } catch (error: any) {
      console.error('Reset password error:', error);
      return { 
        success: false, 
        error: error.message || copy.error.serverError 
      };
    }
  }

  async function updatePassword(password: string, oldPassword?: string) {
    try {
      if (oldPassword) {
        await account.updatePassword(password, oldPassword);
      } else {
        // For password reset flow
        await account.updatePassword(password);
      }
      return { success: true };
    } catch (error: any) {
      console.error('Update password error:', error);
      return { 
        success: false, 
        error: error.message || copy.error.serverError 
      };
    }
  }

  async function updateProfile(data: { name?: string; phone?: string }) {
    try {
      const user = authState.user;
      if (!user) throw new Error('No authenticated user');

      // Update Appwrite user name if provided
      if (data.name) {
        await account.updateName(data.name);
      }

      // Update private profile
      const existingProfile = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS_PRIVATE,
        [`userId=${user.$id}`]
      );

      if (existingProfile.documents.length > 0) {
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.USERS_PRIVATE,
          existingProfile.documents[0].$id,
          data
        );
      } else {
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.USERS_PRIVATE,
          'unique()',
          {
            userId: user.$id,
            role: 'CUSTOMER',
            ...data,
          }
        );
      }

      // Reload user private data
      await loadUserPrivate(user.$id);
      
      return { success: true };
    } catch (error: any) {
      console.error('Update profile error:', error);
      return { 
        success: false, 
        error: error.message || copy.error.serverError 
      };
    }
  }

  async function deleteAccount() {
    try {
      const user = authState.user;
      if (!user) throw new Error('No authenticated user');

      // Mark user as deleted in private profile
      const existingProfile = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS_PRIVATE,
        [`userId=${user.$id}`]
      );

      if (existingProfile.documents.length > 0) {
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.USERS_PRIVATE,
          existingProfile.documents[0].$id,
          { deletedAt: new Date().toISOString() }
        );
      }

      // Sign out
      await signOut();
      
      return { success: true };
    } catch (error: any) {
      console.error('Delete account error:', error);
      return { 
        success: false, 
        error: error.message || copy.error.serverError 
      };
    }
  }

  return (
    <AuthContext.Provider
      value={{
        authState,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        resetPassword,
        updatePassword,
        updateProfile,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

