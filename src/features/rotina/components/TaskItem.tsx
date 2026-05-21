// src/features/rotina/components/TaskItem.tsx
import { Trash2 } from 'lucide-react';
import type { Tarefa } from '../types';
import type { ID, ISODate } from '@/shared/types/common';

interface Props {
  tarefa:   Tarefa;
  done:     boolean;
  onToggle: (id: ID) => void;
  onRemove: (turno: Tarefa['turno'], id: ID) => void;
}

export function TaskItem({ tarefa, done, onToggle, onRemove }: Props) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 14px', borderRadius: 14,
      background: done ? 'color-mix(in srgb, var(--vf-ok) 8%, var(--vf-s2))' : 'var(--vf-s2)',
      border: '1px solid var(--vf-bd)',
      transition: 'background 0.2s',
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

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0, fontSize: 14, fontWeight: 500, color: 'var(--vf-t)',
          textDecoration: done ? 'line-through' : 'none',
          opacity: done ? 0.6 : 1,
        }}>
          {tarefa.task}
        </p>
        {tarefa.time && (
          <p style={{ margin: 0, fontSize: 11, color: 'var(--vf-tm)' }}>{tarefa.time}</p>
        )}
      </div>

      <button
        onClick={() => onRemove(tarefa.turno, tarefa.id)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--vf-tm)', padding: 4, flexShrink: 0,
        }}
        aria-label="Remover"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
