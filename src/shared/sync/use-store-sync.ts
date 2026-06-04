import { useEffect, useRef } from 'react';
import { useAuthStore }      from '@/features/auth/store';
import { pullPersonal, pushPersonal } from '@/shared/sync/personal-sync';
import type { PersonalFeature }       from '@/shared/sync/personal-sync';

export interface UseStoreSyncOptions {
  feature:   PersonalFeature;
  getState:  () => unknown;
  setState:  (s: unknown) => void;
  subscribe: (cb: () => void) => () => void;
}

export function useStoreSync({
  feature,
  getState,
  setState,
  subscribe,
}: UseStoreSyncOptions): void {
  const isApplyingRemote = useRef(false);
  const debounceTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unsubRef         = useRef<(() => void) | null>(null);

  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const userId     = useAuthStore((s) => s.user?.id ?? null);

  useEffect(() => {
    if (!isLoggedIn || !userId) return;

    let active = true;

    async function hydrate() {
      const remote = await pullPersonal(feature, userId as string);
      if (!active || remote === null) return;

      isApplyingRemote.current = true;
      setState(remote);
      // Permite o subscriber ignorar este ciclo antes de resetar a flag
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
  }, [isLoggedIn, userId]);
}
