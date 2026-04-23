// src/components/financas/CartaoCard.tsx
// Card visual de cartão de crédito usado na aba Cartões.

import { CreditCard, X } from "lucide-react";
import type { Card as CardType } from "@/types/data";
import { fmtBRL, fmtMonth } from "@/utils/date";

interface Props {
  card: CardType;
  faturaMes: number;
  futuros: { m: string; v: number }[];
  onOpen: () => void;
  onDelete: () => void;
}

export function CartaoCard({ card, faturaMes, futuros, onOpen, onDelete }: Props) {
  return (
    <div
      onClick={onOpen}
      style={{
        background: card.color, borderRadius: 22, padding: 22, color: "#fff",
        position: "relative", overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,.16)",
        cursor: "pointer", WebkitTapHighlightColor: "transparent",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
        <div>
          <p style={{ margin: 0, fontSize: 11, opacity: .65, fontWeight: 700, letterSpacing: "1px" }}>{card.brand.toUpperCase()}</p>
          <p style={{ margin: "4px 0 0", fontSize: 21, fontWeight: 900 }}>{card.name}</p>
        </div>
        <CreditCard size={26} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <p style={{ margin: 0, fontSize: 10, opacity: .7, fontWeight: 700 }}>FATURA ATUAL</p>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>R$ {fmtBRL(faturaMes)}</p>
          <p style={{ margin: "3px 0 0", fontSize: 11, opacity: .75 }}>Fecha dia {card.closeDay} · Vence dia {card.dueDay}</p>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onDelete(); }}
          style={{
            background: "rgba(255,255,255,.2)", border: "none", color: "#fff",
            width: 32, height: 32, borderRadius: 10, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <X size={14} />
        </button>
      </div>
      {futuros.length > 0 && (
        <div style={{ marginTop: 14, display: "flex", gap: 6, flexWrap: "wrap" }}>
          {futuros.map(f => (
            <div key={f.m} style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(0,0,0,.18)", fontSize: 11, fontWeight: 700 }}>
              {fmtMonth(f.m)}: R$ {fmtBRL(f.v)}
            </div>
          ))}
        </div>
      )}
      <div style={{ position: "absolute", right: -20, bottom: -20, width: 100, height: 100, borderRadius: 99, background: "rgba(255,255,255,.08)" }} />
      <p style={{ position: "absolute", top: 22, right: 56, margin: 0, fontSize: 10, opacity: .5, fontWeight: 700 }}>ver detalhes</p>
    </div>
  );
}
