// src/features/casa/components/AddTarefaCasaSheet.tsx
import { useState } from 'react';
import { Sheet }  from '@/shared/ui/Sheet';
import { FInput } from '@/shared/ui/FInput';
import { Btn }    from '@/shared/ui/Btn';
import { useCasaStore } from '../store';
import type { Ambiente } from '../types';

interface Props {
  isOpen:  boolean;
  onClose: () => void;
}

const AMBIENTES: Ambiente[] = [
  'cozinha', 'sala', 'banheiro', 'quarto_casal',
  'quarto_kids', 'lavanderia', 'area_externa', 'escritorio', 'geral',
];

export function AddTarefaCasaSheet({ isOpen, onClose }: Props) {
  const adicionarTarefa = useCasaStore((s) => s.adicionarTarefaCasa);
  const [form, setForm] = useState({
    task:      '',
    ambiente:  'geral' as Ambiente,
    recorrencia: 'diaria' as 'diaria' | 'semanal' | 'avulsa',
  });

  if (!isOpen) return null;

  const salvar = () => {
    if (!form.task.trim()) return;
    adicionarTarefa({
      task:        form.task.trim(),
      ambiente:    form.ambiente,
      recorrencia: form.recorrencia === 'diaria'
        ? { tipo: 'diaria' }
        : form.recorrencia === 'semanal'
          ? { tipo: 'semanal', diasSemana: [1, 3, 5] }
          : { tipo: 'avulsa' },
    });
    setForm({ task: '', ambiente: 'geral', recorrencia: 'diaria' });
    onClose();
  };

  return (
    <Sheet title="Nova Tarefa da Casa" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <FInput value={form.task} onChange={(v) => setForm((f) => ({ ...f, task: v }))} placeholder="O que limpar/organizar?" />

        <select
          value={form.ambiente}
          onChange={(e) => setForm((f) => ({ ...f, ambiente: e.target.value as Ambiente }))}
          style={{
            padding: '12px', borderRadius: 12, border: '1px solid var(--vf-bd)',
            background: 'var(--vf-bg)', color: 'var(--vf-t)', fontSize: 14,
            fontFamily: 'inherit', outline: 'none',
          }}
        >
          {AMBIENTES.map((a) => (
            <option key={a} value={a}>{a.replace('_', ' ')}</option>
          ))}
        </select>

        <div style={{ display: 'flex', gap: 8 }}>
          {(['diaria', 'semanal', 'avulsa'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setForm((f) => ({ ...f, recorrencia: r }))}
              style={{
                flex: 1, padding: '8px 4px', borderRadius: 10,
                border: `2px solid ${form.recorrencia === r ? 'var(--vf-p)' : 'var(--vf-bd)'}`,
                background: form.recorrencia === r
                  ? 'color-mix(in srgb, var(--vf-p) 12%, transparent)'
                  : 'var(--vf-bg)',
                color: form.recorrencia === r ? 'var(--vf-p)' : 'var(--vf-tm)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>

        <Btn onClick={salvar} disabled={!form.task.trim()}>Adicionar</Btn>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
      </div>
    </Sheet>
  );
}
