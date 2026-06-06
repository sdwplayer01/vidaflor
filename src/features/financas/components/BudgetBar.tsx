// src/features/financas/components/BudgetBar.tsx
// Fase 2: barras por categoria + botão gerenciar envelopes
import { useState } from 'react';
import { ChevronDown, ChevronUp, Settings2 } from 'lucide-react';
import { useOrcamentoMes, useCategoriasComOrcamento, useOrcamentoCategoria } from '../selectors';
import { GerenciarEnvelopesSheet } from './GerenciarEnvelopesSheet';
import { formatBRL } from '@/shared/utils/money';
import type { IsoMonth } from '../types';

interface CategoryRowProps {
  categoria: string;
  mes?:      IsoMonth;
}

function CategoryRow({ categoria, mes }: CategoryRowProps) {
  const { disponivel, gasto, pct } = useOrcamentoCategoria(categoria, mes);
  if (disponivel === 0) return null;
  const cor = pct > 100 ? 'var(--vf-er)' : pct >= 80 ? 'var(--vf-wn)' : 'var(--vf-ok)';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: 'var(--vf-tm)', textTransform: 'capitalize' }}>{categoria}</span>
        <span style={{ fontSize: 12, color: 'var(--vf-tm)' }}>
          R$ {formatBRL(gasto)} / R$ {formatBRL(disponivel)}
        </span>
      </div>
      <div style={{ height: 5, borderRadius: 3, background: 'var(--vf-bd)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 3, background: cor,
          width: `${Math.min(100, pct)}%`, transition: 'width 0.4s ease',
        }} />
      </div>
    </div>
  );
}

interface Props {
  mes?: IsoMonth;
}

export function BudgetBar({ mes }: Props = {}) {
  const { disponivel, gasto, restante, pct } = useOrcamentoMes(mes);
  const categorias = useCategoriasComOrcamento(mes);
  const [expandido, setExpandido] = useState(false);
  const [gerenciar, setGerenciar] = useState(false);
  const mesReal = mes ?? (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` as IsoMonth;
  })();

  const barColor = pct > 100 ? 'var(--vf-er)' : pct >= 80 ? 'var(--vf-wn)' : 'var(--vf-ok)';

  return (
    <>
      <div style={{
        background: 'var(--vf-surf)', borderRadius: 16, padding: '14px',
        border: '1px solid var(--vf-bd)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--vf-tx)' }}>
            Orçamento do mês
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {disponivel > 0 && (
              <span style={{ fontSize: 12, color: 'var(--vf-tx-mute)' }}>{pct}% usado</span>
            )}
            {categorias.length > 0 && (
              <button
                onClick={() => setExpandido((v) => !v)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--vf-tx-mute)', padding: 2 }}
                aria-label={expandido ? 'Recolher categorias' : 'Expandir categorias'}
              >
                {expandido ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
            <button
              onClick={() => setGerenciar(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--vf-tx-mute)', padding: 2 }}
              aria-label="Configurar limites"
            >
              <Settings2 size={14} />
            </button>
          </div>
        </div>

        {/* Sem orçamento: convite */}
        {disponivel === 0 ? (
          <p style={{
            fontSize: 12, color: 'var(--vf-tx-mute)', fontStyle: 'italic',
            margin: 0, textAlign: 'center', padding: '6px 0',
          }}>
            Toque em ⚙ para definir envelopes de orçamento.
          </p>
        ) : (
          <>
            {/* Barra total */}
            <div style={{ height: 8, borderRadius: 4, background: 'var(--vf-bd)', marginBottom: 8, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 4, background: barColor,
                width: `${Math.min(100, pct)}%`, transition: 'width 0.4s ease',
              }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: expandido && categorias.length > 0 ? 12 : 0 }}>
              <span style={{ fontSize: 12, color: 'var(--vf-tx-mute)' }}>
                Gasto: R$ {formatBRL(gasto)}
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, color: restante >= 0 ? 'var(--vf-ok)' : 'var(--vf-er)' }}>
                Restante: R$ {formatBRL(Math.abs(restante))}
              </span>
            </div>

            {/* Barras por categoria */}
            {expandido && categorias.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid var(--vf-bd)', paddingTop: 12 }}>
                {categorias.map((cat) => (
                  <CategoryRow key={cat} categoria={cat} mes={mes} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <GerenciarEnvelopesSheet
        mes={mesReal}
        isOpen={gerenciar}
        onClose={() => setGerenciar(false)}
      />
    </>
  );
}
