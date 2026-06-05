import { useAuthStore }      from '@/features/auth/store';
import { useStoreSync }      from '@/shared/sync/use-store-sync';
import { useSaudeStore }     from '@/features/saude/store';
import { useEspiritualStore } from '@/features/espiritual/store';
import { useConfigStore }    from '@/features/config/store';
import { SAUDE_VERSION }     from '@/features/saude/migrations';
import { ESPIRITUAL_VERSION } from '@/features/espiritual/migrations';

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

  useStoreSync({
    feature:       'saude',
    getState:      () => useSaudeStore.getState(),
    setState:      (d) => useSaudeStore.setState(d as Parameters<typeof useSaudeStore.setState>[0]),
    subscribe:     (cb) => useSaudeStore.subscribe(cb),
    getEmptyState: emptySaude,
  });

  useStoreSync({
    feature:       'espiritual',
    getState:      () => useEspiritualStore.getState(),
    setState:      (d) => useEspiritualStore.setState(d as Parameters<typeof useEspiritualStore.setState>[0]),
    subscribe:     (cb) => useEspiritualStore.subscribe(cb),
    getEmptyState: emptyEspiritual,
  });

  useStoreSync({
    feature:   'config',
    getState:  () => useConfigStore.getState(),
    setState:  (d) => useConfigStore.setState(d as Parameters<typeof useConfigStore.setState>[0]),
    subscribe: (cb) => useConfigStore.subscribe(cb),
  });

  if (!isLoggedIn || !user) return null;

  return null;
}
