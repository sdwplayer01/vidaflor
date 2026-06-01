// src/features/financas/components/CardDetailSheet.tsx
// Item 13: detalhe da fatura aberta + botao pagar
import { CreditCard, Lock, CheckCircle, Clock } from 'lucide-react';
import { Sheet }       from '@/shared/ui/Sheet';
import { Btn }         from '@/shared/ui/Btn';
import { useFatura }   from '../selectors';
import { useFinancasStore } from '../store';
import { formatBRL }   from '@/shared/utils/money';
import type { Card, IsoMonth } from '../types';

interface Props {
  card:    Card;
  mes:     IsoMonth;
  isOpen:  boolean;
  onClose: () => void;
}

const STATUS_LABEL: Record<string, string> = {
  aberta:  'Aberta',
  fechada: 'Fechada',
  paga:    'Paga',
};

const STATUS_COLOR: Record<string, string> = {
  aberta:  'var(--vf-ok)',
  fechada: 'var(--vf-wn)',
  paga:    'var(--vf-tm)',
};

const STATUS_ICON: Record<string, JSX.Element> = {
  aberta:  <Clock size={13} />,
  fechada: <Lock size={13} />,
  paga:    <CheckCircle size={13} />,
};

export function CardDetailSheet({ card, mes, isOpen, onClose }: Props) {
  const fatura     = useFatura(card, mes);
  const pagarFat   = useFinancasStore((s) => s.pagarFatura);

  if (!isOpen) return null;

  const podesPagar = fatura.status !== 'paga' && fatura.total > 0;
  const cor        = STATUS_COLOR[fatura.status];

  const handlePagar = () => {
    pagarFat(card, mes);
    onClose();
  };

  return (
    <Sheet title={`${card.name} · ${mes}`} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Cabecalho da fatura */}
        <div style={{
          borderRadius: 14, padding: '14px 16px',
          background: card.color + '18', border: `1.5px solid ${card.color}44`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CreditCard size={16} color={card.color} />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--vf-t)' }}>Fatura {mes}</span>
            </div>
            <span style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 11, fontWeight: 700, color: cor,
              background: cor + '18', border: `1px solid ${cor}44`,
              padding: '3px 8px', borderRadius: 8,
            }}>
              {STATUS_ICON[fatura.status]}
              {STATUS_LABEL[fatura.status]}
            </span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: card.color }}>
            R$ {formatBRL(fatura.total)}
          </div>
          <div style={{ fontSize: 11, color: 'var(--vf-tm)', marginTop: 4 }}>
            Periodo: {fatura.periodo.from} a {fatura.periodo.to}
          </div>
          {fatura.pagoEm && (
            <div style={{ fontSize: 11, color: 'var(--vf-tm)' }}>
              Pago em: {fatura.pagoEm}
            </div>
          )}
        </div>

        {/* Lista de itens */}
        {fatura.items.length === 0 ? (
          <p style={{
            textAlign: 'center', padding: '24px 0',
            color: 'var(--vf-tm)', fontStyle: 'italic', fontSize: 13,
          }}>
            Nenhum lancamento neste periodo.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--vf-tm)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {fatura.items.length} lancamento{fatura.items.length !== 1 ? 's' : ''}
            </span>
            {fatura.items
              .slice()
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((tx) => (
                <div key={tx.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 12px', borderRadius: 10,
                  background: 'var(--vf-s2)', border: '1px solid var(--vf-bd)',
                  marginBottom: 4,
                  opacity: tx.paid ? 0.6 : 1,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--vf-t)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {tx.desc}
                    </p>
                    <p style={{ margin: 0, fontSize: 11, color: 'var(--vf-tm)' }}>
                      {tx.date} · {tx.category}
                    </p>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--vf-er)', flexShrink: 0, marginLeft: 8 }}>
                    R$ {formatBRL(tx.amount)}
                  </span>
                </div>
              ))}
          </div>
        )}

        {/* Acao de pagamento */}
        {podesPagar && (
          <Btn onClick={handlePagar}>
            Pagar fatura · R$ {formatBRL(fatura.total)}
          </Btn>
        )}
        {fatura.status === 'paga' && (
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--vf-tm)', margin: 0 }}>
            ✓ Fatura ja quitada
          </p>
        )}

        <Btn variant="ghost" onClick={onClose}>Fechar</Btn>
      </div>
    </Sheet>
  );
}
