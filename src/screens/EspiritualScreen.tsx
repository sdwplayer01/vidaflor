// src/screens/EspiritualScreen.tsx — Tela de Conexão Espiritual do VidaFlor v2
// 3 seções: Gratidão · Leituras · Orações. CRUD completo com ConfirmDel.

import { useState } from "react";
import {
  Plus, Heart, BookOpen, HandHeart, Check,
  Trash2, Sparkles, Send,
} from "lucide-react";
import type { Reading, Prayer } from "@/types/data";
import { Card }         from "@/components/shared/Card";
import { Btn }          from "@/components/shared/Btn";
import { Sheet }        from "@/components/shared/Sheet";
import { FInput }       from "@/components/shared/FInput";
import { Chip }         from "@/components/shared/Chip";
import { ConfirmDel }   from "@/components/shared/ConfirmDel";
import { useEspiritStore } from "@/stores/espiritStore";
import { today }           from "@/utils/date";

// ── Tipos locais ─────────────────────────────────────────────────────────────

type SubTab = "gratidao" | "leituras" | "oracoes";
type SheetKey = "addGrat" | "addLeitura" | "addOracao" | "delLeitura" | "delOracao" | "delGrat" | null;

// ── Component ────────────────────────────────────────────────────────────────

export function EspiritualScreen() {
  const day = today();

  // Store
  const gratitudeList     = useEspiritStore(s => s.gratitudeList);
  const readings          = useEspiritStore(s => s.readings);
  const prayers           = useEspiritStore(s => s.prayers);
  const adicionarGratidao = useEspiritStore(s => s.adicionarGratidao);
  const removerGratidao   = useEspiritStore(s => s.removerGratidao);
  const adicionarLeitura  = useEspiritStore(s => s.adicionarLeitura);
  const removerLeitura    = useEspiritStore(s => s.removerLeitura);
  const adicionarOracao   = useEspiritStore(s => s.adicionarOracao);
  const removerOracao     = useEspiritStore(s => s.removerOracao);
  const marcarRespondida  = useEspiritStore(s => s.marcarRespondida);

  const todayGrats = gratitudeList(day);

  // Local state
  const [sub, setSub]     = useState<SubTab>("gratidao");
  const [sheet, setSheet] = useState<SheetKey>(null);
  const [gratText, setGratText] = useState("");
  const [leitForm, setLeitForm] = useState({ book: "", chapter: "" });
  const [oracForm, setOracForm] = useState({ person: "", request: "" });
  const [delReadId, setDelReadId] = useState<number | null>(null);
  const [delPrayId, setDelPrayId] = useState<number | null>(null);
  const [delGratIdx, setDelGratIdx] = useState<number | null>(null);

  // Actions
  const saveGrat = () => {
    if (!gratText.trim()) return;
    adicionarGratidao(day, gratText.trim());
    setGratText("");
    setSheet(null);
  };

  const saveLeit = () => {
    if (!leitForm.book.trim()) return;
    adicionarLeitura({ book: leitForm.book, chapter: leitForm.chapter, date: day });
    setLeitForm({ book: "", chapter: "" });
    setSheet(null);
  };

  const saveOrac = () => {
    if (!oracForm.person.trim() || !oracForm.request.trim()) return;
    adicionarOracao({ person: oracForm.person, request: oracForm.request });
    setOracForm({ person: "", request: "" });
    setSheet(null);
  };

  return (
    <div style={{ padding: "24px 20px 20px" }}>

      {/* Cabeçalho */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, color: "var(--vf-tx)", fontSize: 22, fontWeight: 900 }}>Conexão</h2>
          <p style={{ margin: "2px 0 0", color: "var(--vf-tm)", fontSize: 13 }}>Cultive sua paz interior</p>
        </div>
        <button
          onClick={() => {
            if (sub === "gratidao") setSheet("addGrat");
            else if (sub === "leituras") setSheet("addLeitura");
            else setSheet("addOracao");
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
        <Chip active={sub === "gratidao"}  onClick={() => setSub("gratidao")}>🙏 Gratidão</Chip>
        <Chip active={sub === "leituras"}  onClick={() => setSub("leituras")}>📖 Leituras</Chip>
        <Chip active={sub === "oracoes"}   onClick={() => setSub("oracoes")}>
          💝 Orações{prayers.filter(p => !p.answered).length > 0 && ` (${prayers.filter(p => !p.answered).length})`}
        </Chip>
      </div>

      {/* ════════════ ABA GRATIDÃO ════════════ */}
      {sub === "gratidao" && (
        <div>
          {/* Quick add inline */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <FInput value={gratText} onChange={setGratText} placeholder="Pelo que você é grata hoje?" />
            </div>
            <button
              onClick={saveGrat}
              style={{
                width: 44, height: 44, borderRadius: 14, background: "var(--vf-p)",
                border: "none", display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", flexShrink: 0, WebkitTapHighlightColor: "transparent",
              }}
            >
              <Send size={18} color="#fff" />
            </button>
          </div>

          {todayGrats.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--vf-tm)" }}>
              <p style={{ fontSize: 34, margin: "0 0 10px" }}>🌸</p>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Nenhuma gratidão registrada hoje</p>
              <p style={{ margin: "6px 0 0", fontSize: 12 }}>Agradecer muda a perspectiva do dia</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {todayGrats.map((g, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
                  borderRadius: 16, background: "var(--vf-surf)",
                  border: "1px solid var(--vf-bd)",
                }}>
                  <Sparkles size={16} color="var(--vf-p)" style={{ flexShrink: 0 }} />
                  <p style={{ margin: 0, fontSize: 14, color: "var(--vf-tx)", flex: 1 }}>{g}</p>
                  <button
                    onClick={() => { setDelGratIdx(i); setSheet("delGrat"); }}
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
            </div>
          )}

          {todayGrats.length > 0 && todayGrats.length < 3 && (
            <p style={{ margin: "14px 0 0", fontSize: 12, color: "var(--vf-tm)", textAlign: "center" }}>
              {3 - todayGrats.length} gratidão(ões) a mais para completar 3 🌟
            </p>
          )}
          {todayGrats.length >= 3 && (
            <div style={{
              marginTop: 14, textAlign: "center", padding: "12px 16px", borderRadius: 14,
              background: "color-mix(in srgb, var(--vf-ok) 10%, transparent)",
              border: "1px solid color-mix(in srgb, var(--vf-ok) 25%, transparent)",
            }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--vf-ok)" }}>
                🌟 Gratidão completa! Coração transbordando
              </p>
            </div>
          )}
        </div>
      )}

      {/* ════════════ ABA LEITURAS ════════════ */}
      {sub === "leituras" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {readings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--vf-tm)" }}>
              <p style={{ fontSize: 34, margin: "0 0 10px" }}>📖</p>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Nenhuma leitura registrada</p>
              <p style={{ margin: "6px 0 0", fontSize: 12 }}>Registre suas leituras e devocionais</p>
            </div>
          ) : (
            readings.map(r => (
              <div key={r.id} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
                borderRadius: 16, background: "var(--vf-surf)", border: "1px solid var(--vf-bd)",
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 11,
                  background: "color-mix(in srgb, var(--vf-p) 12%, transparent)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <BookOpen size={18} color="var(--vf-p)" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--vf-tx)" }}>{r.book}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "var(--vf-tm)" }}>
                    {r.chapter && `Cap. ${r.chapter} · `}{r.date}
                  </p>
                </div>
                <button
                  onClick={() => { setDelReadId(r.id); setSheet("delLeitura"); }}
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
            ))
          )}
        </div>
      )}

      {/* ════════════ ABA ORAÇÕES ════════════ */}
      {sub === "oracoes" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {prayers.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--vf-tm)" }}>
              <p style={{ fontSize: 34, margin: "0 0 10px" }}>💝</p>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Nenhum pedido de oração</p>
              <p style={{ margin: "6px 0 0", fontSize: 12 }}>Ore por quem você ama</p>
            </div>
          ) : (
            prayers.map(pr => (
              <div key={pr.id} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
                borderRadius: 16, background: "var(--vf-surf)",
                border: `1.5px solid ${pr.answered ? "var(--vf-ok)" : "var(--vf-bd)"}`,
                opacity: pr.answered ? 0.7 : 1,
              }}>
                <button
                  onClick={() => marcarRespondida(pr.id)}
                  style={{
                    width: 36, height: 36, borderRadius: 11,
                    background: pr.answered ? "var(--vf-ok)" : "var(--vf-surf)",
                    border: pr.answered ? "none" : "1.5px solid var(--vf-bd)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", flexShrink: 0, WebkitTapHighlightColor: "transparent",
                  }}
                >
                  {pr.answered ? <Check size={16} color="#fff" /> : <HandHeart size={16} color="var(--vf-tm)" />}
                </button>
                <div style={{ flex: 1 }}>
                  <p style={{
                    margin: 0, fontSize: 14, fontWeight: 700, color: "var(--vf-tx)",
                    textDecoration: pr.answered ? "line-through" : "none",
                  }}>{pr.person}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--vf-tm)" }}>{pr.request}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  {pr.answered && <span style={{ fontSize: 10, fontWeight: 700, color: "var(--vf-ok)" }}>✅ Respondida</span>}
                  <button
                    onClick={() => { setDelPrayId(pr.id); setSheet("delOracao"); }}
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
            ))
          )}
        </div>
      )}

      {/* ════════════ SHEETS ════════════ */}

      {sheet === "addGrat" && (
        <Sheet title="🙏 Nova Gratidão" onClose={() => setSheet(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <FInput value={gratText} onChange={setGratText} placeholder="Pelo que você é grata?" />
            <Btn onClick={saveGrat}>Agradecer ✨</Btn>
            <Btn variant="ghost" onClick={() => setSheet(null)}>Cancelar</Btn>
          </div>
        </Sheet>
      )}

      {sheet === "addLeitura" && (
        <Sheet title="📖 Nova Leitura" onClose={() => setSheet(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <FInput value={leitForm.book} onChange={v => setLeitForm(f => ({ ...f, book: v }))} placeholder="Livro (ex: Salmos)" />
            <FInput value={leitForm.chapter} onChange={v => setLeitForm(f => ({ ...f, chapter: v }))} placeholder="Capítulo(s) (ex: 23)" />
            <Btn onClick={saveLeit}>Registrar leitura</Btn>
            <Btn variant="ghost" onClick={() => setSheet(null)}>Cancelar</Btn>
          </div>
        </Sheet>
      )}

      {sheet === "addOracao" && (
        <Sheet title="💝 Pedido de Oração" onClose={() => setSheet(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <FInput value={oracForm.person} onChange={v => setOracForm(f => ({ ...f, person: v }))} placeholder="Por quem?" />
            <FInput value={oracForm.request} onChange={v => setOracForm(f => ({ ...f, request: v }))} placeholder="Pedido" />
            <Btn onClick={saveOrac}>Adicionar 🙏</Btn>
            <Btn variant="ghost" onClick={() => setSheet(null)}>Cancelar</Btn>
          </div>
        </Sheet>
      )}

      {sheet === "delGrat" && delGratIdx !== null && (
        <ConfirmDel
          label={todayGrats[delGratIdx] ?? ""}
          onCancel={() => setSheet(null)}
          onConfirm={() => { removerGratidao(day, delGratIdx); setDelGratIdx(null); setSheet(null); }}
        />
      )}

      {sheet === "delLeitura" && delReadId !== null && (
        <ConfirmDel
          label={readings.find(r => r.id === delReadId)?.book ?? ""}
          onCancel={() => setSheet(null)}
          onConfirm={() => { removerLeitura(delReadId); setDelReadId(null); setSheet(null); }}
        />
      )}

      {sheet === "delOracao" && delPrayId !== null && (
        <ConfirmDel
          label={prayers.find(p => p.id === delPrayId)?.person ?? ""}
          onCancel={() => setSheet(null)}
          onConfirm={() => { removerOracao(delPrayId); setDelPrayId(null); setSheet(null); }}
        />
      )}
    </div>
  );
}
