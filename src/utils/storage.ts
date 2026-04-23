// src/utils/storage.ts
// Wrapper sobre window.storage da plataforma Claude Artifacts.
// Fallback para localStorage quando window.storage não está disponível.

// ── Declaração global do window.storage ──────────────────────────────────────

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

// ── Chaves de storage ────────────────────────────────────────────────────────

export const STORAGE_DATA = "mvida_data_v2";
export const STORAGE_CFG  = "mvida_cfg_v2";

// ── Detecção de storage disponível ───────────────────────────────────────────

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

// ── Leitura ──────────────────────────────────────────────────────────────────

/**
 * Carrega um valor do storage, com fallback tipado.
 * Tenta window.storage primeiro, depois localStorage.
 */
export async function loadFromStorage<T>(key: string, fallback: T): Promise<T> {
  // Tentativa 1: window.storage (Claude Artifacts)
  if (hasWindowStorage()) {
    try {
      const res = await window.storage!.get(key);
      if (res?.value) {
        return JSON.parse(res.value) as T;
      }
    } catch {
      // silent — tenta localStorage abaixo
    }
  }

  // Tentativa 2: localStorage (ambiente web padrão)
  if (hasLocalStorage()) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        return JSON.parse(raw) as T;
      }
    } catch {
      // silent
    }
  }

  return fallback;
}

// ── Escrita ──────────────────────────────────────────────────────────────────

/**
 * Salva um valor no storage de forma fire-and-forget.
 * Nunca lança exceção — não deve quebrar a UI se o storage falhar.
 */
export function saveToStorage(key: string, value: unknown): void {
  const json = JSON.stringify(value);

  // window.storage (fire-and-forget — não awaita)
  if (hasWindowStorage()) {
    try {
      void window.storage!.set(key, json);
    } catch {
      // silent
    }
  }

  // localStorage como backup
  if (hasLocalStorage()) {
    try {
      localStorage.setItem(key, json);
    } catch {
      // silent — quota exceeded etc.
    }
  }
}

// ── Remoção ──────────────────────────────────────────────────────────────────

/**
 * Remove uma chave do storage.
 */
export async function removeFromStorage(key: string): Promise<void> {
  if (hasWindowStorage()) {
    try {
      await window.storage!.delete(key);
    } catch {
      // silent
    }
  }

  if (hasLocalStorage()) {
    try {
      localStorage.removeItem(key);
    } catch {
      // silent
    }
  }
}

// ── Listagem ─────────────────────────────────────────────────────────────────

/**
 * Lista chaves com um prefixo. Só funciona com window.storage.
 */
export async function listStorageKeys(prefix?: string): Promise<string[]> {
  if (hasWindowStorage()) {
    try {
      const res = await window.storage!.list(prefix);
      return res?.keys ?? [];
    } catch {
      return [];
    }
  }
  return [];
}
