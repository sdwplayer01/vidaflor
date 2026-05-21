// src/features/saude/components/AddMedSheet.tsx
import { useState } from 'react';
import { Sheet }  from '@/shared/ui/Sheet';
import { FInput } from '@/shared/ui/FInput';
import { Btn }    from '@/shared/ui/Btn';
import { usePerfilAtivo } from '../selectors';
import { useSaudeStore } from '../store';
import type { Medication } from '../types';

interface Props {
  isOpen:  boolean;
  onClose: () => void;
}

type Schedule = Medication['schedule'];

export function AddMedSheet({ isOpen, onClose }: Props) {
  const perfil          = usePerfilAtivo();
  const adicionarMed    = useSaudeStore((s) => s.adicionarMedicamento);
  const [form, setForm] = useState({ name: '', dose: '', time: '08:00', schedule: 'diario' as Schedule });

  if (!isOpen || !perfil) return null;

  const salvar = () => {
    if (!form.name.trim() || !form.dose.trim()) return;
    adicionarMed(perfil.id, {
      name:     form.name.trim(),
      dose:     form.dose.trim(),
      time:     form.time,
      schedule: form.schedule,
    });
    setForm({ name: '', dose: '', time: '08:00', schedule: 'diario' });
    onClose();
  };

  const fechar = () => {
    setForm({ name: '', dose: '', time: '08:00', schedule: 'diario' });
    onClose();
  };

  const valido = form.name.trim().length > 0 && form.dose.trim().length > 0;

  const SCHEDULES: { key: Schedule; label: string }[] = [
    { key: 'diario', label: 'Diario' },
    { key: 'sos',    label: 'SOS'    },
    { key: 'semanal',label: 'Semanal'},
  ];

  return (
    <Sheet title="Novo Medicamento" onClose={fechar}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <FInput
          value={form.name}
          onChange={(v) => setForm((f) => ({ ...f, name: v }))}
          placeholder="Nome do medicamento"
        />
        <FInput
          value={form.dose}
          onChange={(v) => setForm((f) => ({ ...f, dose: v }))}
          placeholder="Dose (ex: 500mg)"
        />
        <FInput
          value={form.time}
          onChange={(v) => setForm((f) => ({ ...f, time: v }))}
          placeholder="Horario (ex: 08:00)"
          type="time"
        />

        <div style={{ display: 'flex', gap: 8 }}>
          {SCHEDULES.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setForm((f) => ({ ...f, schedule: key }))}
              style={{
                flex: 1, padding: '8px 4px', borderRadius: 10,
                border: `2px solid ${form.schedule === key ? 'var(--vf-p)' : 'var(--vf-bd)'}`,
                background: form.schedule === key ? 'color-mix(in srgb, var(--vf-p) 12%, transparent)' : 'var(--vf-bg)',
                color: form.schedule === key ? 'var(--vf-p)' : 'var(--vf-tm)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <Btn onClick={salvar} disabled={!valido}>Adicionar</Btn>
        <Btn variant="ghost" onClick={fechar}>Cancelar</Btn>
      </div>
    </Sheet>
  );
}
