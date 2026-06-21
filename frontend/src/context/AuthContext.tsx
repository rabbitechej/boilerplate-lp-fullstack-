import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { adminApi } from '../api/admin';
import { ApiError } from '../api/client';
import type { AdminDto } from '../api/types';

type AuthState = {
  admin: AdminDto | null;
  accessToken: string | null;
  loading: boolean;
};

type AuthContextValue = AuthState & {
  login(email: string, password: string): Promise<void>;
  logout(): Promise<void>;
  ensureFreshToken(): Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ admin: null, accessToken: null, loading: false });

  const login = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const { accessToken, admin } = await adminApi.login(email, password);
      setState({ admin, accessToken, loading: false });
    } catch (error) {
      setState({ admin: null, accessToken: null, loading: false });
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    await adminApi.logout().catch(() => undefined);
    setState({ admin: null, accessToken: null, loading: false });
  }, []);

  const ensureFreshToken = useCallback(async (): Promise<string | null> => {
    try {
      const { accessToken } = await adminApi.refresh();
      setState((prev) => ({ ...prev, accessToken }));
      return accessToken;
    } catch (error) {
      if (error instanceof ApiError) {
        setState({ admin: null, accessToken: null, loading: false });
      }
      return null;
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, login, logout, ensureFreshToken }),
    [state, login, logout, ensureFreshToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return context;
}
