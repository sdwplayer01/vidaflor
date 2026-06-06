// src/features/agenda/components/PreparaAmanha.tsx
import { useState } from 'react';
import { Moon, Pencil, X, Check, Plus } from 'lucide-react';
import { Sheet }  from '@/shared/ui/Sheet';
import { Btn }    from '@/shared/ui/Btn';
import { FInput } from '@/shared/ui/FInput';
import { addDays, today, formatBR } from '@/shared/utils/date';
import type { ISODate } from '@/shared/types/common';

interface Props {
  onVerAmanha: (date: ISODate) => void;
}

interface Item { id: string; label: string; }

const CHECKLIST_INICIAL: Item[] = [
  { id: 'mochila',      label: 'Mochila preparada' },
  { id: 'roupas',       label: 'Roupas separadas' },
  { id: 'lanche',       label: 'Lanche preparado' },
  { id: 'compromissos', label: 'Compromissos de amanhã revisados' },
];

export function PreparaAmanha({ onVerAmanha }: Props) {
  const [open,      setOpen]      = useState(false);
  const [editando,  setEditando]  = useState(false);
  const [checked,   setChecked]   = useState<Set<string>>(new Set());
  const [itens,     setItens]     = useState<Item[]>(CHECKLIST_INICIAL);
  const [novoItem,  setNovoItem]  = useState('');

  const amanha = addDays(today(), 1);

  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const removerItem = (id: string) => {
    setItens((prev) => prev.filter((i) => i.id !== id));
    setChecked((prev) => { const next = new Set(prev); next.delete(id); return next; });
  };

  const adicionarItem = () => {
    const label = novoItem.trim();
    if (!label) return;
    const id = `custom_${Date.now()}`;
    setItens((prev) => [...prev, { id, label }]);
    setNovoItem('');
  };

  const feitos = checked.size;
  const total  = itens.length;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          width: '100%', padding: '12px 14px', borderRadius: 14, textAlign: 'left',
          background: 'color-mix(in srgb, var(--vf-rose) 8%, var(--vf-surf))',
          border: '1px solid color-mix(in srgb, var(--vf-rose) 25%, var(--vf-bd))',
          cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
          display: 'flex', alignItems: 'center', gap: 10,
        }}
      >
        <Moon size={16} style={{ color: 'var(--vf-rose)', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--vf-tx)' }}>
            Preparar o amanhã
          </p>
          <p style={{ margin: 0, fontSize: 11, color: 'var(--vf-tx-mute)' }}>
            {feitos === 0 ? `${formatBR(amanha)} · ${total} itens` : `${feitos}/${total} checados`}
          </p>
        </div>
        {feitos > 0 && (
          <span style={{
            fontSize: 11, fontWeight: 700, color: 'var(--vf-rose)',
            padding: '2px 8px', borderRadius: 99,
            background: 'color-mix(in srgb, var(--vf-rose) 12%, transparent)',
          }}>
            {Math.round((feitos / total) * 100)}%
          </span>
        )}
      </button>

      {open && (
        <Sheet title="Preparar o amanhã" onClose={() => { setOpen(false); setEditando(false); }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--vf-tx-mute)' }}>
                {formatBR(amanha)} — verifique antes de dormir
              </p>
              <button
                onClick={() => setEditando((e) => !e)}
                style={{
                  background: editando ? 'var(--vf-rose)' : 'none',
                  border: editando ? 'none' : '1px solid var(--vf-bd)',
                  borderRadius: 8, cursor: 'pointer', padding: '4px 8px',
                  color: editando ? '#fff' : 'var(--vf-tx-mute)',
                  display: 'flex', alignItems: 'center', gap: 4, fontSize: 11,
                }}
              >
                <Pencil size={12} /> {editando ? 'Concluir' : 'Editar'}
              </button>
            </div>

            {itens.map(({ id, label }) => {
              const done = checked.has(id);
              return editando ? (
                <div key={id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 12,
                  background: 'var(--vf-surf)', border: '1px solid var(--vf-bd)',
                }}>
                  <span style={{ flex: 1, fontSize: 14, color: 'var(--vf-tx)' }}>{label}</span>
                  <button
                    onClick={() => removerItem(id)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--vf-er)', padding: 2, display: 'flex', alignItems: 'center',
                    }}
                    aria-label="Remover item"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  key={id}
                  onClick={() => toggle(id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', borderRadius: 12, width: '100%', textAlign: 'left',
                    background: done
                      ? 'color-mix(in srgb, var(--vf-ok) 10%, var(--vf-surf))'
                      : 'var(--vf-surf)',
                    border: `1px solid ${done ? 'var(--vf-ok)' : 'var(--vf-bd)'}`,
                    cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <div style={{
                    width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                    background: done ? 'var(--vf-ok)' : 'transparent',
                    border: done ? 'none' : '2px solid var(--vf-bd)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {done && <Check size={12} color="#fff" strokeWidth={2.5} />}
                  </div>
                  <span style={{
                    fontSize: 14, fontWeight: 600,
                    color: done ? 'var(--vf-tx-mute)' : 'var(--vf-tx)',
                    textDecoration: done ? 'line-through' : 'none',
                  }}>{label}</span>
                </button>
              );
            })}

            {editando && (
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <div style={{ flex: 1 }}>
                  <FInput
                    value={novoItem}
                    onChange={setNovoItem}
                    placeholder="Novo item..."
                  />
                </div>
                <button
                  onClick={adicionarItem}
                  disabled={!novoItem.trim()}
                  style={{
                    padding: '0 14px', borderRadius: 10, flexShrink: 0,
                    background: novoItem.trim() ? 'var(--vf-rose)' : 'var(--vf-bd)',
                    border: 'none', color: '#fff',
                    cursor: novoItem.trim() ? 'pointer' : 'default',
                    display: 'flex', alignItems: 'center',
                  }}
                  aria-label="Adicionar item"
                >
                  <Plus size={16} />
                </button>
              </div>
            )}

            {!editando && (
              <>
                <Btn
                  onClick={() => { setOpen(false); setEditando(false); onVerAmanha(amanha); }}
                  style={{ marginTop: 4 }}
                >
                  Ver agenda de amanhã
                </Btn>
                <Btn variant="ghost" onClick={() => { setOpen(false); setEditando(false); }}>Fechar</Btn>
              </>
            )}
          </div>
        </Sheet>
      )}
    </>
  );
}
