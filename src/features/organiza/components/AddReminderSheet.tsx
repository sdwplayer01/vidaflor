// src/features/organiza/components/AddReminderSheet.tsx
import { useState } from "react";
import { Sheet }   from "@/shared/ui/Sheet";
import { FInput }  from "@/shared/ui/FInput";
import { FSelect } from "@/shared/ui/FSelect";
import { Btn }     from "@/shared/ui/Btn";
import { useOrganizaStore } from "../store";
import { today } from "@/shared/utils/date";
import type { ReminderPriority } from "../types";

interface Props { isOpen: boolean; onClose: () => void; }

const PRIORIDADES: { value: ReminderPriority; label: string }[] = [
  { value: "baixa", label: "Baixa" },
  { value: "media", label: "Media" },
  { value: "alta",  label: "Alta" },
];

const CATEGORIAS = [
  { value: "Casa",    label: "Casa" },
  { value: "Saude",   label: "Saude" },
  { value: "Trabalho",label: "Trabalho" },
  { value: "Familia", label: "Familia" },
  { value: "Financas",label: "Financas" },
  { value: "Outros",  label: "Outros" },
];

export function AddReminderSheet({ isOpen, onClose }: Props) {
  const adicionarLembrete = useOrganizaStore((s) => s.adicionarLembrete);
  const [form, setForm] = useState({
    title: "", date: today(), time: "", category: "Casa", priority: "media" as ReminderPriority,
  });

  if (!isOpen) return null;

  const salvar = () => {
    if (!form.title.trim() || !form.date) return;
    adicionarLembrete({
      title:    form.title.trim(),
      date:     form.date,
      time:     form.time || undefined,
      category: form.category,
      priority: form.priority,
    });
    setForm({ title: "", date: today(), time: "", category: "Casa", priority: "media" });
    onClose();
  };

  return (
    <Sheet title="Novo Lembrete" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <FInput value={form.title} onChange={(v) => setForm((f) => ({ ...f, title: v }))} placeholder="Titulo" />
        <FInput value={form.date} onChange={(v) => setForm((f) => ({ ...f, date: v }))} type="date" />
        <FInput value={form.time} onChange={(v) => setForm((f) => ({ ...f, time: v }))} placeholder="Horario (opcional)" type="time" />
        <FSelect
          label="Área"
          value={form.category}
          onChange={(v) => setForm((f) => ({ ...f, category: v }))}
          options={CATEGORIAS}
        />
        <FSelect
          label="Prioridade"
          value={form.priority}
          onChange={(v) => setForm((f) => ({ ...f, priority: v as ReminderPriority }))}
          options={PRIORIDADES}
        />
        <Btn onClick={salvar} disabled={!form.title.trim()}>Adicionar</Btn>
      </div>
    </Sheet>
  );
}
