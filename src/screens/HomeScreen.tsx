// src/screens/HomeScreen.tsx — Tela principal do VidaFlor v2
// Sem prop drilling — lê tudo via Zustand stores + hooks derivados.
// Bloom flower com scale animada, badges clicáveis, microcopy pt-BR.

import { useState, useEffect } from "react";
import {
  Sparkles, X, Droplets, Plus, Heart, DollarSign, Star,
  Bell, BellRing, Calendar, AlertCircle,
  Flower,
} from "lucide-react";
import type { TabKey } from "@/types/data";
import { Card }          from "@/components/shared/Card";
import { ProgressBar }   from "@/components/shared/ProgressBar";
import { BloomFlower }   from "@/components/bloom/BloomFlower";
import { useConfigStore }   from "@/stores/configStore";
import { useRotinaStore }   from "@/stores/rotinaStore";
import { useSaudeStore }    from "@/stores/saudeStore";
import { useFinancasStore } from "@/stores/financasStore";
import { useEspiritStore }  from "@/stores/espiritStore";
import { useOrganizaStore } from "@/stores/organizaStore";
import { useBloomPct }      from "@/stores/bloomStore";
import { today, greet, turnoNow, fmtBRL, currentMonth } from "@/utils/date";
import { calcCycleState } from "@/utils/cycle";

// ── Microcopy ────────────────────────────────────────────────────────────────

const MSG = {
  BLOOM: {
    INICIO:     "Começando a brotar... 💧",
    MEIO:       "Quase lá, continue! 🌱",
    TOTAL:      "Florescimento Total! ✨",
    CELEBRACAO: "Você completou sua flor do dia!",
  },
} as const;

const TURNO_LABELS: Record<string, string> = {
  morning:   "Manhã 🌅",
  afternoon: "Tarde ☀️",
  night:     "Noite 🌙",
};



// ── Component ────────────────────────────────────────────────────────────────

interface HomeScreenProps {
  setTab: (t: TabKey) => void;
}

export function HomeScreen({ setTab }: HomeScreenProps) {
  const day = today();
  const mes = currentMonth();

  // ── Stores ──────────────────────────────────────────────────────────────────
  const cfg          = useConfigStore((s) => s.dash);
  const userName     = useConfigStore((s) => s.name);
  const bloomPct     = useBloomPct();

  const morning      = useRotinaStore((s) => s.morning);
  const afternoon    = useRotinaStore((s) => s.afternoon);
  const night        = useRotinaStore((s) => s.night);
  const essential    = useRotinaStore((s) => s.essential);
  const essMode      = useRotinaStore((s) => s.essMode);
  const routineDone  = useRotinaStore((s) => s.done);

  const profileAtivo = useSaudeStore((s) => s.profileAtivo);
  const addWater     = useSaudeStore((s) => s.addWater);

  const saldoMes     = useFinancasStore((s) => s.saldoMes);
  const proximaVencer= useFinancasStore((s) => s.proximaVencer);

  const gratCount    = useEspiritStore((s) => s.gratitudeCount);

  const remPendentes = useOrganizaStore((s) => s.remindersPendentes);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const mainP    = profileAtivo();
  const wNow     = mainP?.water.log[day] ?? 0;
  const wGoal    = mainP?.water.goal ?? 2000;
  const wPct     = Math.min(100, Math.round((wNow / wGoal) * 100));

  const allTasks = essMode
    ? essential
    : [...morning, ...afternoon, ...night];
  const doneIds  = routineDone[day] ?? [];

  const bal      = saldoMes(mes);
  const nextDue  = proximaVencer(mes);

  const cyc       = mainP?.cycle;
  const showCycle = !!cyc;
  const cycState  = showCycle
    ? calcCycleState(day, cyc!.start, cyc!.len, cyc!.menses)
    : null;

  const pendingReminders = remPendentes(day);
  const gratToday        = gratCount(day);

  // ── Celebração ──────────────────────────────────────────────────────────────
  const [celebrated, setCelebrated] = useState(false);

  useEffect(() => {
    if (bloomPct >= 100 && !celebrated) setCelebrated(true);
  }, [bloomPct, celebrated]);

  // ── Quick Action: água ──────────────────────────────────────────────────────
  const handleAddWater = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mainP) addWater(mainP.id, day, 250);
  };

  return (
    <div style={{ padding: "24px 20px 20px" }}>

      {/* ═══ Banner de celebração (100% bloom) ═══ */}
      {celebrated && (
        <div style={{
          background: "var(--vf-gh)",
          borderRadius: 20,
          padding: "16px 20px",
          marginBottom: 20,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          gap: 12,
          position: "relative",
          overflow: "hidden",
          animation: "pulse 2s infinite",
        }}>
          <Sparkles size={28} color="#fff" />
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 900, fontSize: 16 }}>
              {MSG.BLOOM.TOTAL}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 12, opacity: 0.9 }}>
              {MSG.BLOOM.CELEBRACAO}
            </p>
          </div>
          <button
            onClick={() => setCelebrated(false)}
            style={{
              background: "rgba(255,255,255,.2)",
              border: "none",
              borderRadius: 99,
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <X size={14} color="#fff" />
          </button>
        </div>
      )}

      {/* ═══ Header — Saudação ═══ */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
      }}>
        <div>
          <h2 style={{
            margin: 0,
            color: "var(--vf-tx)",
            fontSize: 26,
            fontWeight: 900,
          }}>
            {greet()}, {userName}
          </h2>
          <p style={{
            margin: "2px 0 0",
            color: "var(--vf-tm)",
            fontSize: 14,
          }}>
            {TURNO_LABELS[turnoNow()] ?? ""}
          </p>
        </div>
        <div style={{
          width: 52,
          height: 52,
          borderRadius: 18,
          background: "var(--vf-gh)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
          boxShadow: "var(--vf-shadow-btn)",
        }}>
          <Flower size={28} color="#fff" />
        </div>
      </div>

      {/* ═══ Bloom Card ═══ */}
      {cfg.bloom && (
        <div style={{ marginBottom: 20 }}>
          <BloomFlower pct={bloomPct} />
        </div>
      )}

      {/* ═══ Badges contextuais — todos clicáveis com setTab ═══ */}
      <div style={{
        display: "flex",
        gap: 10,
        marginBottom: 20,
        overflowX: "auto",
        paddingBottom: 4,
      }}>
        {/* Badge: TPM */}
        {cycState?.isTPM && (
          <div
            onClick={() => setTab("saude")}
            style={{
              background: "color-mix(in srgb, var(--vf-er) 15%, transparent)",
              padding: "8px 14px",
              borderRadius: 14,
              border: "1px solid var(--vf-er)",
              display: "flex",
              alignItems: "center",
              gap: 6,
              flexShrink: 0,
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--vf-er)" }}>
              Fase Lútea ({cycState.dl}d)
            </span>
          </div>
        )}

        {/* Badge: Lembretes pendentes */}
        {pendingReminders > 0 && (
          <div
            onClick={() => setTab("organiza")}
            style={{
              background: "color-mix(in srgb, var(--vf-wn) 12%, transparent)",
              padding: "8px 14px",
              borderRadius: 14,
              border: "1px solid color-mix(in srgb, var(--vf-wn) 25%, transparent)",
              display: "flex",
              alignItems: "center",
              gap: 6,
              flexShrink: 0,
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <BellRing size={14} color="var(--vf-wn)" />
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--vf-wn)" }}>
              {pendingReminders} {pendingReminders === 1 ? "alerta" : "alertas"}
            </span>
          </div>
        )}
      </div>

      {/* ═══ Dashboard Cards ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

        {/* Card: Hidratação */}
        {cfg.water && (
          <Card onClick={() => setTab("saude")}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{
                width: 34,
                height: 34,
                borderRadius: 11,
                background: "var(--vf-alt)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Droplets size={18} color="var(--vf-p)" />
              </div>
              <button
                onClick={handleAddWater}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 9,
                  background: "var(--vf-p)",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <Plus size={14} color="#fff" />
              </button>
            </div>
            <p style={{ margin: 0, fontSize: 11, color: "var(--vf-tm)", fontWeight: 700 }}>
              HIDRATAÇÃO
            </p>
            <p style={{ margin: "3px 0 8px", fontSize: 20, fontWeight: 900, color: "var(--vf-tx)" }}>
              {wPct}%
            </p>
            <ProgressBar color="var(--vf-p)" val={wNow} max={wGoal} h={6} />
          </Card>
        )}

        {/* Card: Ciclo */}
        {cfg.cycle && showCycle && cycState && (
          <Card onClick={() => setTab("saude")}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 11,
              background: "var(--vf-alt)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
            }}>
              {cycState.isFertil
                ? <Sparkles size={18} color="var(--vf-p)" />
                : <Heart size={18} color="var(--vf-p)" />
              }
            </div>
            <p style={{ margin: 0, fontSize: 11, color: "var(--vf-tm)", fontWeight: 700 }}>
              CICLO
            </p>
            <p style={{ margin: "3px 0 0", fontSize: 20, fontWeight: 900, color: "var(--vf-tx)" }}>
              Dia {cycState.dc + 1}
            </p>
            <p style={{
              margin: 0,
              fontSize: 11,
              color: cycState.isFertil ? "var(--vf-ok)" : "var(--vf-tm)",
              fontWeight: 700,
            }}>
              {cycState.isFertil ? "Período Fértil" : `Faltam ${cycState.dl}d`}
            </p>
          </Card>
        )}

        {/* Card: Rotina */}
        {cfg.routine && (
          <Card onClick={() => setTab("rotina")} style={{ gridColumn: "span 2" }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 900, color: "var(--vf-tx)" }}>
                📋 Rotina de Hoje
              </p>
              <span style={{
                fontSize: 12,
                color: "var(--vf-tm)",
                fontWeight: 700,
                background: "var(--vf-alt)",
                padding: "3px 10px",
                borderRadius: 99,
              }}>
                {doneIds.length}/{allTasks.length}
              </span>
            </div>
            <ProgressBar color="var(--vf-p)" val={doneIds.length} max={allTasks.length} h={10} />
          </Card>
        )}

        {/* Card: Finanças */}
        {cfg.finance && (
          <Card onClick={() => setTab("financas")} style={{ gridColumn: "span 2" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ margin: 0, fontSize: 11, color: "var(--vf-tm)", fontWeight: 700 }}>
                  SALDO DO MÊS
                </p>
                <p style={{ margin: "3px 0 0", fontSize: 24, fontWeight: 900, color: "var(--vf-tx)" }}>
                  R$ {fmtBRL(bal)}
                </p>
                {nextDue && (
                  <p style={{
                    margin: "4px 0 0",
                    fontSize: 11,
                    color: "var(--vf-er)",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}>
                    <AlertCircle size={11} />
                    Vence: {nextDue.desc} (R$ {fmtBRL(nextDue.val)})
                  </p>
                )}
              </div>
              <div style={{
                width: 46,
                height: 46,
                borderRadius: 14,
                background: "var(--vf-alt)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <DollarSign size={22} color="var(--vf-p)" />
              </div>
            </div>
          </Card>
        )}

        {/* Card: Conexão Espiritual */}
        {cfg.spirit && (
          <Card onClick={() => setTab("espiritual")}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 11,
              background: "var(--vf-alt)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
            }}>
              <Star size={18} color="var(--vf-p)" />
            </div>
            <p style={{ margin: 0, fontSize: 11, color: "var(--vf-tm)", fontWeight: 700 }}>
              CONEXÃO
            </p>
            <p style={{ margin: "3px 0 0", fontSize: 14, fontWeight: 800, color: "var(--vf-tx)" }}>
              {gratToday} {gratToday === 1 ? "gratidão" : "gratidões"}
            </p>
          </Card>
        )}

        {/* Card: Lembretes */}
        {cfg.reminders && (
          <Card onClick={() => setTab("organiza")}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 11,
              background: "var(--vf-alt)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
            }}>
              {pendingReminders > 0
                ? <Bell size={18} color="var(--vf-wn)" />
                : <Bell size={18} color="var(--vf-p)" />
              }
            </div>
            <p style={{ margin: 0, fontSize: 11, color: "var(--vf-tm)", fontWeight: 700 }}>
              LEMBRETES
            </p>
            <p style={{
              margin: "3px 0 0",
              fontSize: 14,
              fontWeight: 800,
              color: pendingReminders > 0 ? "var(--vf-wn)" : "var(--vf-tx)",
            }}>
              {pendingReminders} hoje
            </p>
          </Card>
        )}
      </div>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.01); }
        }
      `}</style>
    </div>
  );
}
