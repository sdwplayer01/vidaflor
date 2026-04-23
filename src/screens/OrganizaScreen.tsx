// src/screens/OrganizaScreen.tsx — Tela de Organização do VidaFlor v2
// 3 tabs: Compras · Notas · Lembretes. CRUD completo.

import { useState } from "react";
import {
  Plus, Check, Trash2, ShoppingCart, StickyNote, Bell,
  Send, Eraser,
} from "lucide-react";
import type { Priority } from "@/types/data";
import { Card }         from "@/components/shared/Card";
import { Btn }          from "@/components/shared/Btn";
import { Sheet }        from "@/components/shared/Sheet";
import { FInput }       from "@/components/shared/FInput";
import { Chip }         from "@/components/shared/Chip";
import { ConfirmDel }   from "@/components/shared/ConfirmDel";
import { useOrganizaStore } from "@/stores/organizaStore";
import { today } from "@/utils/date";

// ── Tipos locais ─────────────────────────────────────────────────────────────

type SubTab = "compras" | "notas" | "lembretes";
type SheetKey =
  | "addItem" | "addNota" | "addLembrete" | "editNota"
  | "delItem" | "delNota" | "delLembrete"
  | null;

const SHOP_CATS  = ["🛒 Mercado", "🧴 Higiene", "🧹 Limpeza", "👗 Roupas", "💊 Farmácia", "📦 Outros"];
const NOTE_COLORS = [
  "var(--vf-palette-5)", "var(--vf-palette-3)", "var(--vf-palette-2)",
  "var(--vf-palette-4)", "var(--vf-palette-6)", "var(--vf-palette-7)",
];
const PRIORITIES: { key: Priority; label: string; emoji: string }[] = [
  { key: "alta",  label: "Alta",  emoji: "🔴" },
  { key: "media", label: "Média", emoji: "🟡" },
  { key: "baixa", label: "Baixa", emoji: "🟢" },
];

// ── Component ────────────────────────────────────────────────────────────────

export function OrganizaScreen() {
  const day = today();

  // Store
  const shopping         = useOrganizaStore(s => s.shopping);
  const notes            = useOrganizaStore(s => s.notes);
  const reminders        = useOrganizaStore(s => s.reminders);
  const adicionarItem    = useOrganizaStore(s => s.adicionarItem);
  const removerItem      = useOrganizaStore(s => s.removerItem);
  const toggleItemDone   = useOrganizaStore(s => s.toggleItemDone);
  const limparComprados  = useOrganizaStore(s => s.limparComprados);
  const adicionarNota    = useOrganizaStore(s => s.adicionarNota);
  const removerNota      = useOrganizaStore(s => s.removerNota);
  const editarNota       = useOrganizaStore(s => s.editarNota);
  const adicionarLembrete  = useOrganizaStore(s => s.adicionarLembrete);
  const removerLembrete    = useOrganizaStore(s => s.removerLembrete);
  const toggleLembreteDone = useOrganizaStore(s => s.toggleLembreteDone);

  // Local state
  const [sub, setSub]     = useState<SubTab>("compras");
  const [sheet, setSheet] = useState<SheetKey>(null);

  // Forms as single objects
  const [itemForm, setItemForm]     = useState({ name: "", cat: "🛒 Mercado" });
  const [noteForm, setNoteForm]     = useState({ title: "", content: "", color: "#FFE082" });
  const [lemForm, setLemForm]       = useState({ title: "", time: "09:00", date: day, cat: "📋 Geral", priority: "media" as Priority });
  const [editNoteForm, setEditNoteForm] = useState({ id: 0, title: "", content: "", color: "#FFE082" });

  // Delete targets
  const [delItemId, setDelItemId]   = useState<number | null>(null);
  const [delNoteId, setDelNoteId]   = useState<number | null>(null);
  const [delLemId, setDelLemId]     = useState<number | null>(null);

  // Derived
  const pendingCount  = shopping.filter(i => !i.done).length;
  const doneCount     = shopping.filter(i => i.done).length;

  // ── Actions ────────────────────────────────────────────────────────────────

  const saveItem = () => {
    if (!itemForm.name.trim()) return;
    adicionarItem({ name: itemForm.name, cat: itemForm.cat });
    setItemForm({ name: "", cat: itemForm.cat });
    setSheet(null);
  };

  const saveNota = () => {
    if (!noteForm.title.trim()) return;
    adicionarNota({ title: noteForm.title, content: noteForm.content, color: noteForm.color });
    setNoteForm({ title: "", content: "", color: "#FFE082" });
    setSheet(null);
  };

  const saveEditNota = () => {
    editarNota(editNoteForm.id, { title: editNoteForm.title, content: editNoteForm.content, color: editNoteForm.color });
    setSheet(null);
  };

  const saveLembrete = () => {
    if (!lemForm.title.trim()) return;
    adicionarLembrete({ title: lemForm.title, time: lemForm.time, date: lemForm.date, cat: lemForm.cat, priority: lemForm.priority });
    setLemForm({ title: "", time: "09:00", date: day, cat: "📋 Geral", priority: "media" });
    setSheet(null);
  };

  return (
    <div style={{ padding: "24px 20px 20px" }}>

      {/* Cabeçalho */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, color: "var(--vf-tx)", fontSize: 22, fontWeight: 900 }}>Organização</h2>
          <p style={{ margin: "2px 0 0", color: "var(--vf-tm)", fontSize: 13 }}>Tudo no lugar, tudo em paz</p>
        </div>
        <button
          onClick={() => {
            if (sub === "compras") { setItemForm({ name: "", cat: "🛒 Mercado" }); setSheet("addItem"); }
            else if (sub === "notas") { setNoteForm({ title: "", content: "", color: "#FFE082" }); setSheet("addNota"); }
            else { setLemForm({ title: "", time: "09:00", date: day, cat: "📋 Geral", priority: "media" }); setSheet("addLembrete"); }
          }}
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

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18, overflowX: "auto", paddingBottom: 4 }}>
        <Chip active={sub === "compras"} onClick={() => setSub("compras")}>
          🛒 Compras{pendingCount > 0 && ` (${pendingCount})`}
        </Chip>
        <Chip active={sub === "notas"} onClick={() => setSub("notas")}>📝 Notas</Chip>
        <Chip active={sub === "lembretes"} onClick={() => setSub("lembretes")}>
          🔔 Lembretes{reminders.filter(r => !r.done).length > 0 && ` (${reminders.filter(r => !r.done).length})`}
        </Chip>
      </div>

      {/* ════════════ ABA COMPRAS ════════════ */}
      {sub === "compras" && (
        <div>
          {/* Quick add inline */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <FInput value={itemForm.name} onChange={v => setItemForm(f => ({ ...f, name: v }))} placeholder="Adicionar item..." />
            </div>
            <button
              onClick={() => { if (itemForm.name.trim()) { adicionarItem({ name: itemForm.name, cat: itemForm.cat }); setItemForm(f => ({ ...f, name: "" })); } }}
              style={{
                width: 44, height: 44, borderRadius: 14, background: "var(--vf-p)",
                border: "none", display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", flexShrink: 0, WebkitTapHighlightColor: "transparent",
              }}
            >
              <Send size={18} color="#fff" />
            </button>
          </div>

          {shopping.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--vf-tm)" }}>
              <p style={{ fontSize: 34, margin: "0 0 10px" }}>🛒</p>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Lista vazia</p>
              <p style={{ margin: "6px 0 0", fontSize: 12 }}>Adicione itens que precisa comprar</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {shopping.filter(i => !i.done).map(i => (
                <div key={i.id} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                  borderRadius: 14, background: "var(--vf-surf)", border: "1px solid var(--vf-bd)",
                }}>
                  <button
                    onClick={() => toggleItemDone(i.id)}
                    style={{
                      width: 36, height: 36, borderRadius: 11, background: "var(--vf-alt)",
                      border: "1.5px solid var(--vf-bd)", display: "flex", alignItems: "center",
                      justifyContent: "center", cursor: "pointer", flexShrink: 0,
                      WebkitTapHighlightColor: "transparent",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--vf-tx)" }}>{i.name}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "var(--vf-tm)" }}>{i.cat}</p>
                  </div>
                  <button
                    onClick={() => { setDelItemId(i.id); setSheet("delItem"); }}
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
              ))}

              {/* Comprados */}
              {doneCount > 0 && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "var(--vf-tm)" }}>
                      ✅ Comprados ({doneCount})
                    </p>
                    <button
                      onClick={limparComprados}
                      style={{
                        display: "flex", alignItems: "center", gap: 4, padding: "6px 12px",
                        borderRadius: 10, background: "var(--vf-alt)", border: "none",
                        color: "var(--vf-tm)", fontSize: 11, fontWeight: 700, cursor: "pointer",
                        fontFamily: "inherit", WebkitTapHighlightColor: "transparent",
                      }}
                    >
                      <Eraser size={12} /> Limpar
                    </button>
                  </div>
                  {shopping.filter(i => i.done).map(i => (
                    <div key={i.id} style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                      borderRadius: 14, background: "var(--vf-alt)", border: "1px solid var(--vf-ok)",
                      opacity: 0.6,
                    }}>
                      <button
                        onClick={() => toggleItemDone(i.id)}
                        style={{
                          width: 36, height: 36, borderRadius: 11, background: "var(--vf-ok)",
                          border: "none", display: "flex", alignItems: "center",
                          justifyContent: "center", cursor: "pointer", flexShrink: 0,
                          WebkitTapHighlightColor: "transparent",
                        }}
                      >
                        <Check size={18} color="#fff" />
                      </button>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--vf-tx)", textDecoration: "line-through", flex: 1 }}>{i.name}</p>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ════════════ ABA NOTAS ════════════ */}
      {sub === "notas" && (
        <div>
          {notes.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--vf-tm)" }}>
              <p style={{ fontSize: 34, margin: "0 0 10px" }}>📝</p>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Nenhuma nota</p>
              <p style={{ margin: "6px 0 0", fontSize: 12 }}>Anote ideias, recados e lembretes rápidos</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {notes.map(n => (
                <div
                  key={n.id}
                  onClick={() => { setEditNoteForm({ id: n.id, title: n.title, content: n.content, color: n.color }); setSheet("editNota"); }}
                  style={{
                    padding: "16px 14px", borderRadius: 18,
                    background: `color-mix(in srgb, ${n.color} 30%, var(--vf-surf))`,
                    border: `1px solid color-mix(in srgb, ${n.color} 50%, transparent)`,
                    cursor: "pointer", position: "relative",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "var(--vf-tx)", marginBottom: 6 }}>{n.title}</p>
                  {n.content && (
                    <p style={{ margin: 0, fontSize: 12, color: "var(--vf-tm)", lineHeight: 1.4,
                      overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" as const,
                    }}>{n.content}</p>
                  )}
                  <p style={{ margin: "8px 0 0", fontSize: 10, color: "var(--vf-tm)" }}>{n.date}</p>
                  <button
                    onClick={e => { e.stopPropagation(); setDelNoteId(n.id); setSheet("delNota"); }}
                    style={{
                      position: "absolute", top: 10, right: 10,
                      width: 24, height: 24, borderRadius: 6,
                      background: "color-mix(in srgb, var(--vf-er) 12%, transparent)",
                      border: "none", display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    <Trash2 size={11} color="var(--vf-er)" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════════════ ABA LEMBRETES ════════════ */}
      {sub === "lembretes" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {reminders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--vf-tm)" }}>
              <p style={{ fontSize: 34, margin: "0 0 10px" }}>🔔</p>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Nenhum lembrete</p>
              <p style={{ margin: "6px 0 0", fontSize: 12 }}>Crie lembretes para nunca esquecer</p>
            </div>
          ) : (
            reminders.map(r => {
              const isPast = r.date < day && !r.done;
              const prColor = r.priority === "alta" ? "var(--vf-er)" : r.priority === "media" ? "var(--vf-wn)" : "var(--vf-ok)";
              return (
                <div key={r.id} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "14px 15px",
                  borderRadius: 16, background: "var(--vf-surf)",
                  border: `1.5px solid ${r.done ? "var(--vf-ok)" : isPast ? "var(--vf-er)" : "var(--vf-bd)"}`,
                  opacity: r.done ? 0.6 : 1,
                }}>
                  <button
                    onClick={() => toggleLembreteDone(r.id)}
                    style={{
                      width: 36, height: 36, borderRadius: 11,
                      background: r.done ? "var(--vf-ok)" : "var(--vf-alt)",
                      border: r.done ? "none" : "1.5px solid var(--vf-bd)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", flexShrink: 0, WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    {r.done ? <Check size={18} color="#fff" /> : <Bell size={16} color="var(--vf-tm)" />}
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      margin: 0, fontSize: 14, fontWeight: 700, color: "var(--vf-tx)",
                      textDecoration: r.done ? "line-through" : "none",
                    }}>{r.title}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: isPast ? "var(--vf-er)" : "var(--vf-tm)" }}>
                      {r.date} · {r.time} · {r.cat}
                    </p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                    <span style={{
                      fontSize: 9, fontWeight: 800, color: prColor, padding: "2px 8px",
                      borderRadius: 6, background: `color-mix(in srgb, ${prColor} 12%, transparent)`,
                    }}>
                      {r.priority.toUpperCase()}
                    </span>
                    <button
                      onClick={() => { setDelLemId(r.id); setSheet("delLembrete"); }}
                      style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: "color-mix(in srgb, var(--vf-er) 10%, transparent)",
                        border: "none", display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", WebkitTapHighlightColor: "transparent",
                      }}
                    >
                      <Trash2 size={12} color="var(--vf-er)" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ════════════ SHEETS ════════════ */}

      {/* Add Item */}
      {sheet === "addItem" && (
        <Sheet title="🛒 Novo Item" onClose={() => setSheet(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <FInput value={itemForm.name} onChange={v => setItemForm(f => ({ ...f, name: v }))} placeholder="Nome do item" />
            <p style={{ margin: 0, fontSize: 12, color: "var(--vf-tm)", fontWeight: 600 }}>Categoria</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {SHOP_CATS.map(c => (
                <Chip key={c} active={itemForm.cat === c} onClick={() => setItemForm(f => ({ ...f, cat: c }))}>{c}</Chip>
              ))}
            </div>
            <Btn onClick={saveItem}>Adicionar</Btn>
          </div>
        </Sheet>
      )}

      {/* Add Nota */}
      {sheet === "addNota" && (
        <Sheet title="📝 Nova Nota" onClose={() => setSheet(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <FInput value={noteForm.title} onChange={v => setNoteForm(f => ({ ...f, title: v }))} placeholder="Título" />
            <textarea
              value={noteForm.content}
              onChange={e => setNoteForm(f => ({ ...f, content: e.target.value }))}
              placeholder="Conteúdo..."
              rows={4}
              style={{
                width: "100%", padding: "12px 14px", borderRadius: 14,
                border: "1.5px solid var(--vf-bd)", background: "var(--vf-alt)",
                color: "var(--vf-tx)", fontSize: 14, fontFamily: "inherit",
                resize: "vertical", outline: "none", boxSizing: "border-box",
              }}
            />
            <p style={{ margin: 0, fontSize: 12, color: "var(--vf-tm)", fontWeight: 600 }}>Cor</p>
            <div style={{ display: "flex", gap: 8 }}>
              {NOTE_COLORS.map(c => (
                <button
                  key={c} onClick={() => setNoteForm(f => ({ ...f, color: c }))}
                  style={{
                    width: 34, height: 34, borderRadius: 99, background: c,
                    border: noteForm.color === c ? "3px solid var(--vf-p)" : "2px solid transparent",
                    cursor: "pointer", WebkitTapHighlightColor: "transparent",
                  }}
                />
              ))}
            </div>
            <Btn onClick={saveNota}>Salvar nota</Btn>
          </div>
        </Sheet>
      )}

      {/* Editar Nota */}
      {sheet === "editNota" && (
        <Sheet title="✏️ Editar Nota" onClose={() => setSheet(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <FInput value={editNoteForm.title} onChange={v => setEditNoteForm(f => ({ ...f, title: v }))} placeholder="Título" />
            <textarea
              value={editNoteForm.content}
              onChange={e => setEditNoteForm(f => ({ ...f, content: e.target.value }))}
              placeholder="Conteúdo..."
              rows={4}
              style={{
                width: "100%", padding: "12px 14px", borderRadius: 14,
                border: "1.5px solid var(--vf-bd)", background: "var(--vf-alt)",
                color: "var(--vf-tx)", fontSize: 14, fontFamily: "inherit",
                resize: "vertical", outline: "none", boxSizing: "border-box",
              }}
            />
            <p style={{ margin: 0, fontSize: 12, color: "var(--vf-tm)", fontWeight: 600 }}>Cor</p>
            <div style={{ display: "flex", gap: 8 }}>
              {NOTE_COLORS.map(c => (
                <button
                  key={c} onClick={() => setEditNoteForm(f => ({ ...f, color: c }))}
                  style={{
                    width: 34, height: 34, borderRadius: 99, background: c,
                    border: editNoteForm.color === c ? "3px solid var(--vf-p)" : "2px solid transparent",
                    cursor: "pointer", WebkitTapHighlightColor: "transparent",
                  }}
                />
              ))}
            </div>
            <Btn onClick={saveEditNota}>Salvar alterações</Btn>
            <Btn variant="ghost" onClick={() => setSheet(null)}>Cancelar</Btn>
          </div>
        </Sheet>
      )}

      {/* Add Lembrete */}
      {sheet === "addLembrete" && (
        <Sheet title="🔔 Novo Lembrete" onClose={() => setSheet(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <FInput value={lemForm.title} onChange={v => setLemForm(f => ({ ...f, title: v }))} placeholder="O que não pode esquecer?" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <p style={{ margin: "0 0 6px", fontSize: 12, color: "var(--vf-tm)", fontWeight: 600 }}>Data</p>
                <FInput value={lemForm.date} onChange={v => setLemForm(f => ({ ...f, date: v }))} type="date" />
              </div>
              <div>
                <p style={{ margin: "0 0 6px", fontSize: 12, color: "var(--vf-tm)", fontWeight: 600 }}>Horário</p>
                <FInput value={lemForm.time} onChange={v => setLemForm(f => ({ ...f, time: v }))} type="time" />
              </div>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: "var(--vf-tm)", fontWeight: 600 }}>Prioridade</p>
            <div style={{ display: "flex", gap: 6 }}>
              {PRIORITIES.map(pr => (
                <Chip key={pr.key} active={lemForm.priority === pr.key} onClick={() => setLemForm(f => ({ ...f, priority: pr.key }))}>
                  {pr.emoji} {pr.label}
                </Chip>
              ))}
            </div>
            <Btn onClick={saveLembrete}>Criar lembrete</Btn>
          </div>
        </Sheet>
      )}

      {/* Confirmações */}
      {sheet === "delItem" && delItemId !== null && (
        <ConfirmDel
          label={shopping.find(i => i.id === delItemId)?.name ?? ""}
          onCancel={() => setSheet(null)}
          onConfirm={() => { removerItem(delItemId); setDelItemId(null); setSheet(null); }}
        />
      )}
      {sheet === "delNota" && delNoteId !== null && (
        <ConfirmDel
          label={notes.find(n => n.id === delNoteId)?.title ?? ""}
          onCancel={() => setSheet(null)}
          onConfirm={() => { removerNota(delNoteId); setDelNoteId(null); setSheet(null); }}
        />
      )}
      {sheet === "delLembrete" && delLemId !== null && (
        <ConfirmDel
          label={reminders.find(r => r.id === delLemId)?.title ?? ""}
          onCancel={() => setSheet(null)}
          onConfirm={() => { removerLembrete(delLemId); setDelLemId(null); setSheet(null); }}
        />
      )}
    </div>
  );
}
