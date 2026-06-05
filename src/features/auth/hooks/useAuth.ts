import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAuthStore } from '@/features/auth/store';
import * as api from '@/features/auth/api/supabase';

export function useAuth() {
  const user       = useAuthStore(useShallow((s) => s.user));
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const loading    = useAuthStore((s) => s.loading);
  const error      = useAuthStore((s) => s.error);
  const { hydrateFromSession, clearUser, setLoading, setError } = useAuthStore.getState();

  useEffect(() => {
    const unsubscribe = api.onAuthChange((session) => {
      if (session) {
        hydrateFromSession(session);
      } else {
        clearUser();
      }
    });
    return unsubscribe;
  }, []);

  async function signIn(email: string, senha: string): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const result = await api.signIn(email, senha);
      if ('error' in result) {
        setError(result.error);
      } else {
        hydrateFromSession(result.session);
      }
    } finally {
      setLoading(false);
    }
  }

  async function signOut(): Promise<void> {
    setLoading(true);
    try {
      await api.signOut();
      clearUser();
    } finally {
      setLoading(false);
    }
  }

  return { user, isLoggedIn, loading, error, signIn, signOut };
}
