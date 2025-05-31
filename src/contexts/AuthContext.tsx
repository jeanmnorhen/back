
'use client';

import type { ReactNode, Dispatch, SetStateAction } from 'react';
import { createContext, useState, useEffect, useCallback } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  type User,
  type Auth // Import Auth type
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

  let authInstance: Auth;
  try {
    authInstance = getAuth(app);
    console.log("[AuthContext] Instância do Firebase Auth obtida com sucesso.");
  } catch (e: any) {
    console.error("[AuthContext] ERRO CRÍTICO ao chamar getAuth(app):", e.message, e.stack);
    console.error("[AuthContext] Detalhes da configuração do app Firebase usado:", app.options);
    // Se getAuth falhar, não podemos prosseguir com a autenticação.
    // Lançar um erro aqui fará com que a Vercel mostre o erro.
    throw new Error(
        `[AuthContext] Falha crítica ao obter instância do Firebase Auth (getAuth). Verifique a configuração do Firebase, especialmente AUTH_DOMAIN. Erro original: ${e.message}`
    );
  }

  useEffect(() => {
    // Só prosseguir se authInstance foi obtido com sucesso
    if (!authInstance) {
        console.error("[AuthContext] authInstance é indefinido no useEffect. A inicialização do Auth pode ter falhado.");
        setLoading(false);
        setError("Falha na inicialização do serviço de autenticação.");
        return;
    }

    const unsubscribe = onAuthStateChanged(authInstance, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    }, (authError) => {
      console.error("[AuthContext] Erro no onAuthStateChanged:", authError);
      setError(authError.message);
      setLoading(false);
      // Não usar toast aqui, pois pode ser server-side no início. O erro será no estado.
    });
    return () => unsubscribe();
  }, [authInstance]); // authInstance é a dependência correta

  const signup = useCallback(async (email: string, pass: string): Promise<User | null> => {
    if (!authInstance) {
        setError("Serviço de autenticação não inicializado.");
        return null;
    }
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(authInstance, email, pass);
      setUser(userCredential.user);
      toast({ title: tAuth('signupSuccess'), variant: 'default' });
      return userCredential.user;
    } catch (e: any) {
      console.error("[AuthContext] Erro no Signup:", e);
      setError(e.message);
      toast({ title: tAuth('signupError'), description: e.message, variant: 'destructive' });
      return null;
    } finally {
      setLoading(false);
    }
  }, [authInstance, toast, tAuth]);

  const login = useCallback(async (email: string, pass: string): Promise<User | null> => {
    if (!authInstance) {
        setError("Serviço de autenticação não inicializado.");
        return null;
    }
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(authInstance, email, pass);
      setUser(userCredential.user);
      toast({ title: tAuth('loginSuccess'), variant: 'default' });
      return userCredential.user;
    } catch (e: any) {
      console.error("[AuthContext] Erro no Login:", e);
      setError(e.message);
      toast({ title: tAuth('loginError'), description: e.message, variant: 'destructive' });
      return null;
    } finally {
      setLoading(false);
    }
  }, [authInstance, toast, tAuth]);

  const logout = useCallback(async (): Promise<void> => {
    if (!authInstance) {
        setError("Serviço de autenticação não inicializado.");
        return;
    }
    setLoading(true);
    setError(null);
    try {
      await signOut(authInstance);
      setUser(null);
      toast({ title: tAuth('logoutSuccess'), variant: 'default' });
    } catch (e: any)
{
      console.error("[AuthContext] Erro no Logout:", e);
      setError(e.message);
      toast({ title: tAuth('logoutButton'), description: e.message, variant: 'destructive' });
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

    