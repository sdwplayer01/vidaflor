// src/screens/ConfigScreen.tsx — Tela de Configurações do VidaFlor v2
// Troca de tema, nome, dashboard toggles.

import { useState } from "react";
import {
  Palette, User, LayoutDashboard, Flower,
} from "lucide-react";
import type { ThemeKey, DashConfig } from "@/types/data";
import { Card }         from "@/components/shared/Card";
import { Btn }          from "@/components/shared/Btn";
import { Sheet }        from "@/components/shared/Sheet";
import { FInput }       from "@/components/shared/FInput";
import { Toggle }       from "@/components/shared/Toggle";
import { useConfigStore } from "@/stores/configStore";
import { getAvailableThemes } from "@/utils/applyTheme";

// ── Tipos locais ─────────────────────────────────────────────────────────────

type SheetKey = "editName" | null;

const DASH_LABELS: { key: keyof DashConfig; label: string; emoji: string }[] = [
  { key: "bloom",     label: "Flor do Dia",      emoji: "🌸" },
  { key: "water",     label: "Hidratação",        emoji: "💧" },
  { key: "routine",   label: "Rotina",            emoji: "📋" },
  { key: "finance",   label: "Finanças",          emoji: "💰" },
  { key: "cycle",     label: "Ciclo",             emoji: "🩸" },
  { key: "spirit",    label: "Conexão Espiritual", emoji: "🙏" },
  { key: "reminders", label: "Lembretes",         emoji: "🔔" },
];

// ── Component ────────────────────────────────────────────────────────────────

export function ConfigScreen() {
  const theme       = useConfigStore(s => s.theme);
  const name        = useConfigStore(s => s.name);
  const dash        = useConfigStore(s => s.dash);
  const setTheme    = useConfigStore(s => s.setTheme);
  const setName     = useConfigStore(s => s.setName);
  const toggleDash  = useConfigStore(s => s.toggleDash);

  const [sheet, setSheet] = useState<SheetKey>(null);
  const [nameForm, setNameForm] = useState(name);

  const themes = getAvailableThemes();

  const saveName = () => {
    if (nameForm.trim()) setName(nameForm.trim());
    setSheet(null);
  };

  return (
    <div style={{ padding: "24px 20px 20px" }}>

      {/* Cabeçalho */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, color: "var(--vf-tx)", fontSize: 22, fontWeight: 900 }}>Configurações</h2>
        <p style={{ margin: "2px 0 0", color: "var(--vf-tm)", fontSize: 13 }}>Personalize o seu VidaFlor</p>
      </div>

      {/* ═══ Seção: Perfil ═══ */}
      <Card style={{ marginBottom: 16, padding: "18px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 18, background: "var(--vf-gh)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "var(--vf-shadow-btn)",
          }}>
            <Flower size={26} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 10, color: "var(--vf-tm)", fontWeight: 800, letterSpacing: "0.5px" }}>MEU NOME</p>
            <p style={{ margin: "2px 0 0", fontSize: 20, fontWeight: 900, color: "var(--vf-tx)" }}>{name}</p>
          </div>
          <button
            onClick={() => { setNameForm(name); setSheet("editName"); }}
            style={{
              width: 44, height: 44, borderRadius: 14, background: "var(--vf-alt)",
              border: "none", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", WebkitTapHighlightColor: "transparent",
            }}
          >
            <User size={18} color="var(--vf-tm)" />
          </button>
        </div>
      </Card>

      {/* ═══ Seção: Tema ═══ */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Palette size={18} color="var(--vf-p)" />
          <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "var(--vf-tx)" }}>Tema</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {themes.map(t => (
            <button
              key={t.key}
              onClick={() => setTheme(t.key as ThemeKey)}
              style={{
                display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                borderRadius: 16, border: `2px solid ${theme === t.key ? "var(--vf-p)" : "var(--vf-bd)"}`,
                background: theme === t.key ? "color-mix(in srgb, var(--vf-p) 8%, transparent)" : "var(--vf-surf)",
                cursor: "pointer", WebkitTapHighlightColor: "transparent",
                transition: "all .2s",
              }}
            >
              {/* Preview circle */}
              <div style={{
                width: 40, height: 40, borderRadius: 14, background: t.gh,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, flexShrink: 0,
                boxShadow: theme === t.key ? `0 4px 12px ${t.p}44` : "none",
              }}>
                {t.e}
              </div>
              <div style={{ flex: 1, textAlign: "left" }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "var(--vf-tx)" }}>{t.name}</p>
                <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                  {[t.bg, t.p, t.ok, t.er].map((c, i) => (
                    <div key={i} style={{ width: 14, height: 14, borderRadius: 4, background: c, border: "1px solid rgba(0,0,0,.08)" }} />
                  ))}
                </div>
              </div>
              {theme === t.key && (
                <div style={{
                  width: 24, height: 24, borderRadius: 99, background: "var(--vf-p)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <span style={{ color: "#fff", fontSize: 13, fontWeight: 900 }}>✓</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ Seção: Dashboard ═══ */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <LayoutDashboard size={18} color="var(--vf-p)" />
          <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "var(--vf-tx)" }}>Cards na Home</p>
        </div>
        <Card style={{ padding: "8px 0" }}>
          {DASH_LABELS.map((d, i) => (
            <div
              key={d.key}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "14px 18px",
                borderBottom: i < DASH_LABELS.length - 1 ? "1px solid var(--vf-bd)" : "none",
              }}
            >
              <span style={{ fontSize: 14, color: "var(--vf-tx)", fontWeight: 600 }}>
                {d.emoji} {d.label}
              </span>
              <Toggle val={dash[d.key]} onChange={() => toggleDash(d.key)} />
            </div>
          ))}
        </Card>
      </div>

      {/* ═══ Footer ═══ */}
      <div style={{ textAlign: "center", padding: "20px 0 10px" }}>
        <p style={{ margin: 0, fontSize: 11, color: "var(--vf-tm)" }}>VidaFlor v2.0 · Feito com 💜</p>
      </div>

      {/* ════════════ SHEETS ════════════ */}

      {sheet === "editName" && (
        <Sheet title="✏️ Seu Nome" onClose={() => setSheet(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ margin: 0, fontSize: 13, color: "var(--vf-tm)", lineHeight: 1.5 }}>
              Como você quer ser chamada? Este nome aparece na saudação da Home.
            </p>
            <FInput value={nameForm} onChange={setNameForm} placeholder="Seu nome ou apelido" />
            <Btn onClick={saveName}>Salvar</Btn>
            <Btn variant="ghost" onClick={() => setSheet(null)}>Cancelar</Btn>
          </div>
        </Sheet>
      )}
    </div>
  );
}
