// src/App.tsx — Root do VidaFlor v2
// Sem prop drilling de T — tema é lido via useConfigStore.
// Todas as 7 telas migradas para TypeScript + Zustand.

import { useState, useEffect } from "react";
import { Settings, Flower } from "lucide-react";
import type { TabKey } from "@/types/data";
import { useConfigStore }    from "@/stores/configStore";
import { applyTheme, THEMES } from "@/utils/applyTheme";
import { BottomNav }          from "@/components/nav/BottomNav";
import { HomeScreen }         from "@/screens/HomeScreen";
import { RotinaScreen }       from "@/screens/RotinaScreen";
import { SaudeScreen }        from "@/screens/SaudeScreen";
import { EspiritualScreen }   from "@/screens/EspiritualScreen";
import { OrganizaScreen }     from "@/screens/OrganizaScreen";
import { FinancasScreen }     from "@/screens/FinancasScreen";
import { ConfigScreen }       from "@/screens/ConfigScreen";

// ── App Shell ────────────────────────────────────────────────────────────────

const SCREEN_LABELS: Record<TabKey, string> = {
  home:       "Início",
  rotina:     "Rotina",
  saude:      "Saúde",
  espiritual: "Conexão",
  organiza:   "Organização",
  financas:   "Finanças",
  config:     "Configurações",
};

export function App() {
  const [tab, setTab] = useState<TabKey>("home");
  const theme = useConfigStore((s) => s.theme);

  // Aplica tema ao montar e quando muda
  useEffect(() => {
    applyTheme(THEMES[theme]);
  }, [theme]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--vf-bg)",
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      maxWidth: 430,
      margin: "0 auto",
      position: "relative",
      transition: "background .5s",
    }}>
      {/* Header */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "var(--vf-bg)",
        borderBottom: "1px solid var(--vf-bd)",
        padding: "14px 20px 12px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        backdropFilter: "blur(10px)",
      }}>
        <div style={{
          width: 34,
          height: 34,
          borderRadius: 11,
          background: "var(--vf-gh)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "var(--vf-shadow-btn)",
        }}>
          <Flower size={20} color="#fff" />
        </div>
        <div>
          <p style={{
            margin: 0,
            fontSize: 10,
            color: "var(--vf-tm)",
            fontWeight: 800,
            letterSpacing: "0.5px",
          }}>MINHA VIDA</p>
          <p style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 900,
            color: "var(--vf-tx)",
          }}>{SCREEN_LABELS[tab]}</p>
        </div>
        <button
          onClick={() => setTab("config")}
          style={{
            marginLeft: "auto",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 6,
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <Settings size={20} color="var(--vf-tm)" />
        </button>
      </div>

      {/* Conteúdo */}
      <div style={{ paddingBottom: 90, minHeight: "calc(100vh - 64px)" }}>
        {tab === "home"       && <HomeScreen setTab={setTab} />}
        {tab === "rotina"     && <RotinaScreen />}
        {tab === "saude"      && <SaudeScreen />}
        {tab === "espiritual" && <EspiritualScreen />}
        {tab === "organiza"   && <OrganizaScreen />}
        {tab === "financas"   && <FinancasScreen />}
        {tab === "config"     && <ConfigScreen />}
      </div>

      <BottomNav tab={tab} setTab={setTab} />
    </div>
  );
}
