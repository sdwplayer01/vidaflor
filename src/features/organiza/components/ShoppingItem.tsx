// src/features/organiza/components/ShoppingItem.tsx
import { Check, Pencil, Trash2 } from "lucide-react";
import { formatBRL } from "@/shared/utils/money";
import type { ShoppingItem } from "../types";
import type { ID } from "@/shared/types/common";

interface Props {
  item:     ShoppingItem;
  onToggle: (id: ID) => void;
  onEdit:   (item: ShoppingItem) => void;
  onRemove: (id: ID) => void;
}

export function ShoppingItem({ item, onToggle, onEdit, onRemove }: Props) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, padding: "11px 14px",
      borderRadius: 14, background: "var(--vf-surf)", border: "1px solid var(--vf-bd)",
      opacity: item.done ? 0.55 : 1,
    }}>
      {/* Checkbox — 1 toque risca */}
      <button
        onClick={() => onToggle(item.id)}
        style={{
          width: 26, height: 26, borderRadius: 7, flexShrink: 0,
          background: item.done ? "var(--vf-ok)" : "transparent",
          border: item.done ? "none" : "2px solid var(--vf-bd)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", WebkitTapHighlightColor: "transparent",
        }}
        aria-label={item.done ? "Desmarcar" : "Marcar como comprado"}
      >
        {item.done && <Check size={13} color="#fff" strokeWidth={3} />}
      </button>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0, fontSize: 14, fontWeight: 600, color: "var(--vf-tx)",
          textDecoration: item.done ? "line-through" : "none",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>{item.name}</p>
        <div style={{ display: "flex", gap: 8, marginTop: 2, alignItems: "center" }}>
          {item.quantity && (
            <span style={{ fontSize: 11, color: "var(--vf-tx-mute)" }}>×{item.quantity}</span>
          )}
          {(item.price ?? 0) > 0 && (
            <span style={{ fontSize: 11, color: "var(--vf-tx-mute)", fontVariantNumeric: "tabular-nums" }}>
              R$ {formatBRL(item.price!)}
            </span>
          )}
        </div>
      </div>

      {/* Ações */}
      {!item.done && (
        <button
          onClick={() => onEdit(item)}
          style={{
            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
            background: "transparent", border: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "var(--vf-tx-mute)",
            WebkitTapHighlightColor: "transparent",
          }}
          aria-label="Editar item"
        >
          <Pencil size={13} />
        </button>
      )}
      <button
        onClick={() => onRemove(item.id)}
        style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
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
