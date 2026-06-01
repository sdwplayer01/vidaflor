import { NOTE_COLORS } from '@/shared/constants/colors';
const NOTE_WHITE = NOTE_COLORS[0]; // '#FFFFFF'
// src/features/organiza/components/NoteCard.tsx
import { Trash2 } from "lucide-react";
import type { Note } from "../types";
import type { ID } from "@/shared/types/common";

interface Props {
  note:     Note;
  onRemove: (id: ID) => void;
  onEdit:   (note: Note) => void;
}

export function NoteCard({ note, onRemove, onEdit }: Props) {
  return (
    <div
      onClick={() => onEdit(note)}
      style={{
        padding: "14px 16px", borderRadius: 16, cursor: "pointer",
        background: note.color && note.color !== NOTE_WHITE ? note.color + "22" : "var(--vf-surf)",
        border: `1.5px solid ${note.color && note.color !== NOTE_WHITE ? note.color + "55" : "var(--vf-bd)"}`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {note.title && (
            <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: "var(--vf-tx)" }}>
              {note.title}
            </p>
          )}
          <p style={{
            margin: 0, fontSize: 13, color: "var(--vf-tm)",
            overflow: "hidden", display: "-webkit-box",
            WebkitLineClamp: 3, WebkitBoxOrient: "vertical",
          }}>
            {note.content}
          </p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(note.id); }}
          style={{
            width: 28, height: 28, borderRadius: 8, flexShrink: 0, marginLeft: 8,
            background: "color-mix(in srgb, var(--vf-er) 10%, transparent)",
            border: "none", display: "flex", alignItems: "center",
            justifyContent: "center", cursor: "pointer",
            WebkitTapHighlightColor: "transparent",
          }}
          aria-label="Remover nota"
        >
          <Trash2 size={12} color="var(--vf-er)" />
        </button>
      </div>
    </div>
  );
}
