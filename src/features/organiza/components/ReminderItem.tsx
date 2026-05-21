// src/features/organiza/components/ReminderItem.tsx
import { Check, Trash2, Bell } from "lucide-react";
import { formatBR } from "@/shared/utils/date";
import type { Reminder } from "../types";
import type { ID } from "@/shared/types/common";

const PRIORITY_COLOR: Record<string, string> = {
  alta:  "var(--vf-er)",
  media: "var(--vf-wn)",
  baixa: "var(--vf-ok)",
};

interface Props {
  reminder: Reminder;
  onToggle: (id: ID) => void;
  onRemove: (id: ID) => void;
}

export function ReminderItem({ reminder, onToggle, onRemove }: Props) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
      borderRadius: 14, background: "var(--vf-surf)", border: "1px solid var(--vf-bd)",
      opacity: reminder.done ? 0.6 : 1,
    }}>
      <button
        onClick={() => onToggle(reminder.id)}
        style={{
          width: 32, height: 32, borderRadius: 10, flexShrink: 0,
          background: reminder.done ? "var(--vf-ok)" : "var(--vf-surf)",
          border: reminder.done ? "none" : "2px solid var(--vf-bd)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", WebkitTapHighlightColor: "transparent",
        }}
        aria-label={reminder.done ? "Desmarcar" : "Marcar como feito"}
      >
        {reminder.done ? <Check size={14} color="#fff" /> : <Bell size={14} color="var(--vf-tm)" />}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0, fontSize: 14, fontWeight: 600, color: "var(--vf-tx)",
          textDecoration: reminder.done ? "line-through" : "none",
        }}>{reminder.title}</p>
        <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--vf-tm)" }}>
          {formatBR(reminder.date)}{reminder.time ? ` - ${reminder.time}` : ""} · {reminder.category}
        </p>
      </div>
      <div style={{
        width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
        background: PRIORITY_COLOR[reminder.priority] ?? "var(--vf-tm)",
      }} aria-label={`Prioridade ${reminder.priority}`} />
      <button
        onClick={() => onRemove(reminder.id)}
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
