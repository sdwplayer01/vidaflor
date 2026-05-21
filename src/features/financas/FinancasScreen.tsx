// src/features/financas/FinancasScreen.tsx
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { MonthCarousel }        from './components/MonthCarousel';
import { BudgetBar }            from './components/BudgetBar';
import { ProximasContas }       from './components/ProximasContas';
import { TransactionRow }       from './components/TransactionRow';
import { CardItem }             from './components/CardItem';
import { AddTransactionSheet }  from './components/AddTransactionSheet';
import { AddCardSheet }         from './components/AddCardSheet';
import { useSaldoDoMes, useTransacoesDoMes, useCartoes } from './selectors';
import { useFinancasStore } from './store';
import { formatBRL } from '@/shared/utils/money';
import type { IsoMonth } from './types';
import type { ID } from '@/shared/types/common';

function currentMonth(): IsoMonth {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

type Tab = 'resumo' | 'transacoes' | 'cartoes';

export function FinancasScreen() {
  const [tab, setTab]       = useState<Tab>('resumo');
  const [mes, setMes]       = useState<IsoMonth>(currentMonth);
  const [addTx, setAddTx]   = useState(false);
  const [addCard, setAddCard] = useState(false);

  const saldo      = useSaldoDoMes(mes);
  const transacoes = useTransacoesDoMes(mes);
  const cartoes    = useCartoes();
  const marcarPago = useFinancasStore((s) => s.marcarComoPago);
  const desmarcar  = useFinancasStore((s) => s.desmarcarPago);
  const remover    = useFinancasStore((s) => s.removerTransacao);
  const removerCartao = useFinancasStore((s) => s.removerCartao);

  const handleTogglePago = (id: ID) => {
    const tx = transacoes.find((t) => t.id === id);
    if (!tx) return;
    if (tx.paid) desmarcar(id);
    else         marcarPago(id);
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: 'resumo',      label: 'Resumo'     },
    { key: 'transacoes',  label: 'Transacoes' },
    { key: 'cartoes',     label: 'Cartoes'    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Tab bar */}
      <div style={{
        flexShrink: 0, borderBottom: '1px solid var(--vf-bd)', background: 'var(--vf-bg)',
      }}>
        <div style={{ display: 'flex', padding: '12px 16px 0' }}>
          {TABS.map(({ key, label }) => {
            const active = tab === key;
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  flex: 1, padding: '8px 4px 10px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  borderBottom: active ? '2px solid var(--vf-p)' : '2px solid transparent',
                  color: active ? 'var(--vf-p)' : 'var(--vf-tm)',
                  fontSize: 13, fontWeight: active ? 700 : 400,
                  fontFamily: 'inherit', transition: 'color 0.15s',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        <div style={{ marginBottom: 16 }}>
          <MonthCarousel mes={mes} onMes={setMes} />
        </div>

        {tab === 'resumo' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Saldo card */}
            <div style={{
              background: 'var(--vf-s2)', borderRadius: 18, padding: '18px',
              border: '1px solid var(--vf-bd)', textAlign: 'center',
            }}>
              <p style={{ margin: '0 0 4px', fontSize: 12, color: 'var(--vf-tm)' }}>Saldo do mes</p>
              <p style={{
                margin: 0, fontSize: 30, fontWeight: 900,
                color: saldo.saldo >= 0 ? 'var(--vf-ok)' : 'var(--vf-er)',
              }}>
                {saldo.saldo < 0 ? '-' : ''}R$ {formatBRL(Math.abs(saldo.saldo))}
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 10 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 11, color: 'var(--vf-tm)' }}>Entradas</p>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--vf-ok)' }}>
                    R$ {formatBRL(saldo.entradas)}
                  </p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 11, color: 'var(--vf-tm)' }}>Saidas</p>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--vf-er)' }}>
                    R$ {formatBRL(saldo.saidas)}
                  </p>
                </div>
              </div>
            </div>

            <BudgetBar />
            <ProximasContas />
          </div>
        )}

        {tab === 'transacoes' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {transacoes.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--vf-tm)', padding: '32px 0' }}>
                  Nenhuma transacao neste mes
                </p>
              ) : (
                transacoes
                  .slice()
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((tx) => (
                    <TransactionRow
                      key={tx.id}
                      tx={tx}
                      onTogglePago={handleTogglePago}
                      onRemove={remover}
                    />
                  ))
              )}
            </div>
            <button
              onClick={() => setAddTx(true)}
              style={{
                marginTop: 16, display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 8, width: '100%',
                padding: '14px', borderRadius: 14, border: '2px dashed var(--vf-bd)',
                background: 'transparent', color: 'var(--vf-tm)',
                fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <Plus size={18} /> Adicionar transacao
            </button>
          </>
        )}

        {tab === 'cartoes' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {cartoes.map((c) => (
                <CardItem key={c.id} card={c} onRemove={removerCartao} />
              ))}
            </div>
            <button
              onClick={() => setAddCard(true)}
              style={{
                marginTop: 16, display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 8, width: '100%',
                padding: '14px', borderRadius: 14, border: '2px dashed var(--vf-bd)',
                background: 'transparent', color: 'var(--vf-tm)',
                fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <Plus size={18} /> Adicionar cartao
            </button>
          </>
        )}
      </div>

      <AddTransactionSheet isOpen={addTx}   onClose={() => setAddTx(false)} />
      <AddCardSheet        isOpen={addCard} onClose={() => setAddCard(false)} />
    </div>
  );
}
