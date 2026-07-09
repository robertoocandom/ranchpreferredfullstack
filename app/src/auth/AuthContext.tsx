import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, getToken, setToken, type MeResponse } from '../api/client';

export interface UserProfile {
  name: string;
  email: string;
  picture?: string;
  provider: 'google' | 'demo';
}

interface AuthContextValue {
  user: UserProfile | null;
  googleClientId: string | null;
  authError: string | null;
  signInDemo: () => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'ranch-preferred:user';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
          prompt: () => void;
        };
      };
    };
  }
}

function profileFromContractor(contractor: MeResponse, provider: 'google' | 'demo', picture?: string): UserProfile {
  return { name: contractor.name, email: contractor.email, picture: contractor.picture ?? picture, provider };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (!getToken()) return null;
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as UserProfile) : null;
  });
  const [authError, setAuthError] = useState<string | null>(null);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || null;

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  useEffect(() => {
    if (!googleClientId || user) return;
    const handleGoogleCredential = async (idToken: string) => {
      try {
        const { token, contractor } = await api.authGoogle(idToken);
        setToken(token);
        setUser(profileFromContractor(contractor, 'google'));
        setAuthError(null);
      } catch {
        setAuthError('No se pudo verificar tu cuenta de Google. Intenta de nuevo.');
      }
    };
    const trySetup = () => {
      if (!window.google) return false;
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response) => void handleGoogleCredential(response.credential),
      });
      return true;
    };
    if (trySetup()) return;
    const interval = setInterval(() => {
      if (trySetup()) clearInterval(interval);
    }, 200);
    return () => clearInterval(interval);
  }, [googleClientId, user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      googleClientId,
      authError,
      signInDemo: async () => {
        try {
          const { token, contractor } = await api.authDemo();
          setToken(token);
          setUser(profileFromContractor(contractor, 'demo'));
          setAuthError(null);
        } catch {
          setAuthError('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
        }
      },
      signOut: () => {
        setToken(null);
        setUser(null);
      },
    }),
    [user, googleClientId, authError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
