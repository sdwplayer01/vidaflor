import { create } from 'zustand';
import { supabase } from '@/shared/supabase/client';

export type SyncStatus = 'idle' | 'syncing' | 'error';

interface SyncStatusState {
  status:     SyncStatus;
  lastSyncAt: number | null;
  set:        (s: Partial<SyncStatusState>) => void;
}

export const useSyncStatus = create<SyncStatusState>()((set) => ({
  status:     'idle',
  lastSyncAt: null,
  set:        (s) => set(s),
}));

export interface PullResult {
  data:    unknown;
  version: number;
}

export async function pullState(
  feature: string,
  userId:  string
): Promise<PullResult | null> {
  useSyncStatus.getState().set({ status: 'syncing' });
  const { data, error } = await supabase
    .from('personal_state')
    .select('data, version')
    .eq('user_id', userId)
    .eq('feature', feature)
    .maybeSingle();

  if (error) {
    if (import.meta.env.DEV) console.warn('[sync] pull error', feature, error.message);
    useSyncStatus.getState().set({ status: 'error' });
    return null;
  }

  if (!data) {
    useSyncStatus.getState().set({ status: 'idle', lastSyncAt: Date.now() });
    return null;
  }

  useSyncStatus.getState().set({ status: 'idle', lastSyncAt: Date.now() });
  return {
    data:    (data as { data: unknown }).data,
    version: (data as { version: number }).version ?? 0,
  };
}

export async function pushState(
  feature: string,
  userId:  string,
  payload: unknown,
  version: number
): Promise<void> {
  useSyncStatus.getState().set({ status: 'syncing' });
  const { error } = await supabase
    .from('personal_state')
    .upsert(
      {
        user_id:    userId,
        feature,
        data:       payload,
        version,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,feature' }
    );

  if (error) {
    if (import.meta.env.DEV) console.warn('[sync] push error', feature, error.message);
    useSyncStatus.getState().set({ status: 'error' });
    return;
  }

  useSyncStatus.getState().set({ status: 'idle', lastSyncAt: Date.now() });
}
