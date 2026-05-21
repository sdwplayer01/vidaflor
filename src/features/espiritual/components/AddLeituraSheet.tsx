// src/features/espiritual/components/AddLeituraSheet.tsx
import { useState } from 'react';
import { Sheet }  from '@/shared/ui/Sheet';
import { FInput } from '@/shared/ui/FInput';
import { Btn }    from '@/shared/ui/Btn';
import { useEspiritualStore } from '../store';

interface Props {
  isOpen:  boolean;
  onClose: () => void;
}

export function AddLeituraSheet({ isOpen, onClose }: Props) {
  const adicionarLeitura = useEspiritualStore((s) => s.adicionarLeitura);
  const [form, setForm]  = useState({ livro: '', capitulo: '', versiculo: '' });

  if (!isOpen) return null;

  const salvar = () => {
    if (!form.livro.trim()) return;
    const cap = parseInt(form.capitulo, 10) || 0;
    adicionarLeitura(form.livro, cap, form.versiculo.trim() || undefined);
    setForm({ livro: '', capitulo: '', versiculo: '' });
    onClose();
  };

  const fechar = () => {
    setForm({ livro: '', capitulo: '', versiculo: '' });
    onClose();
  };

  return (
    <Sheet title="Nova Leitura" onClose={fechar}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <FInput
          value={form.livro}
          onChange={(v) => setForm((f) => ({ ...f, livro: v }))}
          placeholder="Livro (ex: Salmos)"
        />
        <FInput
          value={form.capitulo}
          onChange={(v) => setForm((f) => ({ ...f, capitulo: v }))}
          placeholder="Capitulo (ex: 23)"
          type="number"
        />
        <FInput
          value={form.versiculo}
          onChange={(v) => setForm((f) => ({ ...f, versiculo: v }))}
          placeholder="Versiculo(s) - opcional"
        />
        <Btn onClick={salvar} disabled={!form.livro.trim()}>Registrar leitura</Btn>
        <Btn variant="ghost" onClick={fechar}>Cancelar</Btn>
      </div>
    </Sheet>
  );
}
