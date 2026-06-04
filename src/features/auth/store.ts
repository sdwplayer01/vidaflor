import { create }           from 'zustand';
import { persistVidaFlor }  from '@/shared/storage/persist-middleware';
import { STORAGE_KEYS }     from '@/shared/storage/keys';
import type { Session }     from '@supabase/supabase-js';
import type { AuthState, AuthActions, AuthUser } from './types';

const AUTH_VERSION = 1;

type Store = AuthState & AuthActions;

function sessionToUser(session: Session): AuthUser {
  const { user } = session;
  const meta = user.user_metadata as Record<string, unknown>;
  const email = user.email ?? '';
  const name =
    typeof meta['name'] === 'string' && meta['name']
      ? meta['name']
      : email.split('@')[0] ?? 'Usuario';

  return {
    id:          user.id,
    email,
    name,
    householdId: null,
    role:        null,
    createdAt:   user.created_at,
  };
}

export const useAuthStore = create<Store>()(
  persistVidaFlor(
    (set) => ({
      user:       null,
      isLoggedIn: false,
      _hydrated:  false,
      loading:    false,
      error:      null,

      setUser: (user) => set({ user, isLoggedIn: true }),

      clearUser: () => set({ user: null, isLoggedIn: false, error: null }),

      setError: (error) => set({ error }),

      setLoading: (loading) => set({ loading }),

      hydrateFromSession: (session: Session) =>
        set({ user: sessionToUser(session), isLoggedIn: true }),
    }),
    {
      name:    STORAGE_KEYS.auth,
      version: AUTH_VERSION,
      // Persiste só o essencial; loading/error são efêmeros
      migrate: (_state, _v) => ({ user: null, isLoggedIn: false }),
    }
  )
);

export function getSelfId(userId: string | null): string {
  return userId ?? 'voce';
}
