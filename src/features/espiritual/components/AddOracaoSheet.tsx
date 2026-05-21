// src/features/espiritual/components/AddOracaoSheet.tsx
import { useState } from 'react';
import { Sheet }  from '@/shared/ui/Sheet';
import { FInput } from '@/shared/ui/FInput';
import { Btn }    from '@/shared/ui/Btn';
import { useEspiritualStore } from '../store';

interface Props {
  isOpen:  boolean;
  onClose: () => void;
}

export function AddOracaoSheet({ isOpen, onClose }: Props) {
  const adicionarOracao = useEspiritualStore((s) => s.adicionarOracao);
  const [form, setForm] = useState({ pessoa: '', pedido: '' });

  if (!isOpen) return null;

  const salvar = () => {
    if (!form.pessoa.trim() || !form.pedido.trim()) return;
    adicionarOracao(form.pessoa, form.pedido);
    setForm({ pessoa: '', pedido: '' });
    onClose();
  };

  const fechar = () => {
    setForm({ pessoa: '', pedido: '' });
    onClose();
  };

  const valido = form.pessoa.trim().length > 0 && form.pedido.trim().length > 0;

  return (
    <Sheet title="Pedido de Oracao" onClose={fechar}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <FInput
          value={form.pessoa}
          onChange={(v) => setForm((f) => ({ ...f, pessoa: v }))}
          placeholder="Por quem?"
        />
        <FInput
          value={form.pedido}
          onChange={(v) => setForm((f) => ({ ...f, pedido: v }))}
          placeholder="Qual o pedido?"
        />
        <Btn onClick={salvar} disabled={!valido}>Adicionar</Btn>
        <Btn variant="ghost" onClick={fechar}>Cancelar</Btn>
      </div>
    </Sheet>
  );
}
