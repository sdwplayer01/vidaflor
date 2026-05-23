// src/screens/HomeScreen.tsx — Tela principal do VidaFlor v2
// Sem prop drilling — le tudo via selectors das features v2.

import {
  Sparkles, Droplets, Plus, Heart, DollarSign, Star,
  Bell, BellRing, AlertCircle, Flower,
} from "lucide-react";
import type { TabKey } from "@/features/nav/store";
import { Card }        from "@/shared/ui/Card";
import { ProgressBar } from "@/shared/ui/ProgressBar";
import { BloomCard }   from "@/features/bloom/components/BloomCard";

// Feature stores / selectors (v2)
import { useConfigStore }         from "@/features/config/store";
import { useProgressoDoDia }      from "@/features/rotina/selectors";
import { useAguaDoDia, usePerfilAtivo, useCicloAtual } from "@/features/saude/selectors";
import { useSaudeStore }          from "@/features/saude/store";
import { useSaldoDoMes, useProximasContas } from "@/features/financas/selectors";
import { useGratidoesDoDiaCount } from "@/features/espiritual/selectors";
import { useLembretesHoje }       from "@/features/organiza/selectors";

import { today, greet, turnoNow } from "@/shared/utils/date";
import { formatBRL }              from "@/shared/utils/money";

const TURNO_LABELS: Record<string, string> = {
  morning:   "Manha",
  afternoon: "Tarde",
  night:     "Noite",
};

interface HomeScreenProps {
  setTab: (t: TabKey) => void;
}

export function HomeScreen({ setTab }: HomeScreenProps) {
  const day = today();

  const cfg      = useConfigStore((s) => s.dash);
  const userName = useConfigStore((s) => s.name);

  const rotina = useProgressoDoDia(day);

  const agua          = useAguaDoDia();
  const perfil        = usePerfilAtivo();
  const ciclo         = useCicloAtual();
  const registrarAgua = useSaudeStore((s) => s.registrarAgua);

  const d   = new Date();
  const mes = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  const saldo        = useSaldoDoMes(mes);
  const proximasList = useProximasContas(7);

  const gratToday = useGratidoesDoDiaCount();

  const lembretesHoje    = useLembretesHoje();
  const pendingReminders = lembretesHoje.filter((r) => !r.done).length;

  const nextDue = proximasList[0];

  const handleAddWater = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (perfil) registrarAgua(perfil.id, day, 250);
  };

  return (
    <div style={{ padding: "24px 20px 20px" }}>

      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 20,
      }}>
        <div>
          <h2 style={{ margin: 0, color: "var(--vf-tx)", fontSize: 26, fontWeight: 900 }}>
            {greet()}, {userName}
          </h2>
          <p style={{ margin: "2px 0 0", color: "var(--vf-tm)", fontSize: 14 }}>
            {TURNO_LABELS[turnoNow()] ?? ""}
          </p>
        </div>
        <div style={{
          width: 52, height: 52, borderRadius: 18, background: "var(--vf-gh)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "var(--vf-shadow-btn)",
        }}>
          <Flower size={28} color="#fff" />
        </div>
      </div>

      {/* Bloom Card */}
      {cfg.bloom && (
        <div style={{ marginBottom: 20 }}>
          <BloomCard />
        </div>
      )}

      {/* Badges contextuais */}
      <div style={{
        display: "flex", gap: 10, marginBottom: 20,
        overflowX: "auto", paddingBottom: 4,
      }}>
        {ciclo?.isTPM && (
          <div
            onClick={() => setTab("saude")}
            style={{
              background: "color-mix(in srgb, var(--vf-er) 15%, transparent)",
              padding: "8px 14px", borderRadius: 14,
              border: "1px solid var(--vf-er)",
              display: "flex", alignItems: "center", gap: 6,
              flexShrink: 0, cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--vf-er)" }}>
              Fase Lutea ({ciclo.diasParaProximo}d)
            </span>
          </div>
        )}
        {pendingReminders > 0 && (
          <div
            onClick={() => setTab("organiza")}
            style={{
              background: "color-mix(in srgb, var(--vf-wn) 12%, transparent)",
              padding: "8px 14px", borderRadius: 14,
              border: "1px solid color-mix(in srgb, var(--vf-wn) 25%, transparent)",
              display: "flex", alignItems: "center", gap: 6,
              flexShrink: 0, cursor: "pointer",
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

      {/* Dashboard Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

        {/* Hidratacao */}
        {cfg.water && (
          <Card onClick={() => setTab("saude")}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 11, background: "var(--vf-alt)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Droplets size={18} color="var(--vf-p)" />
              </div>
              <button
                onClick={handleAddWater}
                style={{
                  width: 26, height: 26, borderRadius: 9, background: "var(--vf-p)",
                  border: "none", display: "flex", alignItems: "center",
                  justifyContent: "center", cursor: "pointer",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <Plus size={14} color="#fff" />
              </button>
            </div>
            <p style={{ margin: 0, fontSize: 11, color: "var(--vf-tm)", fontWeight: 700 }}>
              HIDRATACAO
            </p>
            <p style={{ margin: "3px 0 8px", fontSize: 20, fontWeight: 900, color: "var(--vf-tx)" }}>
              {agua.pct}%
            </p>
            <ProgressBar color="var(--vf-p)" val={agua.atual} max={agua.meta} h={6} />
          </Card>
        )}

        {/* Ciclo */}
        {cfg.cycle && perfil?.type === "adult_f" && ciclo && (
          <Card onClick={() => setTab("saude")}>
            <div style={{
              width: 34, height: 34, borderRadius: 11, background: "var(--vf-alt)",
              display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12,
            }}>
              {ciclo.isFertil
                ? <Sparkles size={18} color="var(--vf-p)" />
                : <Heart size={18} color="var(--vf-p)" />
              }
            </div>
            <p style={{ margin: 0, fontSize: 11, color: "var(--vf-tm)", fontWeight: 700 }}>
              CICLO
            </p>
            <p style={{ margin: "3px 0 0", fontSize: 20, fontWeight: 900, color: "var(--vf-tx)" }}>
              Dia {ciclo.diaCiclo + 1}
            </p>
            <p style={{
              margin: 0, fontSize: 11, fontWeight: 700,
              color: ciclo.isFertil ? "var(--vf-ok)" : "var(--vf-tm)",
            }}>
              {ciclo.isFertil ? "Periodo Fertil" : `Faltam ${ciclo.diasParaProximo}d`}
            </p>
          </Card>
        )}

        {/* Rotina */}
        {cfg.routine && (
          <Card onClick={() => setTab("rotina")} style={{ gridColumn: "span 2" }}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: 12,
            }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 900, color: "var(--vf-tx)" }}>
                Rotina de Hoje
              </p>
              <span style={{
                fontSize: 12, color: "var(--vf-tm)", fontWeight: 700,
                background: "var(--vf-alt)", padding: "3px 10px", borderRadius: 99,
              }}>
                {rotina.feitas}/{rotina.total}
              </span>
            </div>
            <ProgressBar color="var(--vf-p)" val={rotina.feitas} max={rotina.total} h={10} />
          </Card>
        )}

        {/* Financas */}
        {cfg.finance && (
          <Card onClick={() => setTab("financas")} style={{ gridColumn: "span 2" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ margin: 0, fontSize: 11, color: "var(--vf-tm)", fontWeight: 700 }}>
                  SALDO DO MES
                </p>
                <p style={{ margin: "3px 0 0", fontSize: 24, fontWeight: 900, color: "var(--vf-tx)" }}>
                  {formatBRL(saldo.saldo)}
                </p>
                {nextDue && (
                  <p style={{
                    margin: "4px 0 0", fontSize: 11, color: "var(--vf-er)", fontWeight: 700,
                    display: "flex", alignItems: "center", gap: 4,
                  }}>
                    <AlertCircle size={11} />
                    Vence: {nextDue.desc} ({formatBRL(nextDue.amount)})
                  </p>
                )}
              </div>
              <div style={{
                width: 46, height: 46, borderRadius: 14, background: "var(--vf-alt)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <DollarSign size={22} color="var(--vf-p)" />
              </div>
            </div>
          </Card>
        )}

        {/* Conexao Espiritual */}
        {cfg.spirit && (
          <Card onClick={() => setTab("espiritual")}>
            <div style={{
              width: 34, height: 34, borderRadius: 11, background: "var(--vf-alt)",
              display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12,
            }}>
              <Star size={18} color="var(--vf-p)" />
            </div>
            <p style={{ margin: 0, fontSize: 11, color: "var(--vf-tm)", fontWeight: 700 }}>
              CONEXAO
            </p>
            <p style={{ margin: "3px 0 0", fontSize: 14, fontWeight: 800, color: "var(--vf-tx)" }}>
              {gratToday} {gratToday === 1 ? "gratidao" : "gratidoes"}
            </p>
          </Card>
        )}

        {/* Lembretes */}
        {cfg.reminders && (
          <Card onClick={() => setTab("organiza")}>
            <div style={{
              width: 34, height: 34, borderRadius: 11, background: "var(--vf-alt)",
              display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12,
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
              margin: "3px 0 0", fontSize: 14, fontWeight: 800,
              color: pendingReminders > 0 ? "var(--vf-wn)" : "var(--vf-tx)",
            }}>
              {pendingReminders} hoje
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
