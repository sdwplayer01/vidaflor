// src/features/kids/components/AddKidSheet.tsx
import { useState } from 'react';
import { Sheet }  from '@/shared/ui/Sheet';
import { FInput } from '@/shared/ui/FInput';
import { Btn }    from '@/shared/ui/Btn';
import { useKidsStore } from '../store';

interface Props {
  isOpen:  boolean;
  onClose: () => void;
}

export function AddKidSheet({ isOpen, onClose }: Props) {
  const adicionarCrianca = useKidsStore((s) => s.adicionarCrianca);
  const [form, setForm]  = useState({ name: '', avatar: '\uD83D\uDC76', age: '', color: '#79B8E8' });

  if (!isOpen) return null;

  const salvar = () => {
    if (!form.name.trim()) return;
    adicionarCrianca({
      name:   form.name.trim(),
      avatar: form.avatar,
      age:    parseInt(form.age, 10) || 0,
      color:  form.color,
    });
    setForm({ name: '', avatar: '\uD83D\uDC76', age: '', color: '#79B8E8' });
    onClose();
  };

  return (
    <Sheet title="Adicionar Crianca" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <FInput value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="Nome" />
        <FInput value={form.avatar} onChange={(v) => setForm((f) => ({ ...f, avatar: v }))} placeholder="Emoji (ex: \uD83D\uDC67)" />
        <FInput value={form.age} onChange={(v) => setForm((f) => ({ ...f, age: v }))} placeholder="Idade" type="number" />
        <Btn onClick={salvar} disabled={!form.name.trim()}>Adicionar</Btn>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
      </div>
    </Sheet>
  );
}
