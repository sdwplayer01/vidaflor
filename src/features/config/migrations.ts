// src/features/config/migrations.ts
import { AppConfig } from "./types";

export const CONFIG_STORE_VERSION = 4;

/** Maps legacy theme keys to the new Aurora/Crepusculo system */
const THEME_MAP: Record<string, string> = {
  pastel:     "aurora",
  terra:      "aurora",
  lilac:      "crepusculo",
  neutro:     "crepusculo",
  sage:       "aurora",
  aurora:     "aurora",
  crepusculo: "crepusculo",
};

export function migrateConfigState(persistedState: any, version: number): any {
  let state = { ...persistedState };

  if (version < 1) {
    if (state && state.dash) {
      state.dash = {
        bloom:     state.dash.bloom ?? true,
        water:     state.dash.water ?? true,
        routine:   state.dash.routine ?? true,
        finance:   state.dash.finance ?? true,
        cycle:     state.dash.cycle ?? true,
        spirit:    state.dash.spirit ?? true,
        reminders: state.dash.reminders ?? true,
        meds:      state.dash.meds ?? true,
        kids:      state.dash.kids ?? true,
        casa:      state.dash.casa ?? true,
        pets:      state.dash.pets ?? true,
      };
    }
  }

  if (version < 2) {
    state.theme = THEME_MAP[state.theme ?? ""] ?? "aurora";
  }

  if (version < 3) {
    // parceiro é opcional — sem transformação necessária
  }

  if (version < 4) {
    state.hideBalance = state.hideBalance ?? false;
  }

  return state;
}
