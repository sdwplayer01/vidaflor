// src/screens/FinancasScreen.tsx — Tela de Finanças do VidaFlor v2
// Migrado de FinancasScreen-v2.jsx → zero prop drilling, Zustand stores.
// 3 abas: Lançamentos · Cartões · Parcelas
// Componentes extraídos: LancamentoItem, CartaoCard, ParcelaItem

import { useState } from "react";
import {
  Plus, Wallet, AlertCircle, CreditCard,
  Check, Clock, Trash2,
} from "lucide-react";
import type { Transaction, Card as CardType, TransType } from "@/types/data";
import { Card }         from "@/components/shared/Card";
import { Btn }          from "@/components/shared/Btn";
import { Sheet }        from "@/components/shared/Sheet";
import { FInput }       from "@/components/shared/FInput";
import { Chip }         from "@/components/shared/Chip";
import { Toggle }       from "@/components/shared/Toggle";
import { ProgressBar }  from "@/components/shared/ProgressBar";
import { ConfirmDel }   from "@/components/shared/ConfirmDel";
import { LancamentoItem } from "@/components/financas/LancamentoItem";
import { CartaoCard }      from "@/components/financas/CartaoCard";
import { ParcelaItem }     from "@/components/financas/ParcelaItem";
import { useFinancasStore } from "@/stores/financasStore";
import { today, fmtBRL, fmtMonth, currentMonth } from "@/utils/date";

// ── Constantes ───────────────────────────────────────────────────────────────

const CATS_ENT = [
  "💼 Salário CLT", "🏢 Pró-labore", "💰 Freelance", "📦 Venda",
  "🏠 Aluguel recebido", "💸 Transferência recebida", "🎁 Presente/Doação",
  "📈 Rendimento", "➕ Outro",
];

const CATS_SAI = [
  "🛒 Alimentação", "🏠 Moradia", "⚡ Contas fixas", "🚗 Transporte",
  "💊 Saúde", "📚 Educação", "👗 Vestuário", "🎭 Lazer",
  "💳 Fatura cartão", "📦 Parcelada", "💸 Empréstimo",
  "🏧 Débito/Dinheiro", "📲 PIX", "➕ Outro",
];

const BRANDS = ["Mastercard", "Visa", "Elo", "Amex"];

const C_CORES = [
  "#8A05BE", "#FF7A00", "#000000", "#2196F3",
  "#4CAF50", "#E91E63", "#607D8B",
];

// ── Tipos locais ─────────────────────────────────────────────────────────────

type SubTab = "lancamentos" | "cartoes" | "parcelas";
type SheetKey =
  | "addEntrada" | "addSaida" | "addCard"
  | "cardDetail" | "delTrans" | "delCard"
  | "budget"     | "projecao"
  | null;

interface NfState {
  desc: string; val: string; cat: string; paid: boolean;
  due: string; date: string; cardId: number | null;
  parcelada: boolean; totalParcelas: number; totalVal: string;
}
interface NcState {
  name: string; brand: string; color: string; closeDay: number; dueDay: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function defNf(cardId: number | null = null): NfState {
  return {
    desc: "", val: "", cat: "🛒 Alimentação",
    paid: false, due: today(), date: today(), cardId,
    parcelada: false, totalParcelas: 2, totalVal: "",
  };
}
function defNc(): NcState {
  return { name: "", brand: "Mastercard", color: "#8A05BE", closeDay: 5, dueDay: 15 };
}

function getBudgetFeedback(bm: number, st: number) {
  if (!bm) return null;
  const r = (bm - st) / bm;
  if (r >= 0.20) return { msg: "Muito bom! Pense em poupar/investir! 🚀",        color: "var(--vf-ok)", border: "color-mix(in srgb, var(--vf-ok) 30%, transparent)" };
  if (r >= 0)    return { msg: "Incrível, vai estar tudo pago! ✅",              color: "var(--vf-ok)", border: "color-mix(in srgb, var(--vf-ok) 20%, transparent)" };
  if (r >= -0.20) return { msg: "Precisa de atenção, mas você vai conseguir! 💪", color: "var(--vf-wn)", border: "color-mix(in srgb, var(--vf-wn) 30%, transparent)" };
  return { msg: "Atenção! Gastos acima do disponível. Revise! 🔴", color: "var(--vf-er)", border: "color-mix(in srgb, var(--vf-er) 30%, transparent)" };
}

// ── Componente principal ─────────────────────────────────────────────────────

export function FinancasScreen() {
  const transactions     = useFinancasStore(s => s.transactions);
  const cards            = useFinancasStore(s => s.cards);
  const budget           = useFinancasStore(s => s.budget);
  const saldoMes         = useFinancasStore(s => s.saldoMes);
  const faturasCartao    = useFinancasStore(s => s.faturasCartao);
  const transacoesMes    = useFinancasStore(s => s.transacoesMes);
  const pendentesMes     = useFinancasStore(s => s.pendentesMes);
  const adicionarTransacao  = useFinancasStore(s => s.adicionarTransacao);
  const adicionarParcelada  = useFinancasStore(s => s.adicionarParcelada);
  const removerTransacao    = useFinancasStore(s => s.removerTransacao);
  const togglePago          = useFinancasStore(s => s.togglePago);
  const adicionarCartao     = useFinancasStore(s => s.adicionarCartao);
  const removerCartao       = useFinancasStore(s => s.removerCartao);
  const definirOrcamento    = useFinancasStore(s => s.definirOrcamento);

  const [sub, setSub]       = useState<SubTab>("lancamentos");
  const [sheet, setSheet]   = useState<SheetKey>(null);
  const [nf, setNf]         = useState(defNf());
  const [nc, setNc]         = useState(defNc());
  const [delId, setDelId]   = useState<number | null>(null);
  const [delKid, setDelKid] = useState<number | null>(null);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [budgetInput, setBudgetInput]   = useState("");
  const [cardAddMode, setCardAddMode]   = useState(false);

  const curMonth   = currentMonth();
  const budgetMes  = budget[curMonth] ?? 0;
  const monthTrans = transacoesMes(curMonth);
  const entradas   = monthTrans.filter(t => t.type === "income").reduce((s, t) => s + t.val, 0);
  const saidasTot  = monthTrans.filter(t => t.type === "expense").reduce((s, t) => s + t.val, 0);
  const bal        = saldoMes(curMonth);
  const pending    = pendentesMes(curMonth);
  const bf         = getBudgetFeedback(budgetMes, saidasTot);
  const budgetBalance = budgetMes > 0 ? budgetMes - saidasTot : null;
  const allParcelas = transactions.filter(t => t.installment).sort((a, b) => a.date.localeCompare(b.date));
  const sCard      = cards.find(c => c.id === selectedCard);
  const sCardTrans = sCard ? transactions.filter(t => t.cardId === sCard.id).sort((a, b) => b.date.localeCompare(a.date)) : [];
  const sCardCur   = sCard ? faturasCartao(sCard.id, curMonth) : 0;
  const delTrans   = transactions.find(t => t.id === delId);
  const delCardO   = cards.find(c => c.id === delKid);

  // Meses para projeção
  const monthMap: Record<string, { ent: number; sai: number }> = {};
  transactions.forEach(t => {
    const m = t.date.slice(0, 7); if (!m) return;
    if (!monthMap[m]) monthMap[m] = { ent: 0, sai: 0 };
    if (t.type === "income") monthMap[m]!.ent += t.val; else monthMap[m]!.sai += t.val;
  });
  for (let i = 1; i <= 3; i++) { const d = new Date(); d.setMonth(d.getMonth() + i); const m = d.toISOString().slice(0, 7); if (!monthMap[m]) monthMap[m] = { ent: 0, sai: 0 }; }
  const sortedMonths = Object.keys(monthMap).sort();

  // Actions
  const saveBudget = () => { const v = parseFloat(budgetInput.replace(",", ".")); if (!v || v <= 0) return; definirOrcamento(curMonth, v); setSheet(null); setBudgetInput(""); };
  const saveEntrada = () => { if (!nf.desc.trim() || !nf.val) return; adicionarTransacao({ desc: nf.desc, val: parseFloat(nf.val.replace(",", ".")), type: "income", cat: nf.cat, date: nf.date, paid: true, cardId: null, installment: null }); setNf(defNf()); setSheet(null); };
  const saveSaida = (isCardDirect = false) => {
    if (!nf.desc.trim()) return;
    if (nf.parcelada) { const tv = parseFloat((nf.totalVal || nf.val).replace(",", ".")); if (!tv) return; adicionarParcelada({ desc: nf.desc, totalVal: tv, totalParcelas: nf.totalParcelas, date: nf.date, cat: nf.cat, cardId: nf.cardId }); }
    else { const val = parseFloat(nf.val.replace(",", ".")); if (!val) return; adicionarTransacao({ desc: nf.desc, val, type: "expense", cat: nf.cat, date: nf.date, due: nf.due, paid: nf.paid, cardId: nf.cardId, installment: null }); }
    if (isCardDirect) { setNf(defNf(sCard?.id ?? null)); setCardAddMode(false); } else { setNf(defNf()); setSheet(null); }
  };
  const addCard = () => { if (!nc.name.trim()) return; adicionarCartao({ name: nc.name, brand: nc.brand, color: nc.color, closeDay: nc.closeDay, dueDay: nc.dueDay }); setNc(defNc()); setSheet(null); };
  const handleRemoveTrans = (id?: number) => { const tId = id ?? delId; if (tId != null) { removerTransacao(tId); if (tId === delId) { setDelId(null); setSheet(null); } } };
  const handleRemoveCard = () => { if (delKid != null) { removerCartao(delKid); setDelKid(null); setSheet(null); } };

  // SaidaForm sub-component (closure over nf, setNf, cards, saveSaida)
  function SaidaForm({ isCardDirect = false }: { isCardDirect?: boolean }) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <FInput value={nf.desc} onChange={v => setNf(x => ({ ...x, desc: v }))} placeholder="Descrição" />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--vf-alt)", padding: "13px 16px", borderRadius: 14 }}>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--vf-tx)" }}>📦 Compra parcelada?</p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--vf-tm)" }}>Cartão, boleto, crediário ou empréstimo</p>
          </div>
          <Toggle val={nf.parcelada} onChange={v => setNf(x => ({ ...x, parcelada: v }))} />
        </div>
        {nf.parcelada ? (<>
          <FInput value={nf.totalVal} onChange={v => setNf(x => ({ ...x, totalVal: v }))} placeholder="Valor TOTAL (R$)" type="number" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div><p style={{ margin: "0 0 6px", fontSize: 12, color: "var(--vf-tm)", fontWeight: 600 }}>Nº de parcelas</p><FInput value={String(nf.totalParcelas)} onChange={v => setNf(x => ({ ...x, totalParcelas: parseInt(v) || 2 }))} type="number" /></div>
            <div><p style={{ margin: "0 0 6px", fontSize: 12, color: "var(--vf-tm)", fontWeight: 600 }}>1ª parcela em</p><FInput value={nf.date} onChange={v => setNf(x => ({ ...x, date: v }))} type="date" /></div>
          </div>
          {nf.totalVal && nf.totalParcelas >= 2 && (
            <div style={{ padding: "10px 14px", borderRadius: 12, background: "color-mix(in srgb, var(--vf-p) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--vf-p) 20%, transparent)" }}>
              <p style={{ margin: 0, fontSize: 13, color: "var(--vf-p)", fontWeight: 800 }}>{nf.totalParcelas}x de R$ {fmtBRL(parseFloat(nf.totalVal || "0") / nf.totalParcelas)}</p>
              <p style={{ margin: "3px 0 0", fontSize: 11, color: "var(--vf-tm)" }}>Parcelas geradas automaticamente</p>
            </div>
          )}
        </>) : (<>
          <FInput value={nf.val} onChange={v => setNf(x => ({ ...x, val: v }))} placeholder="Valor (R$)" type="number" />
          <FInput value={nf.date} onChange={v => setNf(x => ({ ...x, date: v }))} type="date" />
          <FInput value={nf.due} onChange={v => setNf(x => ({ ...x, due: v }))} placeholder="Vencimento" type="date" />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--vf-alt)", padding: "13px 16px", borderRadius: 14 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--vf-tx)" }}>✅ Já confirmado?</span>
            <Toggle val={nf.paid} onChange={v => setNf(x => ({ ...x, paid: v }))} />
          </div>
        </>)}
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--vf-tm)", fontWeight: 700 }}>Categoria:</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {CATS_SAI.map(c => (<Chip key={c} active={nf.cat === c} onClick={() => setNf(x => ({ ...x, cat: c }))}>{c}</Chip>))}
        </div>
        {cards.length > 0 && !isCardDirect && (<>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--vf-tm)", fontWeight: 700 }}>Vincular ao cartão (opcional):</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            <Chip active={!nf.cardId} onClick={() => setNf(x => ({ ...x, cardId: null }))}>💵 Nenhum</Chip>
            {cards.map(c => (<Chip key={c.id} active={nf.cardId === c.id} onClick={() => setNf(x => ({ ...x, cardId: c.id }))}>💳 {c.name}</Chip>))}
          </div>
        </>)}
        <Btn variant="danger" onClick={() => saveSaida(isCardDirect)}>🔴 Salvar Saída</Btn>
        {isCardDirect && <Btn variant="ghost" onClick={() => { setCardAddMode(false); setNf(defNf(sCard?.id ?? null)); }}>Cancelar</Btn>}
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 20px 20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, color: "var(--vf-tx)", fontSize: 22, fontWeight: 900 }}>Finanças</h2>
          <p style={{ margin: "2px 0 0", color: "var(--vf-tm)", fontSize: 13 }}>Cuide do que entra e do que sai</p>
        </div>
      </div>

      {/* Saldo Hero */}
      <Card hero onClick={() => setSheet("projecao")} style={{ padding: "22px 22px 18px", marginBottom: 12, position: "relative", overflow: "hidden" }}>
        <p style={{ margin: 0, fontSize: 11, opacity: .85, fontWeight: 700, letterSpacing: "0.5px" }}>SALDO · {fmtMonth(curMonth)}</p>
        <p style={{ margin: "4px 0 18px", fontSize: 34, fontWeight: 900, lineHeight: 1 }}>R$ {fmtBRL(bal)}</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1px 1fr" }}>
          <div>
            <p style={{ margin: 0, fontSize: 10, opacity: .7, fontWeight: 700 }}>ENTRADAS</p>
            <p style={{ margin: "2px 0 0", fontSize: 17, fontWeight: 900, color: "var(--vf-ok-light)" }}>R$ {fmtBRL(entradas)}</p>
          </div>
          <div style={{ background: "rgba(255,255,255,.2)" }} />
          <div style={{ paddingLeft: 16 }}>
            <p style={{ margin: 0, fontSize: 10, opacity: .7, fontWeight: 700 }}>SAÍDAS</p>
            <p style={{ margin: "2px 0 0", fontSize: 17, fontWeight: 900, color: "var(--vf-er-light)" }}>R$ {fmtBRL(saidasTot)}</p>
          </div>
        </div>
        {pending > 0 && (
          <div style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 10, background: "rgba(0,0,0,.18)" }}>
            <AlertCircle size={12} color="var(--vf-wn-light)" />
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--vf-wn-light)" }}>R$ {fmtBRL(pending)} a confirmar</span>
          </div>
        )}
        <div style={{ position: "absolute", right: -15, top: -15, opacity: .07 }}><Wallet size={100} color="#fff" /></div>
        <p style={{ position: "absolute", bottom: 14, right: 18, margin: 0, fontSize: 10, opacity: .55, fontWeight: 700 }}>ver histórico →</p>
      </Card>

      {/* Orçamento */}
      <Card style={{ marginBottom: 18, padding: "16px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "var(--vf-tm)", letterSpacing: "0.4px" }}>DISPONÍVEL ESTE MÊS</p>
            {budgetMes > 0 ? (<>
              <p style={{ margin: "3px 0 0", fontSize: 24, fontWeight: 900, color: (budgetBalance ?? 0) >= 0 ? "var(--vf-ok)" : "var(--vf-er)" }}>R$ {fmtBRL(budgetBalance ?? 0)}</p>
              <ProgressBar color={(budgetBalance ?? 0) >= 0 ? "var(--vf-ok)" : "var(--vf-er)"} val={Math.min(saidasTot, budgetMes)} max={budgetMes} h={6} />
              {bf && <p style={{ margin: "8px 0 0", fontSize: 12, fontWeight: 700, color: bf.color, padding: "6px 10px", borderRadius: 10, background: bf.border }}>{bf.msg}</p>}
            </>) : <p style={{ margin: "3px 0 0", fontSize: 13, color: "var(--vf-tm)" }}>Nenhum orçamento definido</p>}
          </div>
          <button onClick={() => { setBudgetInput(budgetMes > 0 ? String(budgetMes) : ""); setSheet("budget"); }} style={{ padding: "8px 14px", borderRadius: 10, background: "var(--vf-alt)", border: "1px solid var(--vf-bd)", color: "var(--vf-tm)", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit", WebkitTapHighlightColor: "transparent" }}>
            {budgetMes > 0 ? "Editar" : "Definir"}
          </button>
        </div>
      </Card>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto" }}>
        <Chip active={sub === "lancamentos"} onClick={() => setSub("lancamentos")}>💰 Lançamentos</Chip>
        <Chip active={sub === "cartoes"} onClick={() => setSub("cartoes")}>💳 Cartões{cards.length > 0 && ` (${cards.length})`}</Chip>
        <Chip active={sub === "parcelas"} onClick={() => setSub("parcelas")}>📦 Parcelas{allParcelas.length > 0 && ` (${allParcelas.length})`}</Chip>
      </div>

      {/* ═══ ABA LANÇAMENTOS ═══ */}
      {sub === "lancamentos" && (<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 6 }}>
          <button onClick={() => { setNf(defNf()); setSheet("addEntrada"); }} style={{ padding: 12, borderRadius: 14, border: "1.5px solid var(--vf-ok)", background: "color-mix(in srgb, var(--vf-ok) 8%, transparent)", color: "var(--vf-ok)", fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit", WebkitTapHighlightColor: "transparent" }}>↑ Nova Entrada</button>
          <button onClick={() => { setNf(defNf()); setSheet("addSaida"); }} style={{ padding: 12, borderRadius: 14, border: "1.5px solid var(--vf-er)", background: "color-mix(in srgb, var(--vf-er) 8%, transparent)", color: "var(--vf-er)", fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit", WebkitTapHighlightColor: "transparent" }}>↓ Nova Saída</button>
        </div>
        {monthTrans.length === 0 && <div style={{ textAlign: "center", padding: "32px 0", color: "var(--vf-tm)" }}><p style={{ fontSize: 30, margin: "0 0 8px" }}>💸</p><p style={{ margin: 0, fontWeight: 600 }}>Nenhum lançamento este mês</p></div>}
        {[...monthTrans].sort((a, b) => b.date.localeCompare(a.date)).map(t => (
          <LancamentoItem key={t.id} t={t} cards={cards} onTogglePago={togglePago} onDelete={id => { setDelId(id); setSheet("delTrans"); }} />
        ))}
      </div>)}

      {/* ═══ ABA CARTÕES ═══ */}
      {sub === "cartoes" && (<div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {cards.length === 0 && (<div style={{ textAlign: "center", padding: "32px 0", color: "var(--vf-tm)" }}><p style={{ fontSize: 30, margin: "0 0 8px" }}>💳</p><p style={{ margin: 0, fontWeight: 600 }}>Nenhum cartão cadastrado</p><button onClick={() => setSheet("addCard")} style={{ marginTop: 12, padding: "10px 22px", borderRadius: 12, background: "var(--vf-p)", border: "none", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13, fontFamily: "inherit", WebkitTapHighlightColor: "transparent" }}>+ Cadastrar Cartão</button></div>)}
        {cards.map(c => {
          const bill = faturasCartao(c.id, curMonth);
          const futuros = [1, 2, 3].map(i => { const d = new Date(); d.setMonth(d.getMonth() + i); const m = d.toISOString().slice(0, 7); return { m, v: faturasCartao(c.id, m) }; }).filter(x => x.v > 0);
          return <CartaoCard key={c.id} card={c} faturaMes={bill} futuros={futuros} onOpen={() => { setSelectedCard(c.id); setCardAddMode(false); setNf(defNf(c.id)); setSheet("cardDetail"); }} onDelete={() => { setDelKid(c.id); setSheet("delCard"); }} />;
        })}
      </div>)}

      {/* ═══ ABA PARCELAS ═══ */}
      {sub === "parcelas" && (<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {allParcelas.length === 0 && <div style={{ textAlign: "center", padding: "32px 0", color: "var(--vf-tm)" }}><p style={{ fontSize: 30, margin: "0 0 8px" }}>📦</p><p style={{ margin: 0, fontWeight: 600 }}>Nenhuma parcela registrada</p><p style={{ margin: "6px 0 0", fontSize: 12 }}>Adicione uma saída parcelada para ver o compromisso futuro</p></div>}
        {allParcelas.map(t => <ParcelaItem key={t.id} t={t} curMonth={curMonth} cards={cards} onDelete={handleRemoveTrans} />)}
      </div>)}

      {/* ═══ SHEETS ═══ */}

      {sheet === "budget" && (<Sheet title="💰 Orçamento do Mês" onClose={() => setSheet(null)}><p style={{ margin: "-10px 0 12px", fontSize: 12, color: "var(--vf-tm)" }}>Quanto você tem disponível para gastar este mês?</p><FInput value={budgetInput} onChange={setBudgetInput} placeholder="Ex: 3500.00" type="number" /><div style={{ height: 12 }} /><Btn onClick={saveBudget}>Salvar</Btn><Btn variant="ghost" onClick={() => setSheet(null)}>Cancelar</Btn></Sheet>)}

      {sheet === "projecao" && (<Sheet title="📅 Histórico & Projeção" onClose={() => setSheet(null)}>
        <p style={{ margin: "-10px 0 14px", fontSize: 12, color: "var(--vf-tm)" }}>Deslize para navegar entre os meses</p>
        {sortedMonths.length === 0 && <p style={{ color: "var(--vf-tm)", fontSize: 13, textAlign: "center", padding: 16 }}>Nenhum dado ainda.</p>}
        <div style={{ display: "flex", gap: 14, overflowX: "auto", scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch", paddingBottom: 16, marginLeft: -20, marginRight: -20, paddingLeft: 20, paddingRight: 20 }}>
          {sortedMonths.map(m => { const g = monthMap[m]!; const saldo = g.ent - g.sai; const isCurr = m === curMonth; const isFut = m > curMonth; return (
            <div key={m} style={{ minWidth: "78vw", maxWidth: 300, scrollSnapAlign: "start", flexShrink: 0, borderRadius: 22, padding: "20px 22px", background: isCurr ? "var(--vf-gh)" : isFut ? "var(--vf-alt)" : "var(--vf-surf)", border: `1.5px solid ${isCurr ? "transparent" : "var(--vf-bd)"}`, boxShadow: isCurr ? "0 8px 24px rgba(0,0,0,.12)" : "none", color: isCurr ? "#fff" : "var(--vf-tx)", position: "relative", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 800 }}>{fmtMonth(m)}</span>
                {isCurr && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, background: "rgba(255,255,255,.25)", color: "#fff", fontWeight: 700 }}>ATUAL</span>}
                {isFut && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, background: "color-mix(in srgb, var(--vf-wn) 16%, transparent)", color: "var(--vf-wn)", fontWeight: 700 }}>PROJEÇÃO</span>}
              </div>
              <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, opacity: .7 }}>SALDO</p>
              <p style={{ margin: "0 0 16px", fontSize: 30, fontWeight: 900, lineHeight: 1, color: saldo >= 0 ? (isCurr ? "var(--vf-ok-light)" : "var(--vf-ok)") : (isCurr ? "var(--vf-er-light)" : "var(--vf-er)") }}>{saldo >= 0 ? "+" : ""}R$ {fmtBRL(saldo)}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1px 1fr" }}>
                <div><p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: isCurr ? "rgba(255,255,255,.75)" : "var(--vf-tm)" }}>ENTRADAS</p><p style={{ margin: "3px 0 0", fontSize: 15, fontWeight: 900, color: isCurr ? "var(--vf-ok-light)" : "var(--vf-ok)" }}>R$ {fmtBRL(g.ent)}</p></div>
                <div style={{ background: isCurr ? "rgba(255,255,255,.2)" : "var(--vf-bd)" }} />
                <div style={{ paddingLeft: 14 }}><p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: isCurr ? "rgba(255,255,255,.75)" : "var(--vf-tm)" }}>SAÍDAS</p><p style={{ margin: "3px 0 0", fontSize: 15, fontWeight: 900, color: isCurr ? "var(--vf-er-light)" : "var(--vf-er)" }}>R$ {fmtBRL(g.sai)}</p></div>
              </div>
              {isCurr && <div style={{ position: "absolute", right: -20, bottom: -20, width: 90, height: 90, borderRadius: 99, background: "rgba(255,255,255,.08)" }} />}
            </div>);
          })}
          <div style={{ minWidth: 6, flexShrink: 0 }} />
        </div>
      </Sheet>)}

      {sheet === "addEntrada" && (<Sheet title="↑ Nova Entrada" onClose={() => setSheet(null)}><div style={{ display: "flex", flexDirection: "column", gap: 12 }}><FInput value={nf.desc} onChange={v => setNf(x => ({ ...x, desc: v }))} placeholder="Descrição" /><FInput value={nf.val} onChange={v => setNf(x => ({ ...x, val: v }))} placeholder="Valor (R$)" type="number" /><FInput value={nf.date} onChange={v => setNf(x => ({ ...x, date: v }))} type="date" /><p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--vf-tm)", fontWeight: 700 }}>Categoria:</p><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{CATS_ENT.map(c => <Chip key={c} active={nf.cat === c} onClick={() => setNf(x => ({ ...x, cat: c }))}>{c}</Chip>)}</div><Btn onClick={saveEntrada}>💚 Salvar Entrada</Btn><Btn variant="ghost" onClick={() => setSheet(null)}>Cancelar</Btn></div></Sheet>)}

      {sheet === "addSaida" && (<Sheet title="↓ Nova Saída" onClose={() => setSheet(null)}><SaidaForm isCardDirect={false} /></Sheet>)}

      {sheet === "addCard" && (<Sheet title="Novo Cartão" onClose={() => setSheet(null)}><div style={{ display: "flex", flexDirection: "column", gap: 12 }}><FInput value={nc.name} onChange={v => setNc(x => ({ ...x, name: v }))} placeholder="Nome do cartão (ex: Nubank)" /><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{BRANDS.map(b => <Chip key={b} active={nc.brand === b} onClick={() => setNc(x => ({ ...x, brand: b }))}>{b}</Chip>)}</div><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}><div><p style={{ margin: "0 0 6px", fontSize: 12, color: "var(--vf-tm)", fontWeight: 600 }}>Dia de fechamento</p><FInput value={String(nc.closeDay)} onChange={v => setNc(x => ({ ...x, closeDay: parseInt(v) || 5 }))} placeholder="Ex: 5" type="number" /></div><div><p style={{ margin: "0 0 6px", fontSize: 12, color: "var(--vf-tm)", fontWeight: 600 }}>Dia de vencimento</p><FInput value={String(nc.dueDay)} onChange={v => setNc(x => ({ ...x, dueDay: parseInt(v) || 15 }))} placeholder="Ex: 15" type="number" /></div></div><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{C_CORES.map(c => <button key={c} onClick={() => setNc(x => ({ ...x, color: c }))} style={{ width: 38, height: 38, borderRadius: 99, background: c, border: nc.color === c ? "3px solid var(--vf-p)" : "2px solid transparent", cursor: "pointer", WebkitTapHighlightColor: "transparent" }} />)}</div><Btn onClick={addCard}>💳 Cadastrar Cartão</Btn><Btn variant="ghost" onClick={() => setSheet(null)}>Cancelar</Btn></div></Sheet>)}

      {sheet === "cardDetail" && sCard && (<Sheet title={`💳 ${sCard.name}`} onClose={() => { setSheet(null); setCardAddMode(false); setNf(defNf()); }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ padding: 16, borderRadius: 16, background: `color-mix(in srgb, ${sCard.color} 10%, transparent)`, border: `1.5px solid color-mix(in srgb, ${sCard.color} 35%, transparent)` }}>
            <p style={{ margin: 0, fontSize: 11, color: "var(--vf-tm)", fontWeight: 700 }}>FATURA ATUAL · {fmtMonth(curMonth)}</p>
            <p style={{ margin: "4px 0 4px", fontSize: 28, fontWeight: 900, color: "var(--vf-tx)" }}>R$ {fmtBRL(sCardCur)}</p>
            <p style={{ margin: 0, fontSize: 12, color: "var(--vf-tm)" }}>Fecha dia {sCard.closeDay} · Vence dia {sCard.dueDay}</p>
          </div>
          {!cardAddMode && <button onClick={() => { setNf(defNf(sCard.id)); setCardAddMode(true); }} style={{ padding: 12, borderRadius: 14, border: "1.5px solid var(--vf-p)", background: "color-mix(in srgb, var(--vf-p) 8%, transparent)", color: "var(--vf-p)", fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit", WebkitTapHighlightColor: "transparent" }}>+ Nova compra neste cartão</button>}
          {cardAddMode && <div style={{ background: "var(--vf-alt)", borderRadius: 16, padding: "16px 14px", border: "1px solid var(--vf-bd)" }}><p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 800, color: "var(--vf-tx)" }}>Nova compra — {sCard.name}</p><SaidaForm isCardDirect={true} /></div>}
          <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "var(--vf-tx)" }}>Compras vinculadas:</p>
          {sCardTrans.length === 0 ? <p style={{ color: "var(--vf-tm)", fontSize: 13, textAlign: "center", padding: 12 }}>Nenhuma compra vinculada ainda</p> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {sCardTrans.slice(0, 20).map(t => (
                <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 13px", borderRadius: 12, background: "var(--vf-surf)", border: "1px solid var(--vf-bd)" }}>
                  <div style={{ flex: 1, minWidth: 0 }}><p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--vf-tx)" }}>{t.desc}</p><p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--vf-tm)" }}>{t.date} · {t.cat}</p></div>
                  <span style={{ fontWeight: 900, fontSize: 13, color: "var(--vf-er)", flexShrink: 0, marginLeft: 8 }}>R$ {fmtBRL(t.val)}</span>
                  <button onClick={() => handleRemoveTrans(t.id)} style={{ width: 28, height: 28, borderRadius: 8, background: "color-mix(in srgb, var(--vf-er) 10%, transparent)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, marginLeft: 8, WebkitTapHighlightColor: "transparent" }}><Trash2 size={13} color="var(--vf-er)" /></button>
                </div>
              ))}
            </div>
          )}
          <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "var(--vf-tx)" }}>Previsão de faturas:</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[1, 2, 3].map(i => { const d = new Date(); d.setMonth(d.getMonth() + i); const m = d.toISOString().slice(0, 7); const v = faturasCartao(sCard.id, m); return (
              <div key={m} style={{ display: "flex", justifyContent: "space-between", padding: "11px 14px", borderRadius: 12, background: "var(--vf-alt)" }}>
                <span style={{ fontSize: 13, color: "var(--vf-tx)", fontWeight: 700 }}>{fmtMonth(m)}</span>
                <span style={{ fontSize: 13, fontWeight: 900, color: v > 0 ? "var(--vf-er)" : "var(--vf-tm)" }}>R$ {fmtBRL(v)}</span>
              </div>);
            })}
          </div>
        </div>
      </Sheet>)}

      {sheet === "delTrans" && delTrans && <ConfirmDel label={delTrans.desc} onCancel={() => setSheet(null)} onConfirm={() => handleRemoveTrans()} />}
      {sheet === "delCard" && delCardO && <ConfirmDel label={delCardO.name} onCancel={() => setSheet(null)} onConfirm={handleRemoveCard} />}
    </div>
  );
}
