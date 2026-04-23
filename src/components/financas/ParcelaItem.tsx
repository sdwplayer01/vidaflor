// src/components/financas/ParcelaItem.tsx
// Item de parcela usado na aba Parcelas da FinancasScreen.

import { Check, Trash2 } from "lucide-react";
import type { Transaction, Card as CardType } from "@/types/data";
import { today, fmtBRL } from "@/utils/date";

interface Props {
  t: Transaction;
  curMonth: string;
  cards: CardType[];
  onDelete: (id: number) => void;
}

export function ParcelaItem({ t, curMonth, cards, onDelete }: Props) {
  const isCur  = t.date.slice(0, 7) === curMonth;
  const isFut  = t.date > today() && !isCur;
  const isPast = t.date < today() && !isCur;
  const badge = t.paid
    ? { lbl: "✅ pago",      c: "var(--vf-ok)" }
    : isCur  ? { lbl: "⏳ este mês",  c: "var(--vf-p)"  }
    : isFut  ? { lbl: "⬜ futuro",    c: "var(--vf-tm)" }
    :          { lbl: "⚠️ atrasado", c: "var(--vf-er)" };
  const cardName = t.cardId ? cards.find(c => c.id === t.cardId)?.name : null;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12, padding: "13px 15px", borderRadius: 14,
      background: "var(--vf-surf)",
      border: `1.5px solid ${t.paid ? "var(--vf-ok)" : isCur ? "var(--vf-p)" : isPast && !t.paid ? "var(--vf-er)" : "var(--vf-bd)"}`,
      opacity: t.paid && isPast ? .65 : 1,
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 11,
        background: t.paid
          ? "color-mix(in srgb, var(--vf-ok) 14%, transparent)"
          : isCur ? "color-mix(in srgb, var(--vf-p) 14%, transparent)" : "var(--vf-alt)",
        border: `2px solid ${t.paid ? "var(--vf-ok)" : isCur ? "var(--vf-p)" : "var(--vf-bd)"}`,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        {t.paid
          ? <Check size={16} color="var(--vf-ok)" />
          : <span style={{ fontSize: 12, fontWeight: 900, color: isCur ? "var(--vf-p)" : "var(--vf-tm)" }}>{t.installment?.current}</span>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontWeight: 700, color: "var(--vf-tx)", fontSize: 14 }}>{t.desc}</p>
        <p style={{ margin: "2px 0 0", color: "var(--vf-tm)", fontSize: 11 }}>
          {t.installment?.current}/{t.installment?.total}x · {t.date}
          {cardName && ` · 💳 ${cardName}`}
        </p>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <p style={{ margin: 0, fontWeight: 900, fontSize: 14, color: "var(--vf-er)" }}>R$ {fmtBRL(t.val)}</p>
        <span style={{ fontSize: 10, fontWeight: 700, color: badge.c }}>{badge.lbl}</span>
      </div>
      <button
        onClick={() => onDelete(t.id)}
        style={{
          width: 28, height: 28, borderRadius: 8,
          background: "color-mix(in srgb, var(--vf-er) 10%, transparent)",
          border: "none", display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", flexShrink: 0, WebkitTapHighlightColor: "transparent",
        }}
      >
        <Trash2 size={13} color="var(--vf-er)" />
      </button>
    </div>
  );
}
