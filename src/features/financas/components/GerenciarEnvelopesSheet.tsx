// src/features/financas/components/GerenciarEnvelopesSheet.tsx
// Fase 2: CRUD de envelopes de orçamento por categoria
import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Sheet }    from '@/shared/ui/Sheet';
import { Btn }      from '@/shared/ui/Btn';
import { FInput }   from '@/shared/ui/FInput';
import { useEnvelopesDoMes } from '../selectors';
import { useFinancasStore }  from '../store';
import { formatBRL, parseBRL } from '@/shared/utils/money';
import { CATEGORIES } from './CategoryChips';
import type { IsoMonth } from '../types';

interface Props {
  mes:     IsoMonth;
  isOpen:  boolean;
  onClose: () => void;
}

export function GerenciarEnvelopesSheet({ mes, isOpen, onClose }: Props) {
  const envelopes = useEnvelopesDoMes(mes);
  const definir   = useFinancasStore((s) => s.definirOrcamentoCategoria);
  const remover   = useFinancasStore((s) => s.removerEnvelope);

  const [catSel, setCatSel] = useState<string>(CATEGORIES[0] as string);
  const [limite, setLimite] = useState('');

  if (!isOpen) return null;

  const limiteValido = parseBRL(limite) > 0;

  const handleAdicionar = () => {
    if (!limiteValido || !catSel) return;
    definir(mes, catSel, parseBRL(limite));
    setLimite('');
  };

  return (
    <Sheet title="Limites de Gastos" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── Envelopes existentes ─────────────────────────────── */}
        {envelopes.length === 0 ? (
          <p style={{
            textAlign: 'center', padding: '16px 0',
            color: 'var(--vf-tx-mute)', fontStyle: 'italic', fontSize: 13,
          }}>
            Nenhum envelope definido — adicione abaixo.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {envelopes.map(({ categoria, limite: lim, gasto, pct }) => {
              const cor = pct > 100 ? 'var(--vf-er)' : pct >= 80 ? 'var(--vf-wn)' : 'var(--vf-ok)';
              const alerta = pct > 100
                ? '🔴 Limite estourado'
                : pct >= 80
                ? '🟡 Próximo ao limite'
                : null;
              return (
                <div
                  key={categoria}
                  style={{
                    padding: '10px 12px', borderRadius: 12,
                    background: 'var(--vf-surf)', border: '1px solid var(--vf-bd)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{
                      flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--vf-tx)',
                    }}>
                      {categoria}
                    </span>
                    {alerta && (
                      <span style={{ fontSize: 10, color: cor, fontWeight: 600 }}>{alerta}</span>
                    )}
                    <button
                      onClick={() => remover(mes, categoria)}
                      aria-label={`Remover envelope ${categoria}`}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--vf-tx-mute)', padding: 4, flexShrink: 0,
                        display: 'flex', alignItems: 'center',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div style={{ height: 4, borderRadius: 2, background: 'var(--vf-bd)', overflow: 'hidden', marginBottom: 4 }}>
                    <div style={{
                      height: '100%', borderRadius: 2, background: cor,
                      width: `${Math.min(100, pct)}%`, transition: 'width 0.4s ease',
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: 'var(--vf-tx-mute)' }}>
                      gasto: R$ {formatBRL(gasto)}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--vf-tx-mute)' }}>
                      limite: R$ {formatBRL(lim)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Adicionar novo envelope ───────────────────────────── */}
        <div style={{
          borderTop: '1px solid var(--vf-bd)', paddingTop: 16,
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <span style={{
            fontSize: 11, fontWeight: 700, color: 'var(--vf-tx-mute)',
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            Novo envelope
          </span>

          {/* Seletor de categoria */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCatSel(cat)}
                style={{
                  padding: '5px 10px', borderRadius: 99, fontSize: 11,
                  border: `1.5px solid ${catSel === cat ? 'var(--vf-rose)' : 'var(--vf-bd)'}`,
                  background: catSel === cat
                    ? 'color-mix(in srgb, var(--vf-rose) 12%, transparent)'
                    : 'var(--vf-surf)',
                  color: catSel === cat ? 'var(--vf-rose)' : 'var(--vf-tx-mute)',
                  fontWeight: catSel === cat ? 700 : 400,
                  cursor: 'pointer', fontFamily: 'inherit',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <FInput
            value={limite}
            onChange={setLimite}
            placeholder="Limite mensal (ex: 800,00)"
          />

          <Btn onClick={handleAdicionar} disabled={!limiteValido}>
            Adicionar envelope
          </Btn>
        </div>

        <Btn variant="ghost" onClick={onClose}>Fechar</Btn>
      </div>
    </Sheet>
  );
}
