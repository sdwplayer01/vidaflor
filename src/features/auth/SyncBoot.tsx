import { useAuthStore }      from '@/features/auth/store';
import { useStoreSync }      from '@/shared/sync/use-store-sync';
import { useSaudeStore }     from '@/features/saude/store';
import { useEspiritualStore } from '@/features/espiritual/store';
import { useConfigStore }    from '@/features/config/store';

export function SyncBoot() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const user       = useAuthStore((s) => s.user);

  useStoreSync({
    feature:   'saude',
    getState:  () => useSaudeStore.getState(),
    setState:  (d) => useSaudeStore.setState(d as Parameters<typeof useSaudeStore.setState>[0], true),
    subscribe: (cb) => useSaudeStore.subscribe(cb),
  });

  useStoreSync({
    feature:   'espiritual',
    getState:  () => useEspiritualStore.getState(),
    setState:  (d) => useEspiritualStore.setState(d as Parameters<typeof useEspiritualStore.setState>[0], true),
    subscribe: (cb) => useEspiritualStore.subscribe(cb),
  });

  useStoreSync({
    feature:   'config',
    getState:  () => useConfigStore.getState(),
    setState:  (d) => useConfigStore.setState(d as Parameters<typeof useConfigStore.setState>[0], true),
    subscribe: (cb) => useConfigStore.subscribe(cb),
  });

  if (!isLoggedIn || !user) return null;

  return null;
}
