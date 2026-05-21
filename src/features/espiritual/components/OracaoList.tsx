// src/features/espiritual/components/OracaoList.tsx
import { useState } from 'react';
import { HandHeart, CheckCircle } from 'lucide-react';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ConfirmDel } from '@/shared/ui/ConfirmDel';
import { useOracoesPendentes, useOracoesRespondidas } from '../selectors';
import { useEspiritualStore } from '../store';
import { OracaoItem } from './OracaoItem';
import type { ID } from '@/shared/types/common';

interface Props {
  filter: 'pendente' | 'respondida';
}

export function OracaoList({ filter }: Props) {
  const pendentes   = useOracoesPendentes();
  const respondidas = useOracoesRespondidas();
  const marcarRespondida    = useEspiritualStore((s) => s.marcarRespondida);
  const desmarcarRespondida = useEspiritualStore((s) => s.desmarcarRespondida);
  const removerOracao       = useEspiritualStore((s) => s.removerOracao);

  const [deletandoId, setDeletandoId] = useState<ID | null>(null);

  const lista = filter === 'pendente' ? pendentes : respondidas;
  const todasOracoes = [...pendentes, ...respondidas];
  const entradaDeletando = todasOracoes.find((o) => o.id === deletandoId);

  const handleToggle = (id: ID) => {
    const oracao = todasOracoes.find((o) => o.id === id);
    if (!oracao) return;
    if (oracao.respondida) desmarcarRespondida(id);
    else marcarRespondida(id);
  };

  const confirmarRemocao = () => {
    if (deletandoId) removerOracao(deletandoId);
    setDeletandoId(null);
  };

  if (lista.length === 0) {
    return filter === 'pendente' ? (
      <EmptyState
        icon={<HandHeart size={24} />}
        title="Nenhum pedido de oracao"
        desc="Ore por quem voce ama"
      />
    ) : (
      <EmptyState
        icon={<CheckCircle size={24} />}
        title="Nenhuma oracao respondida ainda"
        desc="As respostas chegam no tempo certo"
      />
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {lista.map((o) => (
          <OracaoItem
            key={o.id}
            oracao={o}
            onToggle={handleToggle}
            onRemove={(id) => setDeletandoId(id)}
          />
        ))}
      </div>

      {deletandoId && entradaDeletando && (
        <ConfirmDel
          label={entradaDeletando.pessoa}
          onCancel={() => setDeletandoId(null)}
          onConfirm={confirmarRemocao}
        />
      )}
    </div>
  );
}
