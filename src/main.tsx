// src/main.tsx — Entry point do VidaFlor v2.
// Importa tokens CSS, aplica migração de dados legados e renderiza o App.

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/styles/tokens.css";
import "./index.css";
import { App } from "./App";
import { migrateData, migrateConfig } from "@/utils/migration";
import { STORAGE_DATA, STORAGE_CFG } from "@/utils/storage";

// ── Migração de dados legados (monolítico → stores Zustand) ──────────────────
// Executado antes do render para que os stores hidratem dados já migrados.
(function runLegacyMigration() {
  try {
    // 1. Migrar dados monolíticos (mvida_data_v2)
    const rawData = localStorage.getItem(STORAGE_DATA);
    if (rawData) {
      const parsed = JSON.parse(rawData);
      const migrated = migrateData(parsed);

      // Escrever nos stores individuais Zustand (se ainda não existem)
      const storeKeys: Record<string, unknown> = {
        "vidaflor-rotina":     { state: migrated.routine,                     version: 0 },
        "vidaflor-saude":      { state: migrated.health,                      version: 0 },
        "vidaflor-financas":   { state: migrated.finance,                     version: 0 },
        "vidaflor-espiritual": { state: migrated.spirit,                      version: 0 },
        "vidaflor-organiza":   { state: { shopping: migrated.shopping?.items ?? [], notes: migrated.notes?.list ?? [], reminders: migrated.reminders?.list ?? [] }, version: 0 },
        "vidaflor-kids":       { state: migrated.kids ?? { children: [], done: {} }, version: 0 },
      };

      for (const [key, val] of Object.entries(storeKeys)) {
        if (!localStorage.getItem(key)) {
          localStorage.setItem(key, JSON.stringify(val));
        }
      }

      // Atualizar source monolítico com versão migrada
      localStorage.setItem(STORAGE_DATA, JSON.stringify(migrated));
    }

    // 2. Migrar config (mvida_cfg_v2 → vidaflor-config)
    const rawCfg = localStorage.getItem(STORAGE_CFG);
    if (rawCfg) {
      const migratedCfg = migrateConfig(JSON.parse(rawCfg));
      if (!localStorage.getItem("vidaflor-config")) {
        localStorage.setItem("vidaflor-config", JSON.stringify({ state: migratedCfg, version: 0 }));
      }
    }
  } catch {
    // Silencioso — dados corrompidos usam defaults dos stores
  }
})();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
