// src/app/migration-legacy.ts
// Migração one-shot de dados monolíticos v1 (mvida_data_v2) para stores individuais v2.
// Usado exclusivamente por boot.ts. Não referenciar em nenhum outro lugar.
import type {
  AppData,
  AppConfig,
} from "@/types/data";
import { today } from "@/shared/utils/date";


// ── Schema atual (versão 2) ──────────────────────────────────────────────────

const CURRENT_VERSION = 2;

export function DEF_DATA(): AppData {
  return {
    _v: CURRENT_VERSION,

    routine: {
      morning: [
        { id: 1, task: "Oração da manhã",     time: "06:00" },
        { id: 2, task: "Exercício",            time: "06:30" },
        { id: 3, task: "Café com a família",   time: "07:30" },
        { id: 4, task: "Vitaminas",            time: "08:30" },
      ],
      afternoon: [
        { id: 5, task: "Almoço em família",    time: "12:00" },
        { id: 6, task: "Estudo pessoal",       time: "13:30" },
        { id: 7, task: "Cuidados da casa",     time: "14:30" },
        { id: 8, task: "Lanche das crianças",  time: "16:00" },
      ],
      night: [
        { id: 9,  task: "Devocional em família", time: "19:00" },
        { id: 10, task: "Jantar em família",     time: "19:30" },
        { id: 11, task: "Skincare noturno",      time: "20:30" },
        { id: 12, task: "Oração da noite",       time: "22:00" },
      ],
      essential: [
        { id: 101, task: "Oração",              time: "" },
        { id: 102, task: "Tomar água",           time: "" },
        { id: 103, task: "Devocional",           time: "" },
        { id: 104, task: "Refeição em família",  time: "" },
        { id: 105, task: "Dormir cedo",          time: "" },
      ],
      done:    {},
      essMode: false,
    },

    health: {
      activeProfile: "eu",
      profiles: [
        {
          id:    "eu",
          name:  "Você",
          av:    "👩",
          type:  "adult_f",
          color: "#E8799A",
          water: { goal: 2000, log: {} },
          cycle: { start: today(), len: 28, menses: 5 },
          meds:  [],
          notes: {},
        },
      ],
    },

    finance: {
      transactions: [],
      cards:        [],
      budget:       {},
    },

    spirit: {
      gratitude: {},
      readings:  [],
      prayers:   [],
    },

    shopping: { items: [] },
    notes:    { list: [] },
    reminders:{ list: [] },

    bloom: { points: {} },

    kids: {
      children: [],
      done: {},
    },

    integrations: {
      google: {
        connected:  false,
        email:      "",
        calendars:  [],
        events:     [],
      },
    },
  };
}

export function DEF_CFG(): AppConfig {
  return {
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
  };
}

interface LegacyV1Data {
  cycle?: {
    start:  string;
    len:    number;
    menses: number;
  };
}

function deepMergeRecord(
  defaults: Record<string, unknown>,
  loaded: Record<string, unknown>
): Record<string, unknown> {
  const result = { ...defaults };

  for (const key of Object.keys(loaded)) {
    const loadedVal = loaded[key];
    const defaultVal = defaults[key];

    if (loadedVal === undefined || loadedVal === null) {
      continue;
    }

    if (
      typeof defaultVal === "object" &&
      defaultVal !== null &&
      !Array.isArray(defaultVal) &&
      typeof loadedVal === "object" &&
      !Array.isArray(loadedVal)
    ) {
      result[key] = deepMergeRecord(
        defaultVal as Record<string, unknown>,
        loadedVal as Record<string, unknown>
      );
    } else {
      result[key] = loadedVal;
    }
  }

  return result;
}

export function migrateData(raw: unknown): AppData {
  if (raw === null || raw === undefined || typeof raw !== "object") {
    return DEF_DATA();
  }

  const loaded = raw as Record<string, unknown> & LegacyV1Data & { _v?: number };
  const version = loaded._v ?? 0;

  if (version < 2) {
    const healthRaw = loaded.health as Record<string, unknown> | undefined;
    const profilesRaw = healthRaw?.profiles as Array<Record<string, unknown>> | undefined;
    if (loaded.cycle && profilesRaw?.[0]) {
      const firstProfile = profilesRaw[0];
      if (!firstProfile.cycle) {
        firstProfile.cycle = {
          start:  loaded.cycle.start,
          len:    loaded.cycle.len,
          menses: loaded.cycle.menses,
        };
      }
    }
    delete loaded.cycle;
  }

  const defaults = DEF_DATA();
  const merged = deepMergeRecord(
    defaults as unknown as Record<string, unknown>,
    loaded as Record<string, unknown>
  ) as unknown as AppData;

  merged._v = CURRENT_VERSION;

  const AV_FALLBACK: Record<string, string> = {
    adult_f: "👩",
    adult_m: "👨",
    child:   "🧒",
    pet:     "🐾",
  };
  if (merged.health?.profiles) {
    merged.health.profiles = merged.health.profiles.map(p => {
      const isLucineName = typeof p.av === "string" && /^[A-Z][a-z]/.test(p.av);
      if (!p.av || isLucineName) {
        return { ...p, av: AV_FALLBACK[p.type] ?? "👩" };
      }
      return p;
    });
  }

  return merged;
}

export function migrateConfig(raw: unknown): AppConfig {
  if (raw === null || raw === undefined || typeof raw !== "object") {
    return DEF_CFG();
  }

  const loaded = raw as Partial<AppConfig>;
  const defaults = DEF_CFG();

  return {
    theme: loaded.theme ?? defaults.theme,
    name:  loaded.name  ?? defaults.name,
    dash: {
      bloom:     loaded.dash?.bloom     ?? defaults.dash.bloom,
      water:     loaded.dash?.water     ?? defaults.dash.water,
      routine:   loaded.dash?.routine   ?? defaults.dash.routine,
      finance:   loaded.dash?.finance   ?? defaults.dash.finance,
      cycle:     loaded.dash?.cycle     ?? defaults.dash.cycle,
      spirit:    loaded.dash?.spirit    ?? defaults.dash.spirit,
      reminders: loaded.dash?.reminders ?? defaults.dash.reminders,
    },
  };
}
