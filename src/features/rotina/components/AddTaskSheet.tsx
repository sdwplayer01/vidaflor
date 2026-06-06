// src/features/rotina/components/AddTaskSheet.tsx
import { useState } from 'react';
import { Sheet }  from '@/shared/ui/Sheet';
import { FInput } from '@/shared/ui/FInput';
import { Btn }    from '@/shared/ui/Btn';
import { useRotinaStore } from '../store';
import type { Turno } from '../types';

interface Props {
  isOpen:  boolean;
  onClose: () => void;
}

const TURNOS: { key: Turno; label: string }[] = [
  { key: 'manha', label: 'Manha' },
  { key: 'tarde', label: 'Tarde' },
  { key: 'noite', label: 'Noite' },
];

export function AddTaskSheet({ isOpen, onClose }: Props) {
  const adicionarTarefa = useRotinaStore((s) => s.adicionarTarefa);
  const [form, setForm] = useState({ task: '', time: '', turno: 'manha' as Turno });

  if (!isOpen) return null;

  const salvar = () => {
    if (!form.task.trim()) return;
    adicionarTarefa(form.turno, form.task.trim(), form.time || undefined);
    setForm({ task: '', time: '', turno: 'manha' });
    onClose();
  };

  return (
    <Sheet title="Nova Tarefa" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <FInput
          value={form.task}
          onChange={(v) => setForm((f) => ({ ...f, task: v }))}
          placeholder="O que voce vai fazer?"
        />
        <FInput
          value={form.time}
          onChange={(v) => setForm((f) => ({ ...f, time: v }))}
          placeholder="Horario (opcional)"
          type="time"
        />
        <div style={{ display: 'flex', gap: 8 }}>
          {TURNOS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setForm((f) => ({ ...f, turno: key }))}
              style={{
                flex: 1, padding: '8px 4px', borderRadius: 10,
                border: `2px solid ${form.turno === key ? 'var(--vf-p)' : 'var(--vf-bd)'}`,
                background: form.turno === key
                  ? 'color-mix(in srgb, var(--vf-p) 12%, transparent)'
                  : 'var(--vf-bg)',
                color: form.turno === key ? 'var(--vf-p)' : 'var(--vf-tm)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <Btn onClick={salvar} disabled={!form.task.trim()}>Adicionar</Btn>
      </div>
    </Sheet>
  );
}
