import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, ApiError } from '../lib/api';
import type { Me } from '../lib/types';

interface AuthValue {
  me: Me | null;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      const data = await api.get<Me>('/api/me');
      setMe(data);
      setError('');
    } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
        setMe(null);
        setError(e.status === 403 ? e.message : '');
      } else {
        setError(e instanceof Error ? e.message : 'Unexpected error.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onUnauthorized = () => {
      setMe(null);
      setLoading(false);
    };
    window.addEventListener('bindery:unauthorized', onUnauthorized);
    return () => window.removeEventListener('bindery:unauthorized', onUnauthorized);
  }, [refresh]);

  const logout = useCallback(async () => {
    try {
      await api.post('/api/logout');
    } finally {
      setMe(null);
    }
  }, []);

  const value = useMemo(() => ({ me, loading, error, refresh, logout }), [me, loading, error, refresh, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
