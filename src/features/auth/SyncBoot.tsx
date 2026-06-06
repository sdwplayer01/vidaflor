import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuthStore }  from '@/features/auth/store';
import { useStoreSync }  from '@/shared/sync/use-store-sync';
import { useSyncReady }  from '@/shared/sync/sync-ready-store';
import { SYNC_MODULES }  from '@/shared/sync/registry';
import type { SyncModule } from '@/shared/sync/registry';

// Componente filho — cada módulo chama useStoreSync exatamente uma vez,
// mantendo o contrato de hooks constante por render de SyncItem.
function SyncItem({
  module,
  onFirstPullDone,
}: {
  module:          SyncModule;
  onFirstPullDone: () => void;
}) {
  useStoreSync({ ...module, onFirstPullDone });
  return null;
}

export function SyncBoot() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const userId     = useAuthStore((s) => s.user?.id ?? null);

  const [doneCount, setDoneCount] = useState(0);
  const flippedRef                = useRef(false);

  const handleDone = useCallback(() => {
    setDoneCount((n) => n + 1);
  }, []);

  useEffect(() => {
    if (!isLoggedIn || !userId) {
      flippedRef.current = false;
      setDoneCount(0);
      useSyncReady.getState().reset();
    }
  }, [isLoggedIn, userId]);

  useEffect(() => {
    if (doneCount >= SYNC_MODULES.length && !flippedRef.current) {
      flippedRef.current = true;
      useSyncReady.getState().setReady(true);
    }
  }, [doneCount]);

  return (
    <>
      {SYNC_MODULES.map((mod) => (
        <SyncItem key={mod.feature} module={mod} onFirstPullDone={handleDone} />
      ))}
    </>
  );
}
