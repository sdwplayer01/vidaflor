// src/features/organiza/components/AddNoteSheet.tsx
import { useState } from "react";
import { Sheet }  from "@/shared/ui/Sheet";
import { FInput } from "@/shared/ui/FInput";
import { Btn }    from "@/shared/ui/Btn";
import { useOrganizaStore } from "../store";
import { NOTE_COLORS } from "@/shared/constants/colors";
import type { Note } from "../types";

interface Props {
  isOpen:        boolean;
  onClose:       () => void;
  notaEditando?: Note | null;
}

interface NoteFormProps {
  initial:  Pick<Note, "title" | "content" | "color"> | null | undefined;
  isEdit:   boolean;
  onSubmit: (data: Pick<Note, "title" | "content" | "color">) => void;
  onClose:  () => void;
}

function NoteForm({ initial, isEdit, onSubmit, onClose }: NoteFormProps) {
  const [form, setForm] = useState({
    title:   initial?.title   ?? "",
    content: initial?.content ?? "",
    color:   initial?.color   ?? NOTE_COLORS[0] ?? "",
  });

  const salvar = () => {
    if (!form.content.trim() && !form.title.trim()) return;
    onSubmit({ title: form.title, content: form.content, color: form.color });
    onClose();
  };

  return (
    <Sheet title={isEdit ? "Editar Nota" : "Nova Nota"} onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <FInput value={form.title} onChange={(v) => setForm((f) => ({ ...f, title: v }))} placeholder="Titulo (opcional)" />
        <textarea
          value={form.content}
          onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
          placeholder="Conteudo..."
          rows={4}
          style={{
            width: "100%", borderRadius: 12, padding: "10px 14px", fontSize: 14,
            background: "var(--vf-alt)", border: "1.5px solid var(--vf-bd)",
            color: "var(--vf-tx)", resize: "none", boxSizing: "border-box",
            fontFamily: "inherit",
          }}
        />
        <div style={{ display: "flex", gap: 8 }}>
          {NOTE_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setForm((f) => ({ ...f, color: c }))}
              style={{
                width: 28, height: 28, borderRadius: "50%",
                background: c === NOTE_COLORS[0] ? "var(--vf-surf)" : c,
                border: form.color === c ? "2.5px solid var(--vf-p)" : "1.5px solid var(--vf-bd)",
                cursor: "pointer",
              }}
              aria-label={`Cor ${c}`}
            />
          ))}
        </div>
        <Btn onClick={salvar} disabled={!form.content.trim() && !form.title.trim()}>
          {isEdit ? "Salvar" : "Adicionar"}
        </Btn>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
      </div>
    </Sheet>
  );
}

export function AddNoteSheet({ isOpen, onClose, notaEditando }: Props) {
  const adicionarNota = useOrganizaStore((s) => s.adicionarNota);
  const atualizarNota = useOrganizaStore((s) => s.atualizarNota);

  if (!isOpen) return null;

  const handleSubmit = (data: Pick<Note, "title" | "content" | "color">) => {
    if (notaEditando) {
      atualizarNota(notaEditando.id, data);
    } else {
      adicionarNota(data);
    }
  };

  return (
    <NoteForm
      key={notaEditando?.id ?? "nova"}
      initial={notaEditando}
      isEdit={Boolean(notaEditando)}
      onSubmit={handleSubmit}
      onClose={onClose}
    />
  );
}
