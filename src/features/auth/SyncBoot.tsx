import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuthStore }      from '@/features/auth/store';
import { useStoreSync }      from '@/shared/sync/use-store-sync';
import { useSyncReady }      from '@/shared/sync/sync-ready-store';
import { useSaudeStore }     from '@/features/saude/store';
import { useEspiritualStore } from '@/features/espiritual/store';
import { useConfigStore }    from '@/features/config/store';
import { SAUDE_VERSION }     from '@/features/saude/migrations';
import { ESPIRITUAL_VERSION } from '@/features/espiritual/migrations';

const TOTAL_FEATURES = 3;

const emptySaude = () => ({
  activeProfileId: '',
  profiles: [],
  _version: SAUDE_VERSION,
  _hydrated: true,
});

const emptyEspiritual = () => ({
  gratidao: {},
  oracoes: [],
  leituras: [],
  _version: ESPIRITUAL_VERSION,
  _hydrated: true,
});

export function SyncBoot() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const user       = useAuthStore((s) => s.user);

  const [doneCount, setDoneCount] = useState(0);
  const flippedRef                = useRef(false);

  const handleDone = useCallback(() => {
    setDoneCount((n) => n + 1);
  }, []);

  useEffect(() => {
    if (!isLoggedIn || !user) {
      flippedRef.current = false;
      setDoneCount(0);
      useSyncReady.getState().reset();
    }
  }, [isLoggedIn, user]);

  useEffect(() => {
    if (doneCount >= TOTAL_FEATURES && !flippedRef.current) {
      flippedRef.current = true;
      useSyncReady.getState().setReady(true);
    }
  }, [doneCount]);

  useStoreSync({
    feature:         'saude',
    getState:        () => useSaudeStore.getState(),
    setState:        (d) => useSaudeStore.setState(d as Parameters<typeof useSaudeStore.setState>[0]),
    subscribe:       (cb) => useSaudeStore.subscribe(cb),
    getEmptyState:   emptySaude,
    onFirstPullDone: handleDone,
  });

  useStoreSync({
    feature:         'espiritual',
    getState:        () => useEspiritualStore.getState(),
    setState:        (d) => useEspiritualStore.setState(d as Parameters<typeof useEspiritualStore.setState>[0]),
    subscribe:       (cb) => useEspiritualStore.subscribe(cb),
    getEmptyState:   emptyEspiritual,
    onFirstPullDone: handleDone,
  });

  useStoreSync({
    feature:         'config',
    getState:        () => useConfigStore.getState(),
    setState:        (d) => useConfigStore.setState(d as Parameters<typeof useConfigStore.setState>[0]),
    subscribe:       (cb) => useConfigStore.subscribe(cb),
    onFirstPullDone: handleDone,
  });

  return null;
}
