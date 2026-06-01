// src/features/financas/components/TransactionRow.tsx
// Item 9: botao de edicao
// Item 11: badge de juros em parceladas
// Item 14: badge de cartao colorida
import { CheckCircle, Circle, Trash2, Pencil } from 'lucide-react';
import { formatBRL } from '@/shared/utils/money';
import { useCartao } from '../selectors';
import type { Transaction } from '../types';
import type { ID } from '@/shared/types/common';

interface Props {
  tx:           Transaction;
  onTogglePago: (id: ID) => void;
  onRemove:     (id: ID) => void;
  onEdit?:      (id: ID) => void;
}

function CardBadge({ cardId }: { cardId: ID }) {
  const card = useCartao(cardId);
  if (!card) return null;
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 6,
      background: card.color + '22', color: card.color,
      border: `1px solid ${card.color}44`,
      flexShrink: 0,
    }}>
      {card.name}
    </span>
  );
}

export function TransactionRow({ tx, onTogglePago, onRemove, onEdit }: Props) {
  const isIncome = tx.type === 'income';
  const cor      = isIncome ? 'var(--vf-ok)' : 'var(--vf-er)';

  // Item 11: juros por parcela
  const jurosParc = tx.installment?.valorBruto != null
    ? tx.amount - tx.installment.valorBruto
    : null;
  const temJuros = jurosParc != null && jurosParc > 0;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 14px', borderRadius: 14,
      background: 'var(--vf-s2)', border: '1px solid var(--vf-bd)',
      opacity: tx.paid ? 0.65 : 1,
    }}>
      <button
        onClick={() => onTogglePago(tx.id)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: cor, flexShrink: 0 }}
        aria-label={tx.paid ? 'Desmarcar' : 'Marcar pago'}
      >
        {tx.paid ? <CheckCircle size={22} /> : <Circle size={22} />}
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--vf-t)',
          textDecoration: tx.paid ? 'line-through' : 'none',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {tx.desc}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4, marginTop: 2 }}>
          <span style={{ fontSize: 11, color: 'var(--vf-tm)' }}>
            {tx.category}
            {tx.installment ? ` · ${tx.installment.current}/${tx.installment.total}x` : ''}
            {tx.due ? ` · vence ${tx.due}` : ''}
          </span>
          {/* Item 14: badge do cartao */}
          {tx.cardId && <CardBadge cardId={tx.cardId} />}
          {/* Item 11: badge de juros */}
          {temJuros && (
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 6,
              background: 'color-mix(in srgb, var(--vf-wn) 15%, transparent)',
              color: 'var(--vf-wn)',
              border: '1px solid color-mix(in srgb, var(--vf-wn) 27%, transparent)',
              flexShrink: 0,
            }}>
              +juros R$ {formatBRL(jurosParc!)}
            </span>
          )}
        </div>
      </div>

      <span style={{ fontSize: 15, fontWeight: 700, color: cor, flexShrink: 0 }}>
        {isIncome ? '+' : '-'}R$ {formatBRL(tx.amount)}
      </span>

      {onEdit && (
        <button
          onClick={() => onEdit(tx.id)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--vf-tm)', padding: 4, flexShrink: 0 }}
          aria-label="Editar"
        >
          <Pencil size={14} />
        </button>
      )}

      <button
        onClick={() => onRemove(tx.id)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--vf-tm)', padding: 4, flexShrink: 0 }}
        aria-label="Remover"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
