import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut, type User } from 'firebase/auth';
import { auth } from '@/configs/firebase';

export interface SessionUser {
  sub: string;
  name: string;
  email: string;
  Role?: string;
  Claims?: string | string[];
}

export interface Session {
  token: string;
  user: SessionUser;
}

interface AuthContextValue {
  session: Session | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function buildSession(firebaseUser: User): Promise<Session> {
  const token = await firebaseUser.getIdToken();
  const tokenResult = await firebaseUser.getIdTokenResult();
  const claims = tokenResult.claims;

  const rawClaims = (claims.claims ?? claims.permissions) as string | string[] | undefined;
  const role = typeof claims.role === 'string' ? claims.role : undefined;

  return {
    token,
    user: {
      sub: firebaseUser.uid,
      name: firebaseUser.displayName ?? firebaseUser.email?.split('@')[0] ?? 'Usuário',
      email: firebaseUser.email ?? '',
      Role: role,
      Claims: rawClaims,
    },
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const next = await buildSession(firebaseUser);
          setSession(next);
        } catch (error) {
          console.error('[AuthProvider] Falha ao montar sessão:', error);
          await firebaseSignOut(auth);
          setSession(null);
        }
      } else {
        setSession(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  async function logout() {
    await firebaseSignOut(auth);
    setSession(null);
  }

  return (
    <AuthContext.Provider value={{ session, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
