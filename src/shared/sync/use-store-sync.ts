import { useEffect, useRef } from 'react';
import { useAuthStore }      from '@/features/auth/store';
import { pullPersonal, pushPersonal } from '@/shared/sync/personal-sync';
import type { PersonalFeature }       from '@/shared/sync/personal-sync';

export interface UseStoreSyncOptions {
  feature:        PersonalFeature;
  getState:       () => unknown;
  setState:       (s: unknown) => void;
  subscribe:      (cb: () => void) => () => void;
  getEmptyState?: () => unknown;
}

export function useStoreSync({
  feature,
  getState,
  setState,
  subscribe,
  getEmptyState,
}: UseStoreSyncOptions): void {
  const isApplyingRemote = useRef(false);
  const debounceTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unsubRef         = useRef<(() => void) | null>(null);

  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const userId     = useAuthStore((s) => s.user?.id ?? null);

  // Intencional: subscribe/getState/setState/feature são estáveis por contrato do caller
  // (referências ao store Zustand e string literal). Não incluir como deps evita
  // re-hidratação a cada re-render do SyncBoot quando stores não-auth mudam.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!isLoggedIn || !userId) return;

    let active = true;

    async function hydrate() {
      const remote = await pullPersonal(feature, userId as string);
      if (!active) return;

      isApplyingRemote.current = true;
      if (remote !== null) {
        setState(remote);
      } else if (getEmptyState) {
        setState(getEmptyState());
      }
      setTimeout(() => { isApplyingRemote.current = false; }, 0);
    }

    hydrate();

    unsubRef.current = subscribe(() => {
      if (isApplyingRemote.current) return;

      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        if (!active) return;
        pushPersonal(feature, userId as string, getState());
      }, 1500);
    });

    return () => {
      active = false;
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      if (unsubRef.current)      unsubRef.current();
    };
  }, [isLoggedIn, userId]); // eslint-disable-line react-hooks/exhaustive-deps
}
