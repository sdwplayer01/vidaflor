// src/features/config/migrations.ts
import { AppConfig } from "./types";

export const CONFIG_STORE_VERSION = 1;

/**
 * Realiza a migração de configurações de versões anteriores.
 */
export function migrateConfigState(persistedState: any, version: number): any {
  let state = { ...persistedState };

  if (version < 1) {
    // Migra da versão v0 (configuração monolítica original ou legacy config) para v1
    // adicionando as novas chaves do dashboard
    if (state && state.dash) {
      state.dash = {
        bloom:     state.dash.bloom ?? true,
        water:     state.dash.water ?? true,
        routine:   state.dash.routine ?? true,
        finance:   state.dash.finance ?? true,
        cycle:     state.dash.cycle ?? true,
        spirit:    state.dash.spirit ?? true,
        reminders: state.dash.reminders ?? true,
        // Novos toggles v2:
        meds:      state.dash.meds ?? true,
        kids:      state.dash.kids ?? true,
        casa:      state.dash.casa ?? true,
        pets:      state.dash.pets ?? true,
      };
    }
  }

  return state;
}
