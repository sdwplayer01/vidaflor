import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuthStore }      from '@/features/auth/store';
import { useStoreSync }      from '@/shared/sync/use-store-sync';
import { useSyncReady }      from '@/shared/sync/sync-ready-store';
import { useSaudeStore }     from '@/features/saude/store';
import { useEspiritualStore } from '@/features/espiritual/store';
import { useConfigStore }    from '@/features/config/store';
import { SAUDE_VERSION }     from '@/features/saude/migrations';
import { ESPIRITUAL_VERSION } from '@/features/espiritual/migrations';
import { PROFILE_COLOR_DEFAULT } from '@/shared/constants/colors';
import { genId }             from '@/shared/utils/id';
import { today }             from '@/shared/utils/date';
import type { AuthUser }     from '@/features/auth/types';
import type { SaudeState }   from '@/features/saude/types';

const TOTAL_FEATURES = 3;

// Estado de saúde populado com perfil real — nunca usa activeProfileId: '' ou
// profiles: []. activeProfileId sempre aponta para um perfil existente.
function defaultSaudeParaUsuario(user: AuthUser): SaudeState {
  const id = genId('prf');
  return {
    activeProfileId: id,
    profiles: [{
      id,
      name:       user.name,
      avatar:     '🌸',
      type:       'adult_f',
      color:      PROFILE_COLOR_DEFAULT,
      water:      { goalMl: 2000, logMl: {} },
      meds:       [],
      notes:      {},
      moodLog:    {},
      sleepLog:   {},
      stepsLog:   {},
      metaPassos: 8000,
      createdAt:  today(),
    }],
    _version:  SAUDE_VERSION,
    _hydrated: true,
  };
}

// Quando Supabase não tem dado (usuário novo ou primeiro login),
// preserva o estado local se houver — evita apagar dados offline.
const getEspiritualFallback = () => {
  const local = useEspiritualStore.getState();
  const temDados =
    local.oracoes.length > 0 ||
    local.leituras.length > 0 ||
    Object.keys(local.gratidao).length > 0;
  if (temDados) return { ...local, _hydrated: true };
  return { gratidao: {}, oracoes: [], leituras: [], _version: ESPIRITUAL_VERSION, _hydrated: true };
};

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
    // user está garantido quando useStoreSync dispara (só roda com isLoggedIn && userId)
    getEmptyState:   () => defaultSaudeParaUsuario(useAuthStore.getState().user!),
    onFirstPullDone: handleDone,
  });

  useStoreSync({
    feature:         'espiritual',
    getState:        () => useEspiritualStore.getState(),
    setState:        (d) => useEspiritualStore.setState(d as Parameters<typeof useEspiritualStore.setState>[0]),
    subscribe:       (cb) => useEspiritualStore.subscribe(cb),
    getEmptyState:   getEspiritualFallback,
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
