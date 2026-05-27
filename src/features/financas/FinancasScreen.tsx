// src/features/financas/FinancasScreen.tsx — v2
// Header with eyebrow/display/hint, hero gradient saldo card, segmented pill tabs.
// Preserve all sub-components (MonthCarousel, BudgetBar, ProximasContas, etc.)
import { useState }               from 'react';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { MonthCarousel }          from './components/MonthCarousel';
import { BudgetBar }              from './components/BudgetBar';
import { ProximasContas }         from './components/ProximasContas';
import { TransactionRow }         from './components/TransactionRow';
import { CardItem }               from './components/CardItem';
import { AddTransactionSheet }    from './components/AddTransactionSheet';
import { AddCardSheet }           from './components/AddCardSheet';
import { useSaldoDoMes, useTransacoesDoMes, useCartoes } from './selectors';
import { useFinancasStore }       from './store';
import { formatBRL }              from '@/shared/utils/money';
import type { IsoMonth }          from './types';
import type { ID }                from '@/shared/types/common';

function currentMonth(): IsoMonth {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

type Tab = 'resumo' | 'transacoes' | 'cartoes';

const TABS: { key: Tab; label: string }[] = [
  { key: 'resumo',     label: 'resumo'     },
  { key: 'transacoes', label: 'movimentos' },
  { key: 'cartoes',    label: 'cartões'    },
];

export function FinancasScreen() {
  const [tab, setTab]         = useState<Tab>('resumo');
  const [mes, setMes]         = useState<IsoMonth>(currentMonth);
  const [addTx, setAddTx]     = useState(false);
  const [addCard, setAddCard] = useState(false);

  const saldo         = useSaldoDoMes(mes);
  const transacoes    = useTransacoesDoMes(mes);
  const cartoes       = useCartoes();
  const marcarPago    = useFinancasStore((s) => s.marcarComoPago);
  const desmarcar     = useFinancasStore((s) => s.desmarcarPago);
  const remover       = useFinancasStore((s) => s.removerTransacao);
  const removerCartao = useFinancasStore((s) => s.removerCartao);

  const handleTogglePago = (id: ID) => {
    const tx = transacoes.find((t) => t.id === id);
    if (!tx) return;
    if (tx.paid) desmarcar(id);
    else         marcarPago(id);
  };

  const saldoPositivo = saldo.saldo >= 0;

  return (
    <div style={{ padding: '24px 20px 20px' }}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ marginBottom: 16 }}>
        <div className="vf-eyebrow">finanças</div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginTop: 4,
          }}
        >
          <h1
            style={{
              margin: 0, fontSize: 30, lineHeight: 1.05,
              fontFamily: 'var(--vf-font-display)', fontWeight: 400,
              color: 'var(--vf-tx)',
            }}
          >
            Solo fértil
          </h1>
          <button
            onClick={() => setAddTx(true)}
            style={{
              width: 40, height: 40, borderRadius: 14,
              background: 'var(--vf-grad-hero)', border: 'none',
              color: 'var(--vf-on-rose)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(184,96,122,0.30)',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <Plus size={20} />
          </button>
        </div>
        <div
          style={{
            fontSize: 14, marginTop: 6, fontStyle: 'italic',
            color: saldoPositivo ? 'var(--vf-sage)' : 'var(--vf-coral)',
          }}
        >
          {saldoPositivo ? 'saldo florescente · ' : 'atenção ao saldo · '}
          <span className="vf-mono">R$ {formatBRL(saldo.saldo)}</span>
        </div>
      </div>

      {/* ── Month carousel ─────────────────────────────────────── */}
      <div style={{ marginBottom: 14 }}>
        <MonthCarousel mes={mes} onMes={setMes} />
      </div>

      {/* ── Hero saldo gradient card ───────────────────────────── */}
      <div
        style={{
          background: 'var(--vf-grad-hero)',
          borderRadius: 'var(--vf-r-xl)',
          padding: '20px 22px',
          marginBottom: 16,
          position: 'relative', overflow: 'hidden',
          color: 'var(--vf-on-rose)',
        }}
      >
        {/* decorative circle */}
        <div
          style={{
            position: 'absolute', right: -30, bottom: -30,
            width: 140, height: 140, borderRadius: '50%',
            background: 'rgba(255,255,255,0.10)',
          }}
        />
        <div className="vf-eyebrow" style={{ color: 'var(--vf-on-rose)', opacity: 0.85 }}>
          saldo do mês
        </div>
        <div
          style={{
            fontSize: 36, marginTop: 4, lineHeight: 1,
            fontFamily: 'var(--vf-font-display)', fontStyle: 'italic',
          }}
        >
          R$ {formatBRL(saldo.saldo)}
        </div>
        <div
          style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: 10, marginTop: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <TrendingUp size={14} style={{ opacity: 0.85 }} />
            <div>
              <div style={{ fontSize: 10, opacity: 0.7 }}>entrou</div>
              <div className="vf-mono" style={{ fontSize: 13 }}>R$ {formatBRL(saldo.entradas)}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <TrendingDown size={14} style={{ opacity: 0.85 }} />
            <div>
              <div style={{ fontSize: 10, opacity: 0.7 }}>saiu</div>
              <div className="vf-mono" style={{ fontSize: 13 }}>R$ {formatBRL(saldo.saidas)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Segmented pill tabs ────────────────────────────────── */}
      <div
        style={{
          display: 'flex', gap: 4,
          background: 'var(--vf-surf-alt)',
          borderRadius: 99, padding: 3,
          marginBottom: 20,
        }}
      >
        {TABS.map(({ key, label }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                flex: 1, padding: '7px 8px',
                borderRadius: 99, border: 'none', cursor: 'pointer',
                background: active ? 'var(--vf-surf)' : 'transparent',
                color: active ? 'var(--vf-rose)' : 'var(--vf-tx-mute)',
                fontFamily: 'var(--vf-font-ui)', fontSize: 12, fontWeight: 600,
                transition: 'all 0.3s var(--vf-ease-spring)',
                boxShadow: active ? '0 2px 8px rgba(0,0,0,0.07)' : 'none',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Tab content ────────────────────────────────────────── */}
      {tab === 'resumo' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <BudgetBar />
          <ProximasContas />
        </div>
      )}

      {tab === 'transacoes' && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {transacoes.length === 0 ? (
              <div
                style={{
                  textAlign: 'center', padding: '40px 20px',
                  color: 'var(--vf-tx-mute)', fontStyle: 'italic', fontSize: 14,
                }}
              >
                🌱 nenhum movimento este mês
              </div>
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
              marginTop: 16,
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8, width: '100%',
              padding: '14px', borderRadius: 14,
              border: '2px dashed var(--vf-bd)',
              background: 'transparent', color: 'var(--vf-tx-mute)',
              fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <Plus size={18} /> adicionar movimento
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
              marginTop: 16,
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8, width: '100%',
              padding: '14px', borderRadius: 14,
              border: '2px dashed var(--vf-bd)',
              background: 'transparent', color: 'var(--vf-tx-mute)',
              fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <Plus size={18} /> adicionar cartão
          </button>
        </>
      )}

      {/* ── Sheets ─────────────────────────────────────────────── */}
      <AddTransactionSheet isOpen={addTx}   onClose={() => setAddTx(false)} />
      <AddCardSheet        isOpen={addCard} onClose={() => setAddCard(false)} />
    </div>
  );
}
