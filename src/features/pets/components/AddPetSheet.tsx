// src/features/pets/components/AddPetSheet.tsx
import { useState } from 'react';
import { Sheet }  from '@/shared/ui/Sheet';
import { FInput } from '@/shared/ui/FInput';
import { Btn }    from '@/shared/ui/Btn';
import { usePetsStore } from '../store';
import { PET_COLOR_DEFAULT } from '@/shared/constants/colors';
import type { EspeciePet } from '../types';

interface Props {
  isOpen:  boolean;
  onClose: () => void;
}

const ESPECIES: { key: EspeciePet; emoji: string }[] = [
  { key: 'cao',   emoji: '\uD83D\uDC36' },
  { key: 'gato',  emoji: '\uD83D\uDC31' },
  { key: 'ave',   emoji: '\uD83D\uDC26' },
  { key: 'outro', emoji: '\uD83D\uDC3E' },
];

export function AddPetSheet({ isOpen, onClose }: Props) {
  const adicionarPet = usePetsStore((s) => s.adicionarPet);
  const [form, setForm] = useState({
    name:    '',
    especie: 'cao' as EspeciePet,
    avatar:  '\uD83D\uDC36',
    color:   PET_COLOR_DEFAULT,
    raca:    '',
  });

  if (!isOpen) return null;

  const salvar = () => {
    if (!form.name.trim()) return;
    adicionarPet({
      name:    form.name.trim(),
      avatar:  form.avatar,
      especie: form.especie,
      color:   form.color,
      raca:    form.raca || undefined,
    });
    setForm({ name: '', especie: 'cao', avatar: '\uD83D\uDC36', color: PET_COLOR_DEFAULT, raca: '' });
    onClose();
  };

  return (
    <Sheet title="Adicionar Pet" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {ESPECIES.map(({ key, emoji }) => (
            <button
              key={key}
              onClick={() => setForm((f) => ({ ...f, especie: key, avatar: emoji }))}
              style={{
                flex: 1, padding: '10px 4px', borderRadius: 12, fontSize: 22,
                border: `2px solid ${form.especie === key ? 'var(--vf-p)' : 'var(--vf-bd)'}`,
                background: form.especie === key
                  ? 'color-mix(in srgb, var(--vf-p) 12%, transparent)'
                  : 'var(--vf-bg)',
                cursor: 'pointer',
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
        <FInput value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="Nome do pet" />
        <FInput value={form.raca} onChange={(v) => setForm((f) => ({ ...f, raca: v }))} placeholder="Raca (opcional)" />
        <Btn onClick={salvar} disabled={!form.name.trim()}>Adicionar</Btn>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
      </div>
    </Sheet>
  );
}
