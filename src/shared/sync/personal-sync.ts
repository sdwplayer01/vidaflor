import { create } from 'zustand';
import { supabase } from '@/shared/supabase/client';

export type PersonalFeature = 'saude' | 'espiritual' | 'config';

const TABLE: Record<PersonalFeature, string> = {
  saude:     'personal_saude',
  espiritual:'personal_espiritual',
  config:    'personal_config',
};

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

export async function pullPersonal(
  feature: PersonalFeature,
  userId:  string
): Promise<unknown | null> {
  useSyncStatus.getState().set({ status: 'syncing' });
  const { data, error } = await supabase
    .from(TABLE[feature])
    .select('data')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    if (import.meta.env.DEV) console.warn('[sync] pull error', feature, error.message);
    useSyncStatus.getState().set({ status: 'error' });
    return null;
  }

  // null = nenhuma linha ainda (usuário novo) — não é erro
  if (!data) {
    useSyncStatus.getState().set({ status: 'idle', lastSyncAt: Date.now() });
    return null;
  }

  useSyncStatus.getState().set({ status: 'idle', lastSyncAt: Date.now() });
  return (data as { data: unknown }).data;
}

export async function pushPersonal(
  feature: PersonalFeature,
  userId:  string,
  payload: unknown
): Promise<void> {
  useSyncStatus.getState().set({ status: 'syncing' });
  const { error } = await supabase
    .from(TABLE[feature])
    .upsert(
      { user_id: userId, data: payload, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );

  if (error) {
    if (import.meta.env.DEV) console.warn('[sync] push error', feature, error.message);
    useSyncStatus.getState().set({ status: 'error' });
    return;
  }

  useSyncStatus.getState().set({ status: 'idle', lastSyncAt: Date.now() });
}
