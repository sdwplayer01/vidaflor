// src/features/organiza/components/RemindersTab.tsx
import { useState } from "react";
import { Bell } from "lucide-react";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ConfirmDel } from "@/shared/ui/ConfirmDel";
import { Btn } from "@/shared/ui/Btn";
import { useOrganizaStore } from "../store";
import { useLembretesPendentes, useLembretesUrgentes } from "../selectors";
import { AddReminderSheet } from "./AddReminderSheet";
import { ReminderItem } from "./ReminderItem";
import type { ID } from "@/shared/types/common";

export function RemindersTab() {
  const pendentes   = useLembretesPendentes();
  const urgentes    = useLembretesUrgentes();
  const marcarLembreteFeito = useOrganizaStore((s) => s.marcarLembreteFeito);
  const removerLembrete     = useOrganizaStore((s) => s.removerLembrete);

  const [sheetAdd, setSheetAdd]     = useState(false);
  const [deletandoId, setDeletandoId] = useState<ID | null>(null);

  const lembrDeletando = pendentes.find((r) => r.id === deletandoId);

  if (pendentes.length === 0) {
    return (
      <>
        <EmptyState icon={<Bell size={24} />} title="Nenhum lembrete" desc="Adicione lembretes para não esquecer nada" />
        <Btn onClick={() => setSheetAdd(true)} style={{ marginTop: 12 }}>+ Adicionar lembrete</Btn>
        <AddReminderSheet isOpen={sheetAdd} onClose={() => setSheetAdd(false)} />
      </>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <Btn onClick={() => setSheetAdd(true)} style={{ marginBottom: 4 }}>+ Adicionar lembrete</Btn>
      {urgentes.length > 0 && (
        <div style={{
          padding: "8px 12px", borderRadius: 10, marginBottom: 4,
          background: "color-mix(in srgb, var(--vf-er) 8%, transparent)",
          border: "1px solid color-mix(in srgb, var(--vf-er) 20%, transparent)",
        }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "var(--vf-er)" }}>
            {urgentes.length} lembrete(s) urgente(s)
          </p>
        </div>
      )}
      {pendentes.map((r) => (
        <ReminderItem
          key={r.id}
          reminder={r}
          onToggle={marcarLembreteFeito}
          onRemove={(id) => setDeletandoId(id)}
        />
      ))}
      {deletandoId && lembrDeletando && (
        <ConfirmDel
          label={lembrDeletando.title}
          onCancel={() => setDeletandoId(null)}
          onConfirm={() => { removerLembrete(deletandoId); setDeletandoId(null); }}
        />
      )}
      <AddReminderSheet isOpen={sheetAdd} onClose={() => setSheetAdd(false)} />
    </div>
  );
}
