// src/features/espiritual/components/OracaoList.tsx
import { useState } from 'react';
import { Send, HandHeart, CheckCircle } from 'lucide-react';
import { FInput }     from '@/shared/ui/FInput';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ConfirmDel } from '@/shared/ui/ConfirmDel';
import { useOracoesPendentes, useOracoesRespondidas } from '../selectors';
import { useEspiritualStore } from '../store';
import { OracaoItem } from './OracaoItem';
import type { ID } from '@/shared/types/common';

export function OracaoList() {
  const pendentes         = useOracoesPendentes();
  const respondidas       = useOracoesRespondidas();
  const adicionarOracao   = useEspiritualStore((s) => s.adicionarOracao);
  const marcarRespondida  = useEspiritualStore((s) => s.marcarRespondida);
  const desmarcar         = useEspiritualStore((s) => s.desmarcarRespondida);
  const removerOracao     = useEspiritualStore((s) => s.removerOracao);

  const [texto, setTexto]         = useState('');
  const [deletandoId, setDeletandoId] = useState<ID | null>(null);

  const todas = [...pendentes, ...respondidas];
  const entradaDeletando = todas.find((o) => o.id === deletandoId);

  const salvar = () => {
    if (!texto.trim()) return;
    adicionarOracao(texto.trim(), '');
    setTexto('');
  };

  const handleToggle = (id: ID) => {
    const o = todas.find((x) => x.id === id);
    if (!o) return;
    if (o.respondida) desmarcar(id); else marcarRespondida(id);
  };

  const confirmarRemocao = () => {
    if (deletandoId) removerOracao(deletandoId);
    setDeletandoId(null);
  };

  return (
    <div>
      {/* Input inline */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <FInput
            value={texto}
            onChange={setTexto}
            placeholder="Pelo que ou por quem você deseja clamar hoje?"
          />
        </div>
        <button
          onClick={salvar}
          disabled={!texto.trim()}
          style={{
            width: 44, height: 44, borderRadius: 14, flexShrink: 0,
            background: texto.trim() ? 'var(--vf-p)' : 'var(--vf-bd)',
            border: 'none', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: texto.trim() ? 'pointer' : 'default',
            WebkitTapHighlightColor: 'transparent',
            transition: 'background 0.2s',
          }}
          aria-label="Adicionar oração"
        >
          <Send size={18} color="#fff" />
        </button>
      </div>

      {/* Pedidos ativos */}
      {pendentes.length === 0 ? (
        <EmptyState
          icon={<HandHeart size={24} />}
          title="Nenhum pedido de oração"
          desc="Ore por quem você ama"
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {pendentes.map((o) => (
            <OracaoItem
              key={o.id}
              oracao={o}
              onToggle={handleToggle}
              onRemove={(id) => setDeletandoId(id)}
            />
          ))}
        </div>
      )}

      {/* Orações Atendidas */}
      {respondidas.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <CheckCircle size={13} color="var(--vf-ok)" />
            <span style={{
              fontSize: 11, fontWeight: 700, color: 'var(--vf-ok)',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              Orações Atendidas
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {respondidas.map((o) => (
              <OracaoItem
                key={o.id}
                oracao={o}
                onToggle={handleToggle}
                onRemove={(id) => setDeletandoId(id)}
              />
            ))}
          </div>
        </div>
      )}

      {deletandoId && entradaDeletando && (
        <ConfirmDel
          label={entradaDeletando.pessoa || entradaDeletando.pedido}
          onCancel={() => setDeletandoId(null)}
          onConfirm={confirmarRemocao}
        />
      )}
    </div>
  );
}
