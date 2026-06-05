import { create } from 'zustand';

interface SyncReadyState {
  ready:    boolean;
  setReady: (v: boolean) => void;
  reset:    () => void;
}

export const useSyncReady = create<SyncReadyState>()((set) => ({
  ready:    false,
  setReady: (v) => set({ ready: v }),
  reset:    () => set({ ready: false }),
}));
