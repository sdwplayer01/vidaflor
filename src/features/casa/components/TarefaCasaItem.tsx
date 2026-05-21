// src/features/casa/components/TarefaCasaItem.tsx
import { Trash2 } from 'lucide-react';
import type { TarefaCasa } from '../types';
import type { ID } from '@/shared/types/common';

const AMBIENTE_EMOJI: Record<string, string> = {
  cozinha:       '\uD83C\uDF73',
  sala:          '\uD83D\uDECB',
  banheiro:      '\uD83D\uDEBF',
  quarto_casal:  '\uD83D\uDECC',
  quarto_kids:   '\uD83D\uDC76',
  lavanderia:    '\uD83D\uDC55',
  area_externa:  '\uD83C\uDF3F',
  escritorio:    '\uD83D\uDCBB',
  geral:         '\uD83C\uDFE0',
};

interface Props {
  tarefa:   TarefaCasa;
  done:     boolean;
  onToggle: (id: ID) => void;
  onRemove: (id: ID) => void;
}

export function TarefaCasaItem({ tarefa, done, onToggle, onRemove }: Props) {
  const emoji = AMBIENTE_EMOJI[tarefa.ambiente] ?? '\uD83C\uDFE0';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 14px', borderRadius: 14,
      background: done ? 'color-mix(in srgb, var(--vf-ok) 8%, var(--vf-s2))' : 'var(--vf-s2)',
      border: '1px solid var(--vf-bd)',
    }}>
      <button
        onClick={() => onToggle(tarefa.id)}
        style={{
          width: 26, height: 26, borderRadius: 8, flexShrink: 0,
          border: `2px solid ${done ? 'var(--vf-ok)' : 'var(--vf-bd)'}`,
          background: done ? 'var(--vf-ok)' : 'transparent',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {done && <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>✓</span>}
      </button>
      <span style={{ fontSize: 18 }}>{emoji}</span>
      <p style={{
        flex: 1, margin: 0, fontSize: 14, fontWeight: 500, color: 'var(--vf-t)',
        textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.6 : 1,
      }}>
        {tarefa.task}
      </p>
      <button
        onClick={() => onRemove(tarefa.id)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--vf-tm)', padding: 4,
        }}
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
