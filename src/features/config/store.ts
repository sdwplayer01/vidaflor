// src/features/config/store.ts
import { create } from 'zustand';
import { persistVidaFlor } from '@/shared/storage/persist-middleware';
import { STORAGE_KEYS } from '@/shared/storage/keys';
import { applyTheme, resolveTheme } from '@/shared/constants/themes';
import type { ThemeKey } from '@/shared/types/theme';
import type { AppConfig, DashConfig } from './types';
import { CONFIG_STORE_VERSION, migrateConfigState } from './migrations';

interface ConfigState extends AppConfig {
  _version:  number;
  _hydrated: boolean;
}

interface ConfigActions {
  setTheme:   (key: ThemeKey) => void;
  setName:    (name: string) => void;
  toggleDash: (key: keyof DashConfig) => void;
  setDash:    (dash: Partial<DashConfig>) => void;
}

const defaultDash: DashConfig = {
  bloom:     true,
  water:     true,
  routine:   true,
  finance:   true,
  cycle:     true,
  spirit:    true,
  reminders: true,
  meds:      true,
  kids:      true,
  casa:      true,
  pets:      true,
};

export const useConfigStore = create<ConfigState & ConfigActions>()(
  persistVidaFlor(
    (set) => ({
      theme:     'aurora',
      name:      'Amor',
      dash:      defaultDash,
      _version:  CONFIG_STORE_VERSION,
      _hydrated: false,

      setTheme: (key) => {
        applyTheme(resolveTheme(key));
        set({ theme: key });
      },

      setName: (name) => set({ name }),

      toggleDash: (key) =>
        set((state) => ({
          dash: { ...state.dash, [key]: !state.dash[key] },
        })),

      setDash: (partial) =>
        set((state) => ({
          dash: { ...state.dash, ...partial },
        })),
    }),
    {
      name:    STORAGE_KEYS.config,
      version: CONFIG_STORE_VERSION,
      migrate: migrateConfigState,
      onHydrated: (state) => {
        // Re-aplica tema ao hidratar do storage
        applyTheme(resolveTheme(state.theme));
      },
    }
  )
);
