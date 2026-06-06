// src/features/espiritual/components/AddGratidaoSheet.tsx
import { useState } from 'react';
import { Sheet }  from '@/shared/ui/Sheet';
import { FInput } from '@/shared/ui/FInput';
import { Btn }    from '@/shared/ui/Btn';
import { useEspiritualStore } from '../store';
import { today } from '@/shared/utils/date';

interface Props {
  isOpen:  boolean;
  onClose: () => void;
}

export function AddGratidaoSheet({ isOpen, onClose }: Props) {
  const adicionarGratidao = useEspiritualStore((s) => s.adicionarGratidao);
  const [texto, setTexto] = useState('');

  if (!isOpen) return null;

  const salvar = () => {
    if (!texto.trim()) return;
    adicionarGratidao(today(), texto.trim());
    setTexto('');
    onClose();
  };

  const fechar = () => {
    setTexto('');
    onClose();
  };

  return (
    <Sheet title="Nova Gratidao" onClose={fechar}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <FInput
          value={texto}
          onChange={setTexto}
          placeholder="Pelo que voce e grata?"
        />
        <Btn onClick={salvar} disabled={!texto.trim()}>Agradecer</Btn>
      </div>
    </Sheet>
  );
}
