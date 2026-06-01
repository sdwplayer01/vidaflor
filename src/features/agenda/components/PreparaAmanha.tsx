// src/features/agenda/components/PreparaAmanha.tsx
// 4d: card "Preparar o amanhã" com checklist + link para o dia seguinte
import { useState } from 'react';
import { Moon } from 'lucide-react';
import { Sheet } from '@/shared/ui/Sheet';
import { Btn }   from '@/shared/ui/Btn';
import { addDays, today, formatBR } from '@/shared/utils/date';
import type { ISODate } from '@/shared/types/common';

interface Props {
  onVerAmanha: (date: ISODate) => void;
}

const CHECKLIST = [
  { id: 'mochila',     label: 'Mochila preparada' },
  { id: 'roupas',      label: 'Roupas separadas' },
  { id: 'lanche',      label: 'Lanche preparado' },
  { id: 'compromissos',label: 'Compromissos de amanhã revisados' },
];

export function PreparaAmanha({ onVerAmanha }: Props) {
  const [open,    setOpen]    = useState(false);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const amanha = addDays(today(), 1);
  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const feitos = checked.size;
  const total  = CHECKLIST.length;

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
        <Sheet title="Preparar o amanhã" onClose={() => setOpen(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--vf-tx-mute)' }}>
              {formatBR(amanha)} — verifique antes de dormir
            </p>

            {CHECKLIST.map(({ id, label }) => {
              const done = checked.has(id);
              return (
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
                    {done && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span style={{
                    fontSize: 14, fontWeight: 600,
                    color: done ? 'var(--vf-tx-mute)' : 'var(--vf-tx)',
                    textDecoration: done ? 'line-through' : 'none',
                  }}>{label}</span>
                </button>
              );
            })}

            <Btn
              onClick={() => { setOpen(false); onVerAmanha(amanha); }}
              style={{ marginTop: 4 }}
            >
              Ver agenda de amanhã
            </Btn>
            <Btn variant="ghost" onClick={() => setOpen(false)}>Fechar</Btn>
          </div>
        </Sheet>
      )}
    </>
  );
}
