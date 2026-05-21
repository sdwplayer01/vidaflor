// src/features/financas/components/AddCardSheet.tsx
import { useState } from 'react';
import { Sheet }  from '@/shared/ui/Sheet';
import { FInput } from '@/shared/ui/FInput';
import { Btn }    from '@/shared/ui/Btn';
import { useFinancasStore } from '../store';

interface Props {
  isOpen:  boolean;
  onClose: () => void;
}

const CORES = ['#E8799A', '#79B8E8', '#79E8A0', '#E8C479', '#C879E8', '#E87979'];

export function AddCardSheet({ isOpen, onClose }: Props) {
  const adicionarCartao = useFinancasStore((s) => s.adicionarCartao);
  const [form, setForm] = useState({
    name:     '',
    brand:    'Visa',
    color:    CORES[0] ?? '#E8799A',
    closeDay: '10',
    dueDay:   '17',
  });

  if (!isOpen) return null;

  const salvar = () => {
    if (!form.name.trim()) return;
    adicionarCartao({
      name:     form.name.trim(),
      brand:    form.brand,
      color:    form.color,
      closeDay: parseInt(form.closeDay) || 10,
      dueDay:   parseInt(form.dueDay)   || 17,
    });
    setForm({ name: '', brand: 'Visa', color: CORES[0] ?? '#E8799A', closeDay: '10', dueDay: '17' });
    onClose();
  };

  return (
    <Sheet title="Novo Cartao" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <FInput value={form.name}     onChange={(v) => setForm((f) => ({ ...f, name: v }))}     placeholder="Nome do cartao" />
        <FInput value={form.brand}    onChange={(v) => setForm((f) => ({ ...f, brand: v }))}    placeholder="Bandeira (ex: Visa)" />
        <FInput value={form.closeDay} onChange={(v) => setForm((f) => ({ ...f, closeDay: v }))} placeholder="Dia de fechamento" type="number" />
        <FInput value={form.dueDay}   onChange={(v) => setForm((f) => ({ ...f, dueDay: v }))}   placeholder="Dia de vencimento" type="number" />
        <div style={{ display: 'flex', gap: 8 }}>
          {CORES.map((c) => (
            <button
              key={c}
              onClick={() => setForm((f) => ({ ...f, color: c }))}
              style={{
                width: 32, height: 32, borderRadius: '50%', background: c, border: 'none',
                cursor: 'pointer', flexShrink: 0,
                outline: form.color === c ? `3px solid ${c}` : 'none',
                outlineOffset: 2,
              }}
            />
          ))}
        </div>
        <Btn onClick={salvar} disabled={!form.name.trim()}>Adicionar</Btn>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
      </div>
    </Sheet>
  );
}
