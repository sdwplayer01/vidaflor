// src/features/financas/components/TransactionRow.tsx
import { CheckCircle, Circle, Trash2 } from 'lucide-react';
import { formatBRL } from '@/shared/utils/money';
import type { Transaction } from '../types';
import type { ID } from '@/shared/types/common';

interface Props {
  tx:           Transaction;
  onTogglePago: (id: ID) => void;
  onRemove:     (id: ID) => void;
}

export function TransactionRow({ tx, onTogglePago, onRemove }: Props) {
  const isIncome = tx.type === 'income';
  const cor      = isIncome ? 'var(--vf-ok)' : 'var(--vf-er)';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
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
        <p style={{ margin: 0, fontSize: 11, color: 'var(--vf-tm)' }}>
          {tx.category}
          {tx.installment ? ` · ${tx.installment.current}/${tx.installment.total}x` : ''}
          {tx.due ? ` · vence ${tx.due}` : ''}
        </p>
      </div>

      <span style={{ fontSize: 15, fontWeight: 700, color: cor, flexShrink: 0 }}>
        {isIncome ? '+' : '-'}R$ {formatBRL(tx.amount)}
      </span>

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
