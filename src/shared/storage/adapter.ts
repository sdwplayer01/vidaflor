// src/shared/storage/adapter.ts

declare global {
  interface Window {
    storage?: {
      get(key: string): Promise<{ key: string; value: string } | null>;
      set(key: string, value: string): Promise<void>;
      delete(key: string): Promise<void>;
      list(prefix?: string): Promise<{ keys: string[] }>;
    };
  }
}

export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  listKeys(prefix?: string): Promise<string[]>;
  getItemSync(key: string): string | null; // For synchronous read (localStorage fallback/fast load)
}

function hasWindowStorage(): boolean {
  return typeof window !== "undefined"
    && window.storage != null
    && typeof window.storage.get === "function";
}

function hasLocalStorage(): boolean {
  try {
    const key = "__vf_test__";
    localStorage.setItem(key, "1");
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export const storageAdapter: StorageAdapter = {
  async getItem(key: string): Promise<string | null> {
    // 1. Tenta window.storage
    if (hasWindowStorage()) {
      try {
        const res = await window.storage!.get(key);
        if (res?.value) {
          return res.value;
        }
      } catch (err) {
        console.warn("StorageAdapter: Erro ao ler de window.storage", err);
      }
    }

    // 2. Fallback para localStorage
    if (hasLocalStorage()) {
      try {
        return localStorage.getItem(key);
      } catch (err) {
        console.warn("StorageAdapter: Erro ao ler de localStorage", err);
      }
    }

    return null;
  },

  async setItem(key: string, value: string): Promise<void> {
    const writes: Promise<void>[] = [];

    if (hasWindowStorage()) {
      writes.push(
        window.storage!.set(key, value).catch(err => {
          console.warn("StorageAdapter: Erro ao escrever em window.storage", err);
        })
      );
    }

    if (hasLocalStorage()) {
      try {
        localStorage.setItem(key, value);
      } catch (err) {
        console.warn("StorageAdapter: Erro ao escrever em localStorage", err);
      }
    }

    await Promise.all(writes);
  },

  async removeItem(key: string): Promise<void> {
    const deletes: Promise<void>[] = [];

    if (hasWindowStorage()) {
      deletes.push(
        window.storage!.delete(key).catch(err => {
          console.warn("StorageAdapter: Erro ao deletar de window.storage", err);
        })
      );
    }

    if (hasLocalStorage()) {
      try {
        localStorage.removeItem(key);
      } catch (err) {
        console.warn("StorageAdapter: Erro ao deletar de localStorage", err);
      }
    }

    await Promise.all(deletes);
  },

  async listKeys(prefix?: string): Promise<string[]> {
    if (hasWindowStorage()) {
      try {
        const res = await window.storage!.list(prefix);
        return res?.keys ?? [];
      } catch (err) {
        console.warn("StorageAdapter: Erro ao listar chaves de window.storage", err);
      }
    }

    // Fallback de listagem para localStorage
    if (hasLocalStorage()) {
      try {
        const keys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (!prefix || k.startsWith(prefix))) {
            keys.push(k);
          }
        }
        return keys;
      } catch (err) {
        console.warn("StorageAdapter: Erro ao listar chaves de localStorage", err);
      }
    }

    return [];
  },

  getItemSync(key: string): string | null {
    if (hasLocalStorage()) {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    }
    return null;
  }
};
