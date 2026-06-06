import { useEffect, useRef } from 'react';
import { useAuthStore }              from '@/features/auth/store';
import { pullState, pushState }      from '@/shared/sync/personal-sync';

export interface UseStoreSyncOptions {
  feature:          string;
  getState:         () => unknown;
  setState:         (s: unknown) => void;
  subscribe:        (cb: () => void) => () => void;
  currentVersion:   number;
  migrate:          (state: unknown, fromVersion: number) => unknown;
  getDefault:       () => unknown;
  isEmpty:          (state: unknown) => boolean;
  onFirstPullDone?: () => void;
}

export function useStoreSync({
  feature,
  getState,
  setState,
  subscribe,
  currentVersion,
  migrate,
  getDefault,
  isEmpty,
  onFirstPullDone,
}: UseStoreSyncOptions): void {
  const isApplyingRemote = useRef(false);
  const debounceTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unsubRef         = useRef<(() => void) | null>(null);
  const firstPullFired   = useRef(false);
  const backupDoneRef    = useRef(false);

  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const userId     = useAuthStore((s) => s.user?.id ?? null);

  // Intencional: subscribe/getState/setState/feature/migrate/getDefault/isEmpty são
  // estáveis por contrato (refs Zustand + strings + fns de módulo). Não incluir como
  // deps evita re-hidratação desnecessária quando stores não-auth mudam.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!isLoggedIn || !userId) {
      firstPullFired.current = false;
      backupDoneRef.current  = false;
      return;
    }

    let active = true;

    const fireFirstPullDone = () => {
      if (firstPullFired.current) return;
      firstPullFired.current = true;
      onFirstPullDone?.();
    };

    async function hydrate() {
      try {
        const remote = await pullState(feature, userId as string);
        if (!active) return;

        if (remote !== null) {
          // Nuvem tem dado → migrate-on-pull → backup one-time → setState atômico
          const fromVersion = (remote.data as Record<string, unknown>)?._version as number
            ?? remote.version
            ?? 0;
          const migrated = migrate(remote.data, fromVersion);

          if (!backupDoneRef.current) {
            backupDoneRef.current = true;
            try {
              localStorage.setItem(
                `vidaflor:backup:${feature}`,
                JSON.stringify(getState())
              );
            } catch { /* storage cheio ou indisponível */ }
          }

          isApplyingRemote.current = true;
          setState({ ...(migrated as object), _version: currentVersion, _hydrated: true });
          setTimeout(() => { isApplyingRemote.current = false; }, 0);
        } else {
          // Nuvem vazia
          const local = getState();
          if (!isEmpty(local)) {
            // Local tem dado → sobe como seed (nunca apaga dado local)
            void pushState(
              feature,
              userId as string,
              local,
              (local as Record<string, unknown>)._version as number ?? currentVersion
            );
          } else {
            // Local e nuvem vazios → usuário novo → defaults
            isApplyingRemote.current = true;
            setState({ ...(getDefault() as object), _hydrated: true });
            setTimeout(() => { isApplyingRemote.current = false; }, 0);
          }
        }
      } finally {
        if (active) fireFirstPullDone();
      }
    }

    hydrate().then(() => {
      if (!active) return;
      unsubRef.current = subscribe(() => {
        if (isApplyingRemote.current) return;

        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
          if (!active) return;
          const s = getState();
          pushState(
            feature,
            userId as string,
            s,
            (s as Record<string, unknown>)._version as number ?? currentVersion
          );
        }, 1500);
      });
    });

    return () => {
      active = false;
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      if (unsubRef.current)      unsubRef.current();
    };
  }, [isLoggedIn, userId]); // eslint-disable-line react-hooks/exhaustive-deps
}
