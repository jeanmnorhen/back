
'use client';

import type { ReactNode, Dispatch, SetStateAction } from 'react';
import { createContext, useState, useEffect, useCallback } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  type User
} from 'firebase/auth';
import { app } from '@/lib/firebase'; // Import your Firebase app instance
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  setError: Dispatch<SetStateAction<string | null>>;
  signup: (email: string, pass: string) => Promise<User | null>;
  login: (email: string, pass: string) => Promise<User | null>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const tAuth = useTranslations('Auth');

  const authInstance = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authInstance, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    }, (authError) => {
      console.error("AuthProvider onAuthStateChanged Error:", authError);
      setError(authError.message);
      setLoading(false);
      toast({
        title: tAuth('loginError'), // Generic error, can be more specific
        description: authError.message,
        variant: 'destructive',
      });
    });
    return () => unsubscribe();
  }, [authInstance, toast, tAuth]);

  const signup = useCallback(async (email: string, pass: string): Promise<User | null> => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(authInstance, email, pass);
      setUser(userCredential.user);
      toast({ title: tAuth('signupSuccess'), variant: 'default' });
      return userCredential.user;
    } catch (e: any) {
      console.error("Signup Error:", e);
      setError(e.message);
      toast({ title: tAuth('signupError'), description: e.message, variant: 'destructive' });
      return null;
    } finally {
      setLoading(false);
    }
  }, [authInstance, toast, tAuth]);

  const login = useCallback(async (email: string, pass: string): Promise<User | null> => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(authInstance, email, pass);
      setUser(userCredential.user);
      toast({ title: tAuth('loginSuccess'), variant: 'default' });
      return userCredential.user;
    } catch (e: any) {
      console.error("Login Error:", e);
      setError(e.message);
      toast({ title: tAuth('loginError'), description: e.message, variant: 'destructive' });
      return null;
    } finally {
      setLoading(false);
    }
  }, [authInstance, toast, tAuth]);

  const logout = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await signOut(authInstance);
      setUser(null);
      toast({ title: tAuth('logoutSuccess'), variant: 'default' });
    } catch (e: any) {
      console.error("Logout Error:", e);
      setError(e.message);
      toast({ title: tAuth('logoutButton'), description: e.message, variant: 'destructive' }); // Assuming logoutButton can be used as a generic title for logout errors
    } finally {
      setLoading(false);
    }
  }, [authInstance, toast, tAuth]);

  const contextValue: AuthContextType = {
    user,
    loading,
    error,
    setError,
    signup,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
