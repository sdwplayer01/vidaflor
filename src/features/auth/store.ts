// src/features/auth/store.ts
// Fase 5 placeholder — multi-user via Supabase (build após validação 1-4)
// Por enquanto: estado local sem sync, usuária única "voce"
import { create } from 'zustand';
import { persistVidaFlor } from '@/shared/storage/persist-middleware';
import { STORAGE_KEYS } from '@/shared/storage/keys';
import type { AuthState, AuthActions } from './types';

export const useAuthStore = create<AuthState & AuthActions>()(
  persistVidaFlor(
    (set) => ({
      user:       null,
      isLoggedIn: false,
      _hydrated:  false,

      setUser:   (user) => set({ user, isLoggedIn: true }),
      clearUser: ()     => set({ user: null, isLoggedIn: false }),
    }),
    { name: STORAGE_KEYS.auth, version: 0 }
  )
);

// Helper: MemberId 'voce' resolve para o user atual ou placeholder
export function getSelfId(userId: string | null): string {
  return userId ?? 'voce';
}
