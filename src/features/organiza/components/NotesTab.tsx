// src/features/organiza/components/NotesTab.tsx
import { useState } from "react";
import { StickyNote } from "lucide-react";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ConfirmDel } from "@/shared/ui/ConfirmDel";
import { Btn } from "@/shared/ui/Btn";
import { useOrganizaStore } from "../store";
import { useNotasOrdenadas } from "../selectors";
import { AddNoteSheet } from "./AddNoteSheet";
import { NoteCard } from "./NoteCard";
import type { ID } from "@/shared/types/common";
import type { Note } from "../types";

export function NotesTab() {
  const notas      = useNotasOrdenadas();
  const removerNota = useOrganizaStore((s) => s.removerNota);

  const [sheetAdd, setSheetAdd]         = useState(false);
  const [notaEditando, setNotaEditando] = useState<Note | null>(null);
  const [deletandoId, setDeletandoId]   = useState<ID | null>(null);

  const notaDeletando = notas.find((n) => n.id === deletandoId);

  if (notas.length === 0) {
    return (
      <>
        <EmptyState icon={<StickyNote size={24} />} title="Nenhuma nota" desc="Anote o que precisar" />
        <Btn onClick={() => setSheetAdd(true)} style={{ marginTop: 12 }}>+ Adicionar nota</Btn>
        <AddNoteSheet isOpen={sheetAdd} onClose={() => setSheetAdd(false)} />
      </>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <Btn onClick={() => setSheetAdd(true)} style={{ marginBottom: 4 }}>+ Adicionar nota</Btn>
      {notas.map((n) => (
        <NoteCard
          key={n.id}
          note={n}
          onEdit={(nota) => { setNotaEditando(nota); setSheetAdd(true); }}
          onRemove={(id) => setDeletandoId(id)}
        />
      ))}
      {deletandoId && notaDeletando && (
        <ConfirmDel
          label={notaDeletando.title || notaDeletando.content.slice(0, 40)}
          onCancel={() => setDeletandoId(null)}
          onConfirm={() => { removerNota(deletandoId); setDeletandoId(null); }}
        />
      )}
      <AddNoteSheet
        isOpen={sheetAdd}
        onClose={() => { setSheetAdd(false); setNotaEditando(null); }}
        notaEditando={notaEditando}
      />
    </div>
  );
}
