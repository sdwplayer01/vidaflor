// src/features/espiritual/components/OracaoItem.tsx
import { Check, HandHeart, Trash2 } from 'lucide-react';
import { fmtDayShort } from '@/shared/utils/date';
import type { Oracao } from '../types';
import type { ID } from '@/shared/types/common';

interface Props {
  oracao:   Oracao;
  onToggle: (id: ID) => void;
  onRemove: (id: ID) => void;
}

export function OracaoItem({ oracao, onToggle, onRemove }: Props) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 16px', borderRadius: 16,
      background: 'var(--vf-surf)',
      border: `1.5px solid ${oracao.respondida ? 'var(--vf-ok)' : 'var(--vf-bd)'}`,
      opacity: oracao.respondida ? 0.75 : 1,
      transition: 'opacity 0.2s, border-color 0.2s',
    }}>
      {/* Botão toggle respondida */}
      <button
        onClick={() => onToggle(oracao.id)}
        style={{
          width: 36, height: 36, borderRadius: 11, flexShrink: 0,
          background: oracao.respondida ? 'var(--vf-ok)' : 'var(--vf-surf)',
          border: oracao.respondida ? 'none' : '1.5px solid var(--vf-bd)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
          transition: 'background 0.2s',
        }}
        aria-label={oracao.respondida ? 'Desmarcar como respondida' : 'Marcar como respondida'}
      >
        {oracao.respondida
          ? <Check size={16} color="#fff" />
          : <HandHeart size={16} color="var(--vf-tm)" />
        }
      </button>

      {/* Conteúdo */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--vf-tx)',
          textDecoration: oracao.respondida ? 'line-through' : 'none',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {oracao.pessoa}
        </p>
        <p style={{
          margin: '2px 0 0', fontSize: 12, color: 'var(--vf-tm)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {oracao.pedido}
        </p>
      </div>

      {/* Ações */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
        {oracao.respondida && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-end' }}>
            <span style={{ fontSize: 9, color: 'var(--vf-tx-mute)', whiteSpace: 'nowrap' }}>
              Pedido em: {fmtDayShort(oracao.createdAt.slice(0, 10))}
            </span>
            {oracao.respondidaEm && (
              <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--vf-ok)', whiteSpace: 'nowrap' }}>
                Atendido em: {fmtDayShort(oracao.respondidaEm)}
              </span>
            )}
          </div>
        )}
        <button
          onClick={() => onRemove(oracao.id)}
          style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'color-mix(in srgb, var(--vf-er) 10%, transparent)',
            border: 'none', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}
          aria-label="Remover oração"
        >
          <Trash2 size={12} color="var(--vf-er)" />
        </button>
      </div>
    </div>
  );
}
