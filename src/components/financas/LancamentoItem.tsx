// src/components/financas/LancamentoItem.tsx
// Item de lançamento (entrada/saída) usado na aba Lançamentos.

import { Check, Clock, Trash2 } from "lucide-react";
import type { Transaction, Card as CardType } from "@/types/data";
import { today, fmtBRL } from "@/utils/date";

function InstBadge({ t }: { t: Transaction }) {
  if (!t.installment) return null;
  return (
    <span style={{
      fontSize: 10, padding: "2px 7px", borderRadius: 6,
      background: "color-mix(in srgb, var(--vf-p) 14%, transparent)",
      color: "var(--vf-p)", fontWeight: 700, marginLeft: 4, flexShrink: 0,
    }}>
      {t.installment.current}/{t.installment.total}x
    </span>
  );
}

interface Props {
  t: Transaction;
  cards: CardType[];
  onTogglePago: (id: number) => void;
  onDelete: (id: number) => void;
}

export function LancamentoItem({ t, cards, onTogglePago, onDelete }: Props) {
  const overdue = !t.paid && t.due != null && new Date(t.due) < new Date(today());
  const cardName = t.cardId ? cards.find(c => c.id === t.cardId)?.name : null;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12, padding: "14px 15px", borderRadius: 16,
      background: "var(--vf-surf)",
      border: `1.5px solid ${t.paid ? "var(--vf-ok)" : overdue ? "var(--vf-er)" : "var(--vf-bd)"}`,
    }}>
      <button
        onClick={() => onTogglePago(t.id)}
        style={{
          width: 34, height: 34, borderRadius: 11,
          background: t.paid ? "var(--vf-ok)" : "var(--vf-alt)",
          border: "none", display: "flex", alignItems: "center",
          justifyContent: "center", cursor: "pointer", flexShrink: 0,
          WebkitTapHighlightColor: "transparent",
        }}
      >
        {t.paid
          ? <Check size={18} color="#fff" />
          : <Clock size={16} color="var(--vf-tm)" />}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
          <p style={{
            margin: 0, fontWeight: 700, color: "var(--vf-tx)", fontSize: 14,
            textDecoration: t.paid ? "line-through" : "none",
            opacity: t.paid ? .6 : 1, marginRight: 4,
          }}>{t.desc}</p>
          <InstBadge t={t} />
        </div>
        <p style={{ margin: 0, color: overdue ? "var(--vf-er)" : "var(--vf-tm)", fontSize: 11, fontWeight: 600, marginTop: 2 }}>
          {t.cat}
          {cardName && ` · 💳 ${cardName}`}
          {t.due && ` · vence ${t.due}`}
        </p>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <p style={{ margin: 0, fontWeight: 900, fontSize: 15, color: t.type === "income" ? "var(--vf-ok)" : "var(--vf-er)" }}>
          {t.type === "income" ? "+" : "-"}R$ {fmtBRL(t.val)}
        </p>
        <button
          onClick={() => onDelete(t.id)}
          style={{
            background: "none", border: "none", color: "var(--vf-er)",
            fontSize: 10, cursor: "pointer", fontWeight: 700, fontFamily: "inherit",
            WebkitTapHighlightColor: "transparent",
          }}
        >REMOVER</button>
      </div>
    </div>
  );
}
