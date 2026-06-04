import type { ID, ISODate } from '@/shared/types/common';
import type { HouseholdRole } from '@/shared/types/household';
import type { Session } from '@supabase/supabase-js';

export interface AuthUser {
  id:          ID;
  email:       string;
  name:        string;
  householdId: ID | null;
  role:        HouseholdRole | null;
  createdAt:   ISODate;
}

export interface AuthState {
  user:       AuthUser | null;
  isLoggedIn: boolean;
  _hydrated:  boolean;
  loading:    boolean;
  error:      string | null;
}

export interface AuthActions {
  setUser:            (user: AuthUser) => void;
  clearUser:          () => void;
  setError:           (error: string | null) => void;
  setLoading:         (loading: boolean) => void;
  hydrateFromSession: (session: Session) => void;
}
