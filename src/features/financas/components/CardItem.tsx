// src/features/financas/components/CardItem.tsx
import { CreditCard, Trash2 } from 'lucide-react';
import { useFaturaCartao } from '../selectors';
import { formatBRL } from '@/shared/utils/money';
import { useFinancasStore } from '../store';
import type { Card } from '../types';
import type { ID } from '@/shared/types/common';

interface Props {
  card:     Card;
  onRemove: (id: ID) => void;
}

export function CardItem({ card, onRemove }: Props) {
  const fatura = useFaturaCartao(card.id);

  return (
    <div style={{
      padding: '14px', borderRadius: 16,
      background: card.color + '22',
      border: `1.5px solid ${card.color}44`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CreditCard size={18} color={card.color} />
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--vf-t)' }}>{card.name}</span>
        </div>
        <button
          onClick={() => onRemove(card.id)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--vf-tm)', padding: 4 }}
        >
          <Trash2 size={15} />
        </button>
      </div>
      <p style={{ margin: 0, fontSize: 12, color: 'var(--vf-tm)' }}>
        Fecha dia {card.closeDay} · Vence dia {card.dueDay}
      </p>
      <p style={{ margin: '6px 0 0', fontSize: 18, fontWeight: 800, color: card.color }}>
        R$ {formatBRL(fatura)}
      </p>
    </div>
  );
}
