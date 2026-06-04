// src/app/boot.ts
import { migrateData, migrateConfig } from "./migration-legacy";
import { STORAGE_KEYS } from "../shared/storage/keys";
import { storageAdapter } from "../shared/storage/adapter";

const STORAGE_DATA = "mvida_data_v2";
const STORAGE_CFG  = "mvida_cfg_v2";

/**
 * Orquestra toda a inicialização e migração de dados do VidaFlor v2.0.
 * É executado antes de renderizar a árvore de componentes do React para garantir que:
 * 1. Dados monolíticos legados (mvida_data_v2) sejam migrados e fragmentados.
 * 2. Chaves com hífen v1 (ex: vidaflor-config) sejam copiadas/migradas para chaves com dois pontos v2 (ex: vidaflor:config).
 */
export function boot(): void {
  try {
    // ── 1. Migração de chaves v1 (hífen) para v2 (dois pontos) ──
    const keyMapping: Record<string, string> = {
      "vidaflor-config":     STORAGE_KEYS.config,
      "vidaflor-nav":        STORAGE_KEYS.nav,
      "vidaflor-rotina":     STORAGE_KEYS.rotina,
      "vidaflor-saude":      STORAGE_KEYS.saude,
      "vidaflor-financas":   STORAGE_KEYS.financas,
      "vidaflor-espiritual": STORAGE_KEYS.espiritual,
      "vidaflor-organiza":   STORAGE_KEYS.organiza,
      "vidaflor-kids":       STORAGE_KEYS.kids,
    };

    for (const [oldKey, newKey] of Object.entries(keyMapping)) {
      const value = localStorage.getItem(oldKey);
      if (value && !localStorage.getItem(newKey)) {
        void storageAdapter.setItem(newKey, value);
        if (import.meta.env.DEV) console.log(`boot: Migrado ${oldKey} -> ${newKey}`);
      }
    }

    // ── 2. Migração de dados legados do v1 monolítico (mvida_data_v2) ──
    const rawData = localStorage.getItem(STORAGE_DATA);
    if (rawData) {
      const parsed = JSON.parse(rawData);
      const migrated = migrateData(parsed);

      // Escreve nos stores individuais com a chave colon-based v2
      const storeKeys: Record<string, unknown> = {
        [STORAGE_KEYS.rotina]:     { state: migrated.routine,                     version: 0 },
        [STORAGE_KEYS.saude]:      { state: migrated.health,                      version: 0 },
        [STORAGE_KEYS.financas]:   { state: migrated.finance,                     version: 0 },
        [STORAGE_KEYS.espiritual]: { state: migrated.spirit,                      version: 0 },
        [STORAGE_KEYS.organiza]:   { state: { shopping: migrated.shopping?.items ?? [], notes: migrated.notes?.list ?? [], reminders: migrated.reminders?.list ?? [] }, version: 0 },
        [STORAGE_KEYS.kids]:       { state: migrated.kids ?? { children: [], done: {} }, version: 0 },
      };

      for (const [key, val] of Object.entries(storeKeys)) {
        if (!localStorage.getItem(key)) {
          void storageAdapter.setItem(key, JSON.stringify(val));
          if (import.meta.env.DEV) console.log(`boot: Criado store individual ${key} a partir de dados monolíticos`);
        }
      }

      // Mantém o monolítico atualizado por segurança
      localStorage.setItem(STORAGE_DATA, JSON.stringify(migrated));
    }

    // ── 3. Migração de config legada (mvida_cfg_v2) ──
    const rawCfg = localStorage.getItem(STORAGE_CFG);
    if (rawCfg) {
      const migratedCfg = migrateConfig(JSON.parse(rawCfg));
      const configKey = STORAGE_KEYS.config;
      if (!localStorage.getItem(configKey)) {
        void storageAdapter.setItem(configKey, JSON.stringify({ state: migratedCfg, version: 1 }));
        if (import.meta.env.DEV) console.log(`boot: Migrada config ${STORAGE_CFG} -> ${configKey}`);
      }
    }
  } catch (err) {
    console.error("boot: Falha catastrófica ao rodar migração inicial de dados", err);
  }
}
