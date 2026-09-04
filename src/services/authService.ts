import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { LoginCredentials, RegisterCredentials, User } from '../types/auth.types';

// Helper to convert Firebase User into our application's User model
export const formatUser = (firebaseUser: FirebaseUser): User => ({
  id: firebaseUser.uid,
  name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
  email: firebaseUser.email || '',
  createdAt: firebaseUser.metadata.creationTime,
});

// Human-friendly error translation from Firebase error codes
export const getFriendlyErrorMessage = (error: any): string => {
  switch (error?.code) {
    case 'auth/email-already-in-use':
      return 'This email address is already registered.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/too-many-requests':
      return 'Access temporarily disabled due to many failed attempts. Try again later.';
    default:
      return error?.message || 'An error occurred during authentication.';
  }
};

export const authService = {
  async register({ name, email, password }: RegisterCredentials): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (name?.trim()) {
        await updateProfile(userCredential.user, { displayName: name.trim() });
      }
      return formatUser({ ...userCredential.user, displayName: name.trim() });
    } catch (error: any) {
      throw new Error(getFriendlyErrorMessage(error));
    }
  },

  async login({ email, password }: LoginCredentials): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      return formatUser(userCredential.user);
    } catch (error: any) {
      throw new Error(getFriendlyErrorMessage(error));
    }
  },

  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(getFriendlyErrorMessage(error));
    }
  },
};

