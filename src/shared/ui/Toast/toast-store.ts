// src/shared/ui/Toast/toast-store.ts
// Toast efêmero, NÃO persistido. Mantém um único toast por vez.
import { create } from 'zustand';

export interface ToastData {
  id:           number;
  message:      string;
  actionLabel?: string;
  onAction?:    () => void;
}

interface ToastStore {
  current: ToastData | null;
  show:    (message: string, opts?: { actionLabel?: string; onAction?: () => void; duration?: number }) => void;
  dismiss: () => void;
}

let seq = 0;
let timer: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastStore>((set) => ({
  current: null,

  show: (message, opts = {}) => {
    if (timer) clearTimeout(timer);
    const id = ++seq;
    set({ current: { id, message, actionLabel: opts.actionLabel, onAction: opts.onAction } });
    timer = setTimeout(() => {
      // Só dispensa se ainda for o mesmo toast (evita fechar um toast novo)
      set((s) => (s.current?.id === id ? { current: null } : s));
    }, opts.duration ?? 4000);
  },

  dismiss: () => {
    if (timer) clearTimeout(timer);
    set({ current: null });
  },
}));

/** Helper imperativo para disparar um toast de qualquer lugar. */
export const toast = (
  message: string,
  opts?: { actionLabel?: string; onAction?: () => void; duration?: number },
) => useToastStore.getState().show(message, opts);
