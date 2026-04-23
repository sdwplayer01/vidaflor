// src/screens/RotinaScreen.tsx — Tela de Rotina do VidaFlor v2
// 3 turnos + modo essencial + CRUD completo.

import { useState } from "react";
import {
  Plus, Check, Trash2, Sunrise, Sun, Moon, Zap, X,
} from "lucide-react";
import type { RotinaTarefa } from "@/types/data";
import { Card } from "@/components/shared/Card";
import { Btn } from "@/components/shared/Btn";
import { Sheet } from "@/components/shared/Sheet";
import { FInput } from "@/components/shared/FInput";
import { Chip } from "@/components/shared/Chip";
import { Toggle } from "@/components/shared/Toggle";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { ConfirmDel } from "@/components/shared/ConfirmDel";
import { useRotinaStore } from "@/stores/rotinaStore";
import { today } from "@/utils/date";

// ── Tipos ────────────────────────────────────────────────────────────────────

type Turno = "morning" | "afternoon" | "night" | "essential";
type SheetKey = "addTask" | "delTask" | null;

const TURNO_META: { key: Turno; label: string; icon: typeof Sunrise; emoji: string }[] = [
  { key: "morning", label: "Manhã", icon: Sunrise, emoji: "🌅" },
  { key: "afternoon", label: "Tarde", icon: Sun, emoji: "☀️" },
  { key: "night", label: "Noite", icon: Moon, emoji: "🌙" },
];

// ── Component ────────────────────────────────────────────────────────────────

export function RotinaScreen() {
  const day = today();

  // Store
  const morning = useRotinaStore(s => s.morning);
  const afternoon = useRotinaStore(s => s.afternoon);
  const night = useRotinaStore(s => s.night);
  const essential = useRotinaStore(s => s.essential);
  const essMode = useRotinaStore(s => s.essMode);
  const done = useRotinaStore(s => s.done);
  const toggleTarefa = useRotinaStore(s => s.toggleTarefa);
  const adicionarTarefa = useRotinaStore(s => s.adicionarTarefa);
  const removerTarefa = useRotinaStore(s => s.removerTarefa);
  const toggleEssMode = useRotinaStore(s => s.toggleEssMode);

  const turnoData: Record<Turno, RotinaTarefa[]> = { morning, afternoon, night, essential };
  const doneIds = done[day] ?? [];

  const allTasks = essMode ? essential : [...morning, ...afternoon, ...night];
  const totalPct = allTasks.length > 0 ? Math.round((doneIds.length / allTasks.length) * 100) : 0;

  // Local state
  const [sheet, setSheet] = useState<SheetKey>(null);
  const [addTurno, setAddTurno] = useState<Turno>("morning");
  const [addForm, setAddForm] = useState({ task: "", time: "" });
  const [delTarget, setDelTarget] = useState<{ turno: Turno; id: number; name: string } | null>(null);

  const saveTask = () => {
    if (!addForm.task.trim()) return;
    adicionarTarefa(addTurno, { task: addForm.task, time: addForm.time });
    setAddForm({ task: "", time: "" });
    setSheet(null);
  };

  const confirmDel = () => {
    if (delTarget) {
      removerTarefa(delTarget.turno, delTarget.id);
      setDelTarget(null);
      setSheet(null);
    }
  };

  function renderTasks(turno: Turno, tasks: RotinaTarefa[]) {
    if (tasks.length === 0) {
      return (
        <div style={{ textAlign: "center", padding: "20px 0", color: "var(--vf-tm)" }}>
          <p style={{ margin: 0, fontSize: 13 }}>Sem tarefas neste turno — toque em + para adicionar</p>
        </div>
      );
    }
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {tasks.map(t => {
          const isDone = doneIds.includes(t.id);
          return (
            <div key={t.id} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
              borderRadius: 14, background: "var(--vf-alt)",
              border: `1px solid ${isDone ? "var(--vf-ok)" : "var(--vf-bd)"}`,
              transition: "all .2s",
            }}>
              <button
                onClick={() => toggleTarefa(day, t.id)}
                style={{
                  width: 36, height: 36, borderRadius: 11,
                  background: isDone ? "var(--vf-ok)" : "var(--vf-surf)",
                  border: isDone ? "none" : "1.5px solid var(--vf-bd)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", flexShrink: 0, WebkitTapHighlightColor: "transparent",
                }}
              >
                {isDone && <Check size={18} color="#fff" />}
              </button>
              <div style={{ flex: 1 }}>
                <p style={{
                  margin: 0, fontSize: 14, fontWeight: 700, color: "var(--vf-tx)",
                  textDecoration: isDone ? "line-through" : "none", opacity: isDone ? 0.5 : 1,
                }}>{t.task}</p>
                {t.time && <p style={{ margin: 0, fontSize: 11, color: "var(--vf-tm)" }}>{t.time}</p>}
              </div>
              <button
                onClick={() => { setDelTarget({ turno, id: t.id, name: t.task }); setSheet("delTask"); }}
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: "color-mix(in srgb, var(--vf-er) 10%, transparent)",
                  border: "none", display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", WebkitTapHighlightColor: "transparent",
                }}
              >
                <Trash2 size={13} color="var(--vf-er)" />
              </button>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 20px 20px" }}>

      {/* Cabeçalho */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, color: "var(--vf-tx)", fontSize: 22, fontWeight: 900 }}>Rotina</h2>
          <p style={{ margin: "2px 0 0", color: "var(--vf-tm)", fontSize: 13 }}>Um passo de cada vez</p>
        </div>
        <button
          onClick={() => { setAddTurno(essMode ? "essential" : "morning"); setAddForm({ task: "", time: "" }); setSheet("addTask"); }}
          style={{
            width: 44, height: 44, borderRadius: 14, background: "var(--vf-p)",
            border: "none", color: "#fff", display: "flex", alignItems: "center",
            justifyContent: "center", cursor: "pointer", boxShadow: "var(--vf-shadow-btn)",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <Plus size={22} />
        </button>
      </div>

      {/* Progresso geral */}
      <Card hero style={{ marginBottom: 18, padding: "22px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, opacity: 0.9 }}>PROGRESSO DO DIA</p>
          <span style={{ fontSize: 16, fontWeight: 900 }}>{doneIds.length}/{allTasks.length}</span>
        </div>
        <div style={{
          height: 10, background: "rgba(255,255,255,.25)", borderRadius: 99, overflow: "hidden",
        }}>
          <div style={{
            height: "100%", width: `${totalPct}%`, background: "#fff",
            borderRadius: 99, transition: "width .5s ease",
          }} />
        </div>
        {totalPct >= 100 && (
          <p style={{ margin: "10px 0 0", fontSize: 12, fontWeight: 700, opacity: 0.9 }}>
            Turno concluído! ✅
          </p>
        )}
      </Card>

      {/* Toggle Modo Essencial */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "14px 16px", borderRadius: 16, background: "var(--vf-alt)",
        marginBottom: 18, border: "1px solid var(--vf-bd)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Zap size={18} color={essMode ? "var(--vf-wn)" : "var(--vf-tm)"} />
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--vf-tx)" }}>Modo dias difíceis</p>
            <p style={{ margin: 0, fontSize: 11, color: "var(--vf-tm)" }}>
              {essMode ? "Modo dias difíceis ativado ⚡" : "Apenas o essencial"}
            </p>
          </div>
        </div>
        <Toggle val={essMode} onChange={toggleEssMode} />
      </div>

      {/* Turnos ou Essencial */}
      {essMode ? (
        <Card style={{ padding: "18px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Zap size={18} color="var(--vf-wn)" />
            <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "var(--vf-tx)" }}>Essencial</p>
          </div>
          {renderTasks("essential", essential)}
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {TURNO_META.map(({ key, label, icon: Icon, emoji }) => (
            <Card key={key} style={{ padding: "18px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <Icon size={18} color="var(--vf-p)" />
                <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "var(--vf-tx)" }}>{emoji} {label}</p>
                <span style={{
                  marginLeft: "auto", fontSize: 11, fontWeight: 700, color: "var(--vf-tm)",
                  background: "var(--vf-alt)", padding: "3px 8px", borderRadius: 99,
                }}>
                  {turnoData[key].filter(t => doneIds.includes(t.id)).length}/{turnoData[key].length}
                </span>
              </div>
              {renderTasks(key, turnoData[key])}
            </Card>
          ))}
        </div>
      )}

      {/* ════════════ SHEETS ════════════ */}

      {sheet === "addTask" && (
        <Sheet title="Nova Tarefa" onClose={() => setSheet(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <FInput value={addForm.task} onChange={v => setAddForm(f => ({ ...f, task: v }))} placeholder="O que você precisa fazer?" />
            {!essMode && (
              <FInput value={addForm.time} onChange={v => setAddForm(f => ({ ...f, time: v }))} placeholder="Horário" type="time" />
            )}
            {!essMode && (
              <div>
                <p style={{ margin: "0 0 6px", fontSize: 12, color: "var(--vf-tm)", fontWeight: 600 }}>Turno</p>
                <div style={{ display: "flex", gap: 6 }}>
                  {TURNO_META.map(t => (
                    <Chip key={t.key} active={addTurno === t.key} onClick={() => setAddTurno(t.key)}>
                      {t.emoji} {t.label}
                    </Chip>
                  ))}
                </div>
              </div>
            )}
            <Btn onClick={saveTask}>Adicionar tarefa</Btn>
            <Btn variant="ghost" onClick={() => setSheet(null)}>Cancelar</Btn>
          </div>
        </Sheet>
      )}

      {sheet === "delTask" && delTarget && (
        <ConfirmDel label={delTarget.name} onCancel={() => setSheet(null)} onConfirm={confirmDel} />
      )}
    </div>
  );
}
