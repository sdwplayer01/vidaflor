// src/shared/storage/persist-middleware.ts
import { StateCreator } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { storageAdapter } from "./adapter";

// Debounce helper to prevent writing to storage on every rapid state change
function debounce<T extends unknown[]>(fn: (...args: T) => void, delay: number): (...args: T) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return function (...args: T) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export interface PersistVidaFlorOptions<S> {
  name: string;
  version: number;
  migrate?: (persistedState: unknown, version: number) => any;
  onHydrated?: (state: S) => void;
}

/**
 * Middleware Zustand customizado que unifica a lógica de persistência do VidaFlor v2.0.
 * - Suporta leitura síncrona imediata (evita flash of empty state) e carregamento assíncrono.
 * - Debounce de 300ms nas gravações para otimizar performance.
 * - Integra com o StorageAdapter (window.storage + localStorage fallback).
 * - Suporta versionamento e migrações.
 */
export function persistVidaFlor<S>(
  creator: StateCreator<S, [], []>,
  options: PersistVidaFlorOptions<S>
) {
  // Gravação debotada com 300ms de delay para evitar overhead de I/O
  const debouncedSetItem = debounce((key: string, value: string) => {
    storageAdapter.setItem(key, value).catch(err => {
      console.error("persistVidaFlor: Falha ao persistir estado", { key, err });
    });
  }, 300);

  const customStorage = {
    getItem: (name: string): string | null | Promise<string | null> => {
      // 1. Tenta leitura síncrona do localStorage para hidratação imediata na montagem
      const syncVal = storageAdapter.getItemSync(name);
      if (syncVal) return syncVal;

      // 2. Fallback assíncrono para window.storage (Claude Artifacts API)
      return storageAdapter.getItem(name);
    },
    setItem: (name: string, value: string): void => {
      debouncedSetItem(name, value);
    },
    removeItem: (name: string): void => {
      storageAdapter.removeItem(name).catch(err => {
        console.error("persistVidaFlor: Falha ao remover estado", { name, err });
      });
    }
  };

  return persist(creator, {
    name: options.name,
    version: options.version,
    migrate: options.migrate,
    storage: createJSONStorage(() => customStorage),
    onRehydrateStorage: () => (state) => {
      if (state && options.onHydrated) {
        options.onHydrated(state);
      }
    }
  });
}
