// src/stores/configStore.ts
// Store de configuração: tema, nome da usuária, dashboard toggles.
// Persist: window.storage + localStorage via adapter customizado.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AppConfig, ThemeKey, DashConfig } from "@/types/data";
import { STORAGE_CFG, saveToStorage } from "@/utils/storage";
import { applyTheme, THEMES } from "@/utils/applyTheme";

// ── Storage adapter para window.storage + localStorage ───────────────────────

const vfStorage = createJSONStorage<ConfigStore>(() => ({
  getItem: (name: string): string | null => {
    // Sync read: localStorage primeiro (rápido)
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    saveToStorage(name, JSON.parse(value));
  },
  removeItem: (name: string): void => {
    try { localStorage.removeItem(name); } catch { /* silent */ }
  },
}));

// ── Interface ────────────────────────────────────────────────────────────────

interface ConfigStore extends AppConfig {
  // Actions
  setTheme:     (key: ThemeKey) => void;
  setName:      (name: string) => void;
  toggleDash:   (key: keyof DashConfig) => void;
  setDash:      (dash: Partial<DashConfig>) => void;
  loadConfig:   (cfg: Partial<AppConfig>) => void;
}

// ── Store ────────────────────────────────────────────────────────────────────

export const useConfigStore = create<ConfigStore>()(
  persist(
    (set) => ({
      // Estado inicial
      theme: "pastel",
      name:  "Amor",
      dash: {
        bloom:     true,
        water:     true,
        routine:   true,
        finance:   true,
        cycle:     true,
        spirit:    true,
        reminders: true,
      },

      // Actions
      setTheme: (key) => {
        applyTheme(THEMES[key]);
        set({ theme: key });
      },

      setName: (name) => set({ name }),

      toggleDash: (key) => set((state) => ({
        dash: { ...state.dash, [key]: !state.dash[key] },
      })),

      setDash: (partial) => set((state) => ({
        dash: { ...state.dash, ...partial },
      })),

      loadConfig: (cfg) => set((state) => ({
        theme: cfg.theme ?? state.theme,
        name:  cfg.name  ?? state.name,
        dash:  cfg.dash  ? { ...state.dash, ...cfg.dash } : state.dash,
      })),
    }),
    {
      name: STORAGE_CFG,
      storage: vfStorage,
      onRehydrateStorage: () => (state) => {
        // Ao reidratar, aplicar o tema salvo
        if (state?.theme) {
          applyTheme(THEMES[state.theme]);
        }
      },
    }
  )
);
