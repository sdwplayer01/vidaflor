// src/features/auth/types.ts
// Fase 5 — placeholder. Integração Supabase na próxima sessão de design.
import type { ID, ISODate } from '@/shared/types/common';
import type { HouseholdRole } from '@/shared/types/household';

export interface AuthUser {
  id:          ID;
  email:       string;
  name:        string;
  avatar?:     string;
  householdId: ID | null;
  role:        HouseholdRole | null;
  createdAt:   ISODate;
}

export interface AuthState {
  user:       AuthUser | null;
  isLoggedIn: boolean;
  _hydrated:  boolean;
}

export interface AuthActions {
  // Fase 5: substituir por Supabase auth
  setUser:   (user: AuthUser) => void;
  clearUser: () => void;
}
