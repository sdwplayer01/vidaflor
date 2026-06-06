// src/features/kids/components/AddKidSheet.tsx
import { useState, useEffect } from 'react';
import { Sheet }  from '@/shared/ui/Sheet';
import { FInput } from '@/shared/ui/FInput';
import { Btn }    from '@/shared/ui/Btn';
import { useKidsStore } from '../store';
import { KID_COLOR_DEFAULT } from '@/shared/constants/colors';
import type { Crianca } from '../types';

interface Props {
  isOpen:           boolean;
  onClose:          () => void;
  criancaEditando?: Crianca;
}

export function AddKidSheet({ isOpen, onClose, criancaEditando }: Props) {
  const adicionarCrianca = useKidsStore((s) => s.adicionarCrianca);
  const editarCrianca    = useKidsStore((s) => s.editarCrianca);

  const [form, setForm] = useState({
    name:   '',
    avatar: '👶',
    age:    '',
    color:  KID_COLOR_DEFAULT,
  });

  useEffect(() => {
    if (criancaEditando) {
      setForm({
        name:   criancaEditando.name,
        avatar: criancaEditando.avatar,
        age:    String(criancaEditando.age),
        color:  criancaEditando.color,
      });
    } else {
      setForm({ name: '', avatar: '👶', age: '', color: KID_COLOR_DEFAULT });
    }
  }, [criancaEditando, isOpen]);

  if (!isOpen) return null;

  const salvar = () => {
    if (!form.name.trim()) return;
    if (criancaEditando) {
      editarCrianca(criancaEditando.id, {
        name:   form.name.trim(),
        avatar: form.avatar,
        age:    parseInt(form.age, 10) || 0,
        color:  form.color,
      });
    } else {
      adicionarCrianca({
        name:   form.name.trim(),
        avatar: form.avatar,
        age:    parseInt(form.age, 10) || 0,
        color:  form.color,
      });
    }
    onClose();
  };

  return (
    <Sheet title={criancaEditando ? 'Editar criança' : 'Adicionar criança'} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <FInput value={form.name}   onChange={(v) => setForm((f) => ({ ...f, name: v }))}   placeholder="Nome" />
        <FInput value={form.avatar} onChange={(v) => setForm((f) => ({ ...f, avatar: v }))} placeholder="Emoji (ex: 👧)" />
        <FInput value={form.age}    onChange={(v) => setForm((f) => ({ ...f, age: v }))}    placeholder="Idade" type="number" />
        <Btn onClick={salvar} disabled={!form.name.trim()}>
          {criancaEditando ? 'Salvar' : 'Adicionar'}
        </Btn>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
      </div>
    </Sheet>
  );
}
