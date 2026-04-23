// src/screens/SaudeScreen.tsx — Tela de Saúde do VidaFlor v2
// Multi-perfil, água, ciclo, medicamentos, anotações.
// Zustand store — zero prop drilling.

import { useState } from "react";
import {
  Plus, Droplets, Heart, Sparkles, Settings, User, Trash2,
  Check, Pill, FileText, X,
} from "lucide-react";
import type { CycleConfig, ProfileType } from "@/types/data";
import { Card }         from "@/components/shared/Card";
import { Btn }          from "@/components/shared/Btn";
import { Sheet }        from "@/components/shared/Sheet";
import { FInput }       from "@/components/shared/FInput";
import { Chip }         from "@/components/shared/Chip";
import { Toggle }       from "@/components/shared/Toggle";
import { ProgressBar }  from "@/components/shared/ProgressBar";
import { ConfirmDel }   from "@/components/shared/ConfirmDel";
import { useSaudeStore }  from "@/stores/saudeStore";
import { today }          from "@/utils/date";
import { calcCycleState, cyclePhaseLabel } from "@/utils/cycle";

// ── Avatar fallback ──────────────────────────────────────────────────────────
const AV_MAP: Record<string, string> = { adult_f: "👩", adult_m: "👨", child: "🧒", pet: "🐾" };
function avatarFor(av: string, type: ProfileType): string {
  if (av && !/^[A-Z]/.test(av)) return av; // já é emoji
  return AV_MAP[type] ?? "👩";
}

// ── Constantes ───────────────────────────────────────────────────────────────
const WATER_AMOUNTS = [150, 250, 350, 500];
const PROFILE_TYPES: { key: ProfileType; label: string; av: string }[] = [
  { key: "adult_f", label: "Mulher",  av: "👩" },
  { key: "adult_m", label: "Homem",   av: "👨" },
  { key: "child",   label: "Criança", av: "🧒" },
  { key: "pet",     label: "Pet",     av: "🐾" },
];
const PROFILE_COLORS = [
  "var(--vf-palette-1)", "var(--vf-palette-2)", "var(--vf-palette-3)",
  "var(--vf-palette-4)", "var(--vf-palette-5)", "var(--vf-palette-6)",
];

type SheetKey = "editProfile" | "addProfile" | "addMed" | "delProfile" | "delMed" | null;

// ── Component ────────────────────────────────────────────────────────────────

export function SaudeScreen() {
  const day = today();

  // Store
  const profiles       = useSaudeStore(s => s.profiles);
  const activeProfile  = useSaudeStore(s => s.activeProfile);
  const profileAtivo   = useSaudeStore(s => s.profileAtivo);
  const switchProfile  = useSaudeStore(s => s.switchProfile);
  const adicionarPerfil= useSaudeStore(s => s.adicionarPerfil);
  const removerPerfil  = useSaudeStore(s => s.removerPerfil);
  const editarPerfil   = useSaudeStore(s => s.editarPerfil);
  const addWater       = useSaudeStore(s => s.addWater);
  const resetWater     = useSaudeStore(s => s.resetWater);
  const adicionarMed   = useSaudeStore(s => s.adicionarMed);
  const removerMed     = useSaudeStore(s => s.removerMed);
  const toggleMedLog   = useSaudeStore(s => s.toggleMedLog);
  const saveNote       = useSaudeStore(s => s.saveNote);

  const p = profileAtivo();

  // Local state
  const [sheet, setSheet] = useState<SheetKey>(null);
  const [editForm, setEditForm] = useState({ name: "", av: "", waterGoal: "", cycleLen: "", cycleMenses: "", cycleStart: "" });
  const [addForm, setAddForm] = useState({ name: "", type: "adult_f" as ProfileType, color: "#E8799A", waterGoal: "2000" });
  const [medForm, setMedForm] = useState({ name: "", dose: "", time: "08:00" });
  const [delMedId, setDelMedId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState(p?.notes[day] ?? "");

  if (!p) return null;

  // Derived
  const wNow  = p.water.log[day] ?? 0;
  const wGoal = p.water.goal;
  const wPct  = Math.min(100, Math.round((wNow / wGoal) * 100));
  const cyc   = p.cycle;
  const cycState = cyc ? calcCycleState(day, cyc.start, cyc.len, cyc.menses) : null;

  // Actions
  const openEditProfile = () => {
    setEditForm({
      name: p.name,
      av: avatarFor(p.av, p.type),
      waterGoal: String(p.water.goal),
      cycleLen: cyc ? String(cyc.len) : "28",
      cycleMenses: cyc ? String(cyc.menses) : "5",
      cycleStart: cyc ? cyc.start : today(),
    });
    setSheet("editProfile");
  };

  const saveEditProfile = () => {
    const updates: Parameters<typeof editarPerfil>[1] = {
      name: editForm.name || p.name,
      av: editForm.av || avatarFor(p.av, p.type),
      waterGoal: parseInt(editForm.waterGoal) || p.water.goal,
    };
    if (p.type === "adult_f") {
      updates.cycle = {
        start: editForm.cycleStart || cyc?.start || today(),
        len: parseInt(editForm.cycleLen) || 28,
        menses: parseInt(editForm.cycleMenses) || 5,
      };
    }
    editarPerfil(p.id, updates);
    setSheet(null);
  };

  const saveAddProfile = () => {
    if (!addForm.name.trim()) return;
    adicionarPerfil({
      name: addForm.name,
      av: AV_MAP[addForm.type] ?? "👩",
      type: addForm.type,
      color: addForm.color,
      waterGoal: parseInt(addForm.waterGoal) || 2000,
    });
    setAddForm({ name: "", type: "adult_f", color: "#E8799A", waterGoal: "2000" });
    setSheet(null);
  };

  const saveAddMed = () => {
    if (!medForm.name.trim()) return;
    adicionarMed(p.id, { name: medForm.name, dose: medForm.dose, time: medForm.time });
    setMedForm({ name: "", dose: "", time: "08:00" });
    setSheet(null);
  };

  const handleSaveNote = () => {
    saveNote(p.id, day, noteText);
  };

  return (
    <div style={{ padding: "24px 20px 20px" }}>

      {/* Cabeçalho */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, color: "var(--vf-tx)", fontSize: 22, fontWeight: 900 }}>Saúde</h2>
          <p style={{ margin: "2px 0 0", color: "var(--vf-tm)", fontSize: 13 }}>Cuide de quem você ama</p>
        </div>
        <button
          onClick={() => { setAddForm({ name: "", type: "adult_f", color: "#E8799A", waterGoal: "2000" }); setSheet("addProfile"); }}
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

      {/* Seletor de perfis */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
        {profiles.map(pr => (
          <button
            key={pr.id}
            onClick={() => switchProfile(pr.id)}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              padding: "10px 14px", borderRadius: 16,
              background: pr.id === activeProfile ? "var(--vf-p)" : "var(--vf-surf)",
              border: `1.5px solid ${pr.id === activeProfile ? "var(--vf-p)" : "var(--vf-bd)"}`,
              cursor: "pointer", flexShrink: 0, minWidth: 60,
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <span style={{ fontSize: 24 }}>{avatarFor(pr.av, pr.type)}</span>
            <span style={{
              fontSize: 11, fontWeight: 700,
              color: pr.id === activeProfile ? "#fff" : "var(--vf-tx)",
            }}>{pr.name}</span>
          </button>
        ))}
      </div>

      {/* Perfil ativo — header com ⚙️ */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 16, background: p.color,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
        }}>
          {avatarFor(p.av, p.type)}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "var(--vf-tx)" }}>{p.name}</p>
          <p style={{ margin: 0, fontSize: 12, color: "var(--vf-tm)" }}>
            {p.type === "adult_f" ? "Mulher" : p.type === "adult_m" ? "Homem" : p.type === "child" ? "Criança" : "Pet"}
          </p>
        </div>
        <button
          onClick={openEditProfile}
          style={{
            width: 44, height: 44, borderRadius: 14, background: "var(--vf-alt)",
            border: "none", display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", WebkitTapHighlightColor: "transparent",
          }}
        >
          <Settings size={18} color="var(--vf-tm)" />
        </button>
      </div>

      {/* ═══ Card Hidratação ═══ */}
      <Card style={{ marginBottom: 16, padding: "20px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12, background: "color-mix(in srgb, var(--vf-p) 12%, transparent)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Droplets size={20} color="var(--vf-p)" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "var(--vf-tx)" }}>Hidratação</p>
              <p style={{ margin: 0, fontSize: 12, color: "var(--vf-tm)" }}>{wNow}ml de {wGoal}ml</p>
            </div>
          </div>
          <span style={{ fontSize: 22, fontWeight: 900, color: wPct >= 100 ? "var(--vf-ok)" : "var(--vf-p)" }}>
            {wPct}%
          </span>
        </div>
        <ProgressBar color={wPct >= 100 ? "var(--vf-ok)" : "var(--vf-p)"} val={wNow} max={wGoal} h={8} />
        {wPct >= 100 && (
          <p style={{ margin: "10px 0 0", fontSize: 12, fontWeight: 700, color: "var(--vf-ok)" }}>
            Meta batida! Corpo hidratado 💧
          </p>
        )}
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          {WATER_AMOUNTS.map(ml => (
            <button
              key={ml}
              onClick={() => addWater(p.id, day, ml)}
              style={{
                flex: 1, padding: "10px 0", borderRadius: 12,
                background: "color-mix(in srgb, var(--vf-p) 10%, transparent)",
                border: "1px solid color-mix(in srgb, var(--vf-p) 20%, transparent)",
                color: "var(--vf-p)", fontWeight: 800, fontSize: 13, cursor: "pointer",
                fontFamily: "inherit", WebkitTapHighlightColor: "transparent",
              }}
            >
              +{ml}
            </button>
          ))}
        </div>
        {wNow > 0 && (
          <button
            onClick={() => resetWater(p.id, day)}
            style={{
              marginTop: 8, width: "100%", padding: "8px 0", borderRadius: 10,
              background: "transparent", border: "1px solid var(--vf-bd)",
              color: "var(--vf-tm)", fontSize: 12, fontWeight: 600, cursor: "pointer",
              fontFamily: "inherit", WebkitTapHighlightColor: "transparent",
            }}
          >
            Resetar água de hoje
          </button>
        )}
      </Card>

      {/* ═══ Card Ciclo (somente adult_f) ═══ */}
      {cyc && cycState && (
        <Card style={{ marginBottom: 16, padding: "20px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: "color-mix(in srgb, var(--vf-p) 12%, transparent)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {cycState.isFertil ? <Sparkles size={20} color="var(--vf-ok)" /> : <Heart size={20} color="var(--vf-p)" />}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "var(--vf-tx)" }}>Ciclo · Dia {cycState.dc + 1}</p>
              <p style={{ margin: 0, fontSize: 12, color: "var(--vf-tm)" }}>{cyclePhaseLabel(cycState)}</p>
            </div>
          </div>
          <ProgressBar color="var(--vf-p)" val={cycState.dc} max={cyc.len} h={6} />
          <p style={{ margin: "8px 0 0", fontSize: 11, color: "var(--vf-tm)" }}>
            Faltam {cycState.dl} dias para o próximo ciclo
          </p>
        </Card>
      )}

      {/* ═══ Card Medicamentos ═══ */}
      <Card style={{ marginBottom: 16, padding: "20px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: "color-mix(in srgb, var(--vf-p) 12%, transparent)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Pill size={20} color="var(--vf-p)" />
            </div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "var(--vf-tx)" }}>Medicamentos</p>
          </div>
          <button
            onClick={() => { setMedForm({ name: "", dose: "", time: "08:00" }); setSheet("addMed"); }}
            style={{
              width: 32, height: 32, borderRadius: 10, background: "var(--vf-p)",
              border: "none", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", WebkitTapHighlightColor: "transparent",
            }}
          >
            <Plus size={16} color="#fff" />
          </button>
        </div>

        {p.meds.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px 0", color: "var(--vf-tm)" }}>
            <p style={{ fontSize: 28, margin: "0 0 6px" }}>💊</p>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Nenhum medicamento cadastrado</p>
            <p style={{ margin: "4px 0 0", fontSize: 12 }}>Toque em + para adicionar</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {p.meds.map(m => {
              const taken = m.log[day] ?? false;
              return (
                <div key={m.id} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                  borderRadius: 14, background: "var(--vf-alt)",
                  border: `1px solid ${taken ? "var(--vf-ok)" : "var(--vf-bd)"}`,
                }}>
                  <button
                    onClick={() => toggleMedLog(p.id, m.id, day)}
                    style={{
                      width: 36, height: 36, borderRadius: 11,
                      background: taken ? "var(--vf-ok)" : "var(--vf-surf)",
                      border: "none", display: "flex", alignItems: "center",
                      justifyContent: "center", cursor: "pointer", flexShrink: 0,
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    {taken ? <Check size={18} color="#fff" /> : <Pill size={16} color="var(--vf-tm)" />}
                  </button>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--vf-tx)", textDecoration: taken ? "line-through" : "none", opacity: taken ? 0.6 : 1 }}>{m.name}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "var(--vf-tm)" }}>{m.dose} · {m.time}</p>
                  </div>
                  <button
                    onClick={() => { setDelMedId(m.id); setSheet("delMed"); }}
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
        )}
      </Card>

      {/* ═══ Anotação do dia ═══ */}
      <Card style={{ marginBottom: 16, padding: "20px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <FileText size={18} color="var(--vf-p)" />
          <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "var(--vf-tx)" }}>Anotação do dia</p>
        </div>
        <textarea
          value={noteText}
          onChange={e => setNoteText(e.target.value)}
          onBlur={handleSaveNote}
          placeholder="Como você está se sentindo hoje?"
          rows={3}
          style={{
            width: "100%", padding: "12px 14px", borderRadius: 14,
            border: "1.5px solid var(--vf-bd)", background: "var(--vf-alt)",
            color: "var(--vf-tx)", fontSize: 14, fontFamily: "inherit",
            resize: "vertical", outline: "none", boxSizing: "border-box",
          }}
        />
      </Card>

      {/* ════════════ SHEETS ════════════ */}

      {/* Editar Perfil */}
      {sheet === "editProfile" && (
        <Sheet title={`⚙️ Editar ${p.name}`} onClose={() => setSheet(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <FInput value={editForm.name} onChange={v => setEditForm(f => ({ ...f, name: v }))} placeholder="Nome" />
            <div>
              <p style={{ margin: "0 0 6px", fontSize: 12, color: "var(--vf-tm)", fontWeight: 600 }}>Avatar (emoji)</p>
              <FInput value={editForm.av} onChange={v => setEditForm(f => ({ ...f, av: v }))} placeholder="👩" />
            </div>
            <div>
              <p style={{ margin: "0 0 6px", fontSize: 12, color: "var(--vf-tm)", fontWeight: 600 }}>Meta de água (ml)</p>
              <FInput value={editForm.waterGoal} onChange={v => setEditForm(f => ({ ...f, waterGoal: v }))} type="number" />
            </div>
            {p.type === "adult_f" && (
              <>
                <p style={{ margin: "8px 0 4px", fontSize: 13, fontWeight: 800, color: "var(--vf-tx)" }}>🩸 Ciclo menstrual</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div>
                    <p style={{ margin: "0 0 6px", fontSize: 12, color: "var(--vf-tm)", fontWeight: 600 }}>Duração (dias)</p>
                    <FInput value={editForm.cycleLen} onChange={v => setEditForm(f => ({ ...f, cycleLen: v }))} type="number" />
                  </div>
                  <div>
                    <p style={{ margin: "0 0 6px", fontSize: 12, color: "var(--vf-tm)", fontWeight: 600 }}>Menstruação (dias)</p>
                    <FInput value={editForm.cycleMenses} onChange={v => setEditForm(f => ({ ...f, cycleMenses: v }))} type="number" />
                  </div>
                </div>
                <div>
                  <p style={{ margin: "0 0 6px", fontSize: 12, color: "var(--vf-tm)", fontWeight: 600 }}>Início do último ciclo</p>
                  <FInput value={editForm.cycleStart} onChange={v => setEditForm(f => ({ ...f, cycleStart: v }))} type="date" />
                </div>
              </>
            )}
            <Btn onClick={saveEditProfile}>Salvar alterações</Btn>
            {profiles.length > 1 && (
              <Btn variant="danger" onClick={() => setSheet("delProfile")}>Remover perfil</Btn>
            )}
          </div>
        </Sheet>
      )}

      {/* Adicionar Perfil */}
      {sheet === "addProfile" && (
        <Sheet title="Novo Perfil" onClose={() => setSheet(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <FInput value={addForm.name} onChange={v => setAddForm(f => ({ ...f, name: v }))} placeholder="Nome" />
            <div>
              <p style={{ margin: "0 0 6px", fontSize: 12, color: "var(--vf-tm)", fontWeight: 600 }}>Tipo</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {PROFILE_TYPES.map(t => (
                  <Chip key={t.key} active={addForm.type === t.key} onClick={() => setAddForm(f => ({ ...f, type: t.key }))}>
                    {t.av} {t.label}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <p style={{ margin: "0 0 6px", fontSize: 12, color: "var(--vf-tm)", fontWeight: 600 }}>Cor</p>
              <div style={{ display: "flex", gap: 8 }}>
                {PROFILE_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setAddForm(f => ({ ...f, color: c }))}
                    style={{
                      width: 38, height: 38, borderRadius: 99, background: c,
                      border: addForm.color === c ? "3px solid var(--vf-p)" : "2px solid transparent",
                      cursor: "pointer", WebkitTapHighlightColor: "transparent",
                    }}
                  />
                ))}
              </div>
            </div>
            <div>
              <p style={{ margin: "0 0 6px", fontSize: 12, color: "var(--vf-tm)", fontWeight: 600 }}>Meta de água (ml)</p>
              <FInput value={addForm.waterGoal} onChange={v => setAddForm(f => ({ ...f, waterGoal: v }))} type="number" />
            </div>
            <Btn onClick={saveAddProfile}>Criar perfil</Btn>
            <Btn variant="ghost" onClick={() => setSheet(null)}>Cancelar</Btn>
          </div>
        </Sheet>
      )}

      {/* Adicionar Medicamento */}
      {sheet === "addMed" && (
        <Sheet title="💊 Novo Medicamento" onClose={() => setSheet(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <FInput value={medForm.name} onChange={v => setMedForm(f => ({ ...f, name: v }))} placeholder="Nome do medicamento" />
            <FInput value={medForm.dose} onChange={v => setMedForm(f => ({ ...f, dose: v }))} placeholder="Dosagem (ex: 500mg)" />
            <FInput value={medForm.time} onChange={v => setMedForm(f => ({ ...f, time: v }))} placeholder="Horário" type="time" />
            <Btn onClick={saveAddMed}>Adicionar</Btn>
            <Btn variant="ghost" onClick={() => setSheet(null)}>Cancelar</Btn>
          </div>
        </Sheet>
      )}

      {/* Confirmar exclusão perfil */}
      {sheet === "delProfile" && (
        <ConfirmDel label={p.name} onCancel={() => setSheet("editProfile")} onConfirm={() => { removerPerfil(p.id); setSheet(null); }} />
      )}

      {/* Confirmar exclusão med */}
      {sheet === "delMed" && delMedId && (
        <ConfirmDel
          label={p.meds.find(m => m.id === delMedId)?.name ?? ""}
          onCancel={() => setSheet(null)}
          onConfirm={() => { removerMed(p.id, delMedId); setDelMedId(null); setSheet(null); }}
        />
      )}
    </div>
  );
}
