// src/features/organiza/components/AddNoteSheet.tsx
import { useState, useEffect } from "react";
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

export function AddNoteSheet({ isOpen, onClose, notaEditando }: Props) {
  const adicionarNota = useOrganizaStore((s) => s.adicionarNota);
  const atualizarNota = useOrganizaStore((s) => s.atualizarNota);

  const [form, setForm] = useState({
    title:   notaEditando?.title   ?? "",
    content: notaEditando?.content ?? "",
    color:   notaEditando?.color   ?? NOTE_COLORS[0],
  });

  useEffect(() => {
    if (!isOpen) return;
    setForm({
      title:   notaEditando?.title   ?? "",
      content: notaEditando?.content ?? "",
      color:   notaEditando?.color   ?? NOTE_COLORS[0],
    });
  }, [isOpen, notaEditando?.id]);

  if (!isOpen) return null;

  const salvar = () => {
    if (!form.content.trim() && !form.title.trim()) return;
    if (notaEditando) {
      atualizarNota(notaEditando.id, { title: form.title, content: form.content, color: form.color });
    } else {
      adicionarNota({ title: form.title, content: form.content, color: form.color });
    }
    setForm({ title: "", content: "", color: NOTE_COLORS[0] ?? "" });
    onClose();
  };

  return (
    <Sheet title={notaEditando ? "Editar Nota" : "Nova Nota"} onClose={onClose}>
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
          {notaEditando ? "Salvar" : "Adicionar"}
        </Btn>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
      </div>
    </Sheet>
  );
}
