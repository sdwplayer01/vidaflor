// src/features/kids/components/KidTaskItem.tsx
import { Trash2 } from 'lucide-react';
import type { CriancaTarefa } from '../types';
import type { ID } from '@/shared/types/common';

interface Props {
  tarefa:   CriancaTarefa;
  done:     boolean;
  onToggle: (id: ID) => void;
  onRemove: (id: ID) => void;
}

export function KidTaskItem({ tarefa, done, onToggle, onRemove }: Props) {
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
          width: 36, height: 36, borderRadius: 10, flexShrink: 0, fontSize: 18,
          border: `2px solid ${done ? 'var(--vf-ok)' : 'var(--vf-bd)'}`,
          background: done ? 'var(--vf-ok)' : 'var(--vf-bg)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {done ? '✓' : tarefa.emoji}
      </button>

      <div style={{ flex: 1 }}>
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
