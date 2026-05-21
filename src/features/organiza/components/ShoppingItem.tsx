// src/features/organiza/components/ShoppingItem.tsx
import { Check, Trash2 } from "lucide-react";
import type { ShoppingItem } from "../types";
import type { ID } from "@/shared/types/common";

interface Props {
  item:        ShoppingItem;
  onToggle:    (id: ID) => void;
  onRemove:    (id: ID) => void;
}

export function ShoppingItem({ item, onToggle, onRemove }: Props) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
      borderRadius: 14, background: "var(--vf-surf)", border: "1px solid var(--vf-bd)",
      opacity: item.done ? 0.6 : 1,
    }}>
      <button
        onClick={() => onToggle(item.id)}
        style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
          background: item.done ? "var(--vf-ok)" : "var(--vf-surf)",
          border: item.done ? "none" : "2px solid var(--vf-bd)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", WebkitTapHighlightColor: "transparent",
        }}
        aria-label={item.done ? "Desmarcar" : "Marcar como comprado"}
      >
        {item.done && <Check size={14} color="#fff" />}
      </button>
      <div style={{ flex: 1 }}>
        <p style={{
          margin: 0, fontSize: 14, fontWeight: 600, color: "var(--vf-tx)",
          textDecoration: item.done ? "line-through" : "none",
        }}>{item.name}</p>
        {item.quantity && (
          <p style={{ margin: 0, fontSize: 11, color: "var(--vf-tm)" }}>
            Qtd: {item.quantity}
          </p>
        )}
      </div>
      <span style={{
        fontSize: 11, color: "var(--vf-tm)", padding: "2px 8px",
        borderRadius: 6, background: "var(--vf-alt)", flexShrink: 0,
      }}>{item.category}</span>
      <button
        onClick={() => onRemove(item.id)}
        style={{
          width: 28, height: 28, borderRadius: 8,
          background: "color-mix(in srgb, var(--vf-er) 10%, transparent)",
          border: "none", display: "flex", alignItems: "center",
          justifyContent: "center", cursor: "pointer",
          WebkitTapHighlightColor: "transparent",
        }}
        aria-label="Remover"
      >
        <Trash2 size={12} color="var(--vf-er)" />
      </button>
    </div>
  );
}
