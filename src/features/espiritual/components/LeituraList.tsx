// src/features/espiritual/components/LeituraList.tsx
import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ConfirmDel } from '@/shared/ui/ConfirmDel';
import { useLeiturasRecentes } from '../selectors';
import { useEspiritualStore } from '../store';
import { LeituraItem } from './LeituraItem';
import type { ID } from '@/shared/types/common';

export function LeituraList() {
  const leituras       = useLeiturasRecentes();
  const removerLeitura = useEspiritualStore((s) => s.removerLeitura);
  const [deletandoId, setDeletandoId] = useState<ID | null>(null);

  const entradaDeletando = leituras.find((l) => l.id === deletandoId);

  const confirmarRemocao = () => {
    if (deletandoId) removerLeitura(deletandoId);
    setDeletandoId(null);
  };

  if (leituras.length === 0) {
    return (
      <EmptyState
        icon={<BookOpen size={24} />}
        title="Nenhuma leitura registrada"
        desc="Registre suas leituras e devocionais"
      />
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {leituras.map((l) => (
          <LeituraItem
            key={l.id}
            leitura={l}
            onRemove={(id) => setDeletandoId(id)}
          />
        ))}
      </div>

      {deletandoId && entradaDeletando && (
        <ConfirmDel
          label={entradaDeletando.livro}
          onCancel={() => setDeletandoId(null)}
          onConfirm={confirmarRemocao}
        />
      )}
    </div>
  );
}
