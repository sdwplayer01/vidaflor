// src/features/kids/components/AddKidTaskSheet.tsx
import { useState } from 'react';
import { Sheet }  from '@/shared/ui/Sheet';
import { FInput } from '@/shared/ui/FInput';
import { Btn }    from '@/shared/ui/Btn';
import { useKidsStore } from '../store';
import type { ID, Emoji } from '@/shared/types/common';

interface Props {
  kidId:   ID;
  isOpen:  boolean;
  onClose: () => void;
}

export function AddKidTaskSheet({ kidId, isOpen, onClose }: Props) {
  const adicionarTarefaKid = useKidsStore((s) => s.adicionarTarefaKid);
  const [form, setForm]    = useState({ task: '', emoji: '\u2705', time: '' });

  if (!isOpen) return null;

  const salvar = () => {
    if (!form.task.trim()) return;
    adicionarTarefaKid(kidId, form.task.trim(), form.emoji as Emoji, form.time || undefined);
    setForm({ task: '', emoji: '\u2705', time: '' });
    onClose();
  };

  return (
    <Sheet title="Nova Tarefa" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <FInput value={form.task}  onChange={(v) => setForm((f) => ({ ...f, task: v }))}  placeholder="O que fazer?" />
        <FInput value={form.emoji} onChange={(v) => setForm((f) => ({ ...f, emoji: v }))} placeholder="Emoji" />
        <FInput value={form.time}  onChange={(v) => setForm((f) => ({ ...f, time: v }))}  placeholder="Horario (opcional)" type="time" />
        <Btn onClick={salvar} disabled={!form.task.trim()}>Adicionar</Btn>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
      </div>
    </Sheet>
  );
}
