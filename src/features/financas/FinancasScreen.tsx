// src/features/financas/FinancasScreen.tsx
import { useState, useMemo } from 'react';
import { Plus, TrendingUp, TrendingDown, Search, X, Download, Eye, EyeOff } from 'lucide-react';
import { MonthCarousel }       from './components/MonthCarousel';
import { BudgetBar }           from './components/BudgetBar';
import { ProximasContas }      from './components/ProximasContas';
import { TransactionRow }      from './components/TransactionRow';
import { CardItem }            from './components/CardItem';
import { AddTransactionSheet } from './components/AddTransactionSheet';
import { AddCardSheet }        from './components/AddCardSheet';
import { CardDetailSheet }     from './components/CardDetailSheet';
import { RevisaoTab }          from './components/RevisaoTab';
import { useSaldoDoMes, useTransacoesDoMes, useCartoes } from './selectors';
import { useFinancasStore }    from './store';
import { useConfigStore }      from '@/features/config/store';
import { toast }               from '@/shared/ui/Toast';
import { formatBRL }           from '@/shared/utils/money';
import { HEADERS }             from '@/shared/constants/messages';
import type { Card, IsoMonth } from './types';
import type { ID }             from '@/shared/types/common';

function currentMonth(): IsoMonth {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

type Tab    = 'resumo' | 'transacoes' | 'cartoes' | 'revisao';
type Filtro = 'todos' | 'entradas' | 'saidas' | 'a-pagar' | string; // string = cardId

const TABS: { key: Tab; label: string }[] = [
  { key: 'resumo',     label: 'resumo'     },
  { key: 'transacoes', label: 'movimentos' },
  { key: 'cartoes',    label: 'cartoes'    },
  { key: 'revisao',    label: 'revisao'    },
];


// ── CSV export ───────────────────────────────────────────────────────────────
function exportarCSV(transactions: import('./types').Transaction[], mes: IsoMonth): void {
  const header = "Data,Descrição,Categoria,Tipo,Valor (R$),Pago";
  const rows = transactions
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((t) => {
      const intPart = Math.trunc(t.amount / 100);
      const decPart = String(t.amount % 100).padStart(2, '0');
      const valor   = `${intPart},${decPart}`;
      return [
        t.date,
        `"${t.desc.replace(/"/g, '""')}"`,
        `"${t.category}"`,
        t.type === "income" ? "entrada" : "saída",
        valor,
        t.paid ? "sim" : "não",
      ].join(",");
    });

  const csv  = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `vidaflor-financas-${mes}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function FinancasScreen() {
  const [tab, setTab]           = useState<Tab>('resumo');
  const [mes, setMes]           = useState<IsoMonth>(currentMonth);
  const [addTx, setAddTx]       = useState(false);
  const [editTxId, setEditTxId] = useState<ID | undefined>();
  const [addCard, setAddCard]   = useState(false);
  const [detalheCard, setDetalheCard] = useState<Card | null>(null);

  // Item 12: estado de filtros — local, sem store
  const [filtro, setFiltro]   = useState<Filtro>('todos');
  const [busca, setBusca]     = useState('');

  const saldo         = useSaldoDoMes(mes);
  const transacoes    = useTransacoesDoMes(mes);
  const cartoes       = useCartoes();
  const hideBalance        = useConfigStore((s) => s.hideBalance);
  const toggleHideBalance  = useConfigStore((s) => s.toggleHideBalance);
  const fmt = (v: number) => (hideBalance ? 'R$ ••••' : `R$ ${formatBRL(v)}`);
  const marcarPago         = useFinancasStore((s) => s.marcarComoPago);
  const desmarcar          = useFinancasStore((s) => s.desmarcarPago);
  const concretizarVirtual = useFinancasStore((s) => s.concretizarVirtual);
  const desmarcarVirtual   = useFinancasStore((s) => s.desmarcarVirtual);
  const remover            = useFinancasStore((s) => s.removerTransacao);
  const restaurar          = useFinancasStore((s) => s.restaurarTransacao);
  const removerCartao      = useFinancasStore((s) => s.removerCartao);

  const handleRemove = (id: ID) => {
    const tx = transacoes.find((t) => t.id === id);
    remover(id);
    // Transações virtuais (derivadas) não são restauráveis — sem undo
    if (!tx || id.includes('_v_')) return;
    toast('Movimento removido.', {
      actionLabel: 'Desfazer',
      onAction: () => restaurar(tx),
    });
  };

  const handleTogglePago = (id: ID) => {
    const tx = transacoes.find((t) => t.id === id);
    if (!tx) return;
    const isVirtual = id.includes('_v_');
    if (isVirtual) {
      if (tx.paid) desmarcarVirtual(id); else concretizarVirtual(id);
    } else {
      if (tx.paid) desmarcar(id); else marcarPago(id);
    }
  };

  const handleEdit = (id: ID) => {
    setEditTxId(id);
    setAddTx(true);
  };

  const handleCloseSheet = () => {
    setAddTx(false);
    setEditTxId(undefined);
  };

  // Item 12: transacoes filtradas + busca
  const transacoesFiltradas = useMemo(() => {
    let list = transacoes.slice().sort((a, b) => b.date.localeCompare(a.date));
    if (filtro === 'entradas')  list = list.filter((t) => t.type === 'income');
    if (filtro === 'saidas')    list = list.filter((t) => t.type === 'expense');
    if (filtro === 'a-pagar')   list = list.filter((t) => !t.paid && t.type === 'expense');
    if (filtro !== 'todos' && filtro !== 'entradas' && filtro !== 'saidas' && filtro !== 'a-pagar') {
      list = list.filter((t) => t.cardId === filtro);
    }
    if (busca.trim()) {
      const q = busca.toLowerCase();
      list = list.filter((t) => t.desc.toLowerCase().includes(q) || t.category.toLowerCase().includes(q));
    }
    return list;
  }, [transacoes, filtro, busca]);

  // Chips de filtro dinamicos: fixos + um por cartao
  const chipsFiltro: { key: Filtro; label: string }[] = [
    { key: 'todos',    label: 'Todos'    },
    { key: 'entradas', label: 'Entradas' },
    { key: 'saidas',   label: 'Saidas'  },
    { key: 'a-pagar',  label: 'A pagar' },
    ...cartoes.map((c) => ({ key: c.id as Filtro, label: c.name })),
  ];

  const saldoPositivo = saldo.saldo >= 0;

  return (
    <div style={{ padding: '24px 20px 20px' }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div className="vf-eyebrow">financas</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 4 }}>
          <h1 style={{
            margin: 0, fontSize: 30, lineHeight: 1.05,
            fontFamily: 'var(--vf-font-display)', fontWeight: 400, color: 'var(--vf-tx)',
          }}>
            {HEADERS.financas.title}
          </h1>
          <button
            onClick={() => exportarCSV(transacoesFiltradas, mes)}
            title="Exportar CSV"
            style={{
              width: 36, height: 36, borderRadius: 12,
              background: 'var(--vf-surf)', border: '1px solid var(--vf-bd)',
              color: 'var(--vf-tx-mute)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', marginRight: 6,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <Download size={16} />
          </button>
          <button
            onClick={() => { setEditTxId(undefined); setAddTx(true); }}
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
        <div style={{
          fontSize: 14, marginTop: 6, fontStyle: 'italic',
          color: saldoPositivo ? 'var(--vf-sage)' : 'var(--vf-coral)',
        }}>
          {saldoPositivo ? HEADERS.financas.saldoPos : HEADERS.financas.saldoNeg}
          <span className="vf-mono">{fmt(saldo.saldo)}</span>
        </div>
      </div>

      {/* Month carousel */}
      <div style={{ marginBottom: 14 }}>
        <MonthCarousel mes={mes} onMes={setMes} />
      </div>

      {/* Hero saldo card */}
      <div style={{
        background: 'var(--vf-grad-hero)', borderRadius: 'var(--vf-r-xl)',
        padding: '20px 22px', marginBottom: 16,
        position: 'relative', overflow: 'hidden',
        color: 'var(--vf-on-rose)',
      }}>
        <div style={{
          position: 'absolute', right: -30, bottom: -30,
          width: 140, height: 140, borderRadius: '50%',
          background: 'rgba(255,255,255,0.10)',
        }} />
        <button
          onClick={toggleHideBalance}
          title={hideBalance ? 'Mostrar valores' : 'Ocultar valores'}
          aria-label={hideBalance ? 'Mostrar valores' : 'Ocultar valores'}
          style={{
            position: 'absolute', top: 14, right: 14,
            width: 32, height: 32, borderRadius: 10,
            background: 'rgba(255,255,255,0.16)', border: 'none',
            color: 'var(--vf-on-rose)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
          }}
        >
          {hideBalance ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
        <div className="vf-eyebrow" style={{ color: 'var(--vf-on-rose)', opacity: 0.85 }}>saldo do mes</div>
        <div style={{ fontSize: 36, marginTop: 4, lineHeight: 1, fontFamily: 'var(--vf-font-display)', fontStyle: 'italic' }}>
          {fmt(saldo.saldo)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <TrendingUp size={14} style={{ opacity: 0.85 }} />
            <div>
              <div style={{ fontSize: 10, opacity: 0.7 }}>entrou</div>
              <div className="vf-mono" style={{ fontSize: 13 }}>{fmt(saldo.entradas)}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <TrendingDown size={14} style={{ opacity: 0.85 }} />
            <div>
              <div style={{ fontSize: 10, opacity: 0.7 }}>saiu</div>
              <div className="vf-mono" style={{ fontSize: 13 }}>{fmt(saldo.saidas)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 4,
        background: 'var(--vf-surf-alt)', borderRadius: 99, padding: 3,
        marginBottom: 20,
      }}>
        {TABS.map(({ key, label }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                flex: 1, padding: '7px 8px', borderRadius: 99, border: 'none', cursor: 'pointer',
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

      {/* Resumo */}
      {tab === 'resumo' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <BudgetBar mes={mes} />
          <ProximasContas />
        </div>
      )}

      {/* Movimentos — Item 12: filtros + busca */}
      {tab === 'transacoes' && (
        <>
          {/* Barra de busca */}
          <div style={{ position: 'relative', marginBottom: 10 }}>
            <Search size={14} style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--vf-tm)', pointerEvents: 'none',
            }} />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por descricao ou categoria..."
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '10px 36px 10px 34px',
                borderRadius: 12, border: '1.5px solid var(--vf-bd)',
                background: 'var(--vf-s2)', color: 'var(--vf-t)',
                fontSize: 13, fontFamily: 'inherit',
                outline: 'none',
              }}
            />
            {busca && (
              <button
                onClick={() => setBusca('')}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--vf-tm)', padding: 2,
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Chips de filtro */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 12 }}>
            {chipsFiltro.map(({ key, label }) => {
              const ativo = filtro === key;
              return (
                <button
                  key={key}
                  onClick={() => setFiltro(ativo ? 'todos' : key)}
                  style={{
                    padding: '6px 12px', borderRadius: 99, cursor: 'pointer',
                    whiteSpace: 'nowrap', fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
                    background: ativo ? 'var(--vf-rose)' : 'var(--vf-s2)',
                    color: ativo ? 'var(--vf-on-rose)' : 'var(--vf-tm)',
                    border: `1px solid ${ativo ? 'transparent' : 'var(--vf-bd)'}`,
                    flexShrink: 0,
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Lista filtrada */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {transacoesFiltradas.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '40px 20px',
                color: 'var(--vf-tx-mute)', fontStyle: 'italic', fontSize: 14,
              }}>
                {busca || filtro !== 'todos' ? '🔍 Nenhum resultado' : HEADERS.financas.vazioMes}
              </div>
            ) : (
              transacoesFiltradas.map((tx) => (
                <TransactionRow
                  key={tx.id}
                  tx={tx}
                  onTogglePago={handleTogglePago}
                  onRemove={handleRemove}
                  onEdit={handleEdit}
                />
              ))
            )}
          </div>
          <button
            onClick={() => exportarCSV(transacoesFiltradas, mes)}
            title="Exportar CSV"
            style={{
              width: 36, height: 36, borderRadius: 12,
              background: 'var(--vf-surf)', border: '1px solid var(--vf-bd)',
              color: 'var(--vf-tx-mute)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', marginRight: 6,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <Download size={16} />
          </button>
          <button
            onClick={() => { setEditTxId(undefined); setAddTx(true); }}
            style={{
              marginTop: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', padding: '14px', borderRadius: 14,
              border: '2px dashed var(--vf-bd)',
              background: 'transparent', color: 'var(--vf-tx-mute)',
              fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <Plus size={18} /> adicionar movimento
          </button>
        </>
      )}

      {/* Revisao */}
      {tab === 'revisao' && <RevisaoTab mes={mes} />}

      {/* Cartoes */}
      {tab === 'cartoes' && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {cartoes.map((c) => (
              <CardItem
                key={c.id}
                card={c}
                mes={mes}
                onRemove={removerCartao}
                onClick={(card) => setDetalheCard(card)}
              />
            ))}
          </div>
          <button
            onClick={() => setAddCard(true)}
            style={{
              marginTop: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', padding: '14px', borderRadius: 14,
              border: '2px dashed var(--vf-bd)',
              background: 'transparent', color: 'var(--vf-tx-mute)',
              fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <Plus size={18} /> adicionar cartao
          </button>
          <p style={{
            textAlign: 'center', fontSize: 12, color: 'var(--vf-tx-mute)',
            marginTop: 10, fontStyle: 'italic', padding: '0 8px',
          }}>
            Para lançar despesas nos cartões, use o botão (+) de nova transação no topo.
          </p>
        </>
      )}

      {/* Sheets */}
      <AddTransactionSheet
        isOpen={addTx}
        onClose={handleCloseSheet}
        txId={editTxId}
      />
      <AddCardSheet isOpen={addCard} onClose={() => setAddCard(false)} />

      {/* Item 13: CardDetailSheet */}
      {detalheCard && (
        <CardDetailSheet
          card={detalheCard}
          mes={mes}
          isOpen={!!detalheCard}
          onClose={() => setDetalheCard(null)}
        />
      )}
    </div>
  );
}
