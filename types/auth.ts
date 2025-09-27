import { Models } from 'appwrite';

// User roles
export type UserRole = 'CUSTOMER' | 'ADMIN' | 'STAFF';

// Appwrite User type
export type AppwriteUser = Models.User<Models.Preferences>;

// Private user profile stored in our database
export interface UserPrivate {
  userId: string; // Appwrite user $id
  name?: string;
  phone?: string;
  role: UserRole;
  deletedAt?: string;
}

// Address interface
export interface Address {
  $id?: string;
  userId: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  county?: string;
  postcode: string;
  country: string;
  isDefault: boolean;
}

// Authentication state
export interface AuthState {
  user: AppwriteUser | null;
  userPrivate: UserPrivate | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Auth form data
export interface SignUpData {
  email: string;
  password: string;
  name: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface ResetPasswordData {
  email: string;
}

export interface UpdatePasswordData {
  password: string;
  oldPassword?: string;
}

