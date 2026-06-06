// src/features/pets/components/AddPetSheet.tsx
import { useState, useEffect } from 'react';
import { Sheet }  from '@/shared/ui/Sheet';
import { FInput } from '@/shared/ui/FInput';
import { Btn }    from '@/shared/ui/Btn';
import { usePetsStore } from '../store';
import { PET_COLOR_DEFAULT } from '@/shared/constants/colors';
import type { EspeciePet, Pet } from '../types';

interface Props {
  isOpen:       boolean;
  onClose:      () => void;
  petEditando?: Pet;
}

const ESPECIES: { key: EspeciePet; emoji: string }[] = [
  { key: 'cao',   emoji: '🐶' },
  { key: 'gato',  emoji: '🐱' },
  { key: 'ave',   emoji: '🐦' },
  { key: 'outro', emoji: '🐾' },
];

export function AddPetSheet({ isOpen, onClose, petEditando }: Props) {
  const adicionarPet = usePetsStore((s) => s.adicionarPet);
  const editarPet    = usePetsStore((s) => s.editarPet);

  const [form, setForm] = useState({
    name:    '',
    especie: 'cao' as EspeciePet,
    avatar:  '🐶',
    color:   PET_COLOR_DEFAULT,
    raca:    '',
  });

  useEffect(() => {
    if (petEditando) {
      setForm({
        name:    petEditando.name,
        especie: petEditando.especie,
        avatar:  petEditando.avatar,
        color:   petEditando.color,
        raca:    petEditando.raca ?? '',
      });
    } else {
      setForm({ name: '', especie: 'cao', avatar: '🐶', color: PET_COLOR_DEFAULT, raca: '' });
    }
  }, [petEditando, isOpen]);

  if (!isOpen) return null;

  const salvar = () => {
    if (!form.name.trim()) return;
    if (petEditando) {
      editarPet(petEditando.id, {
        name:    form.name.trim(),
        avatar:  form.avatar,
        especie: form.especie,
        color:   form.color,
        raca:    form.raca || undefined,
      });
    } else {
      adicionarPet({
        name:    form.name.trim(),
        avatar:  form.avatar,
        especie: form.especie,
        color:   form.color,
        raca:    form.raca || undefined,
      });
    }
    onClose();
  };

  return (
    <Sheet title={petEditando ? 'Editar pet' : 'Adicionar pet'} onClose={onClose}>
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
        <FInput value={form.raca} onChange={(v) => setForm((f) => ({ ...f, raca: v }))} placeholder="Raça (opcional)" />
        <Btn onClick={salvar} disabled={!form.name.trim()}>
          {petEditando ? 'Salvar' : 'Adicionar'}
        </Btn>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
      </div>
    </Sheet>
  );
}
