// src/features/espiritual/components/GratidaoItem.tsx
import { Sparkles, Trash2 } from 'lucide-react';
import type { GratidaoEntry } from '../types';
import type { ID } from '@/shared/types/common';

interface Props {
  entry:    GratidaoEntry;
  onRemove: (id: ID) => void;
}

export function GratidaoItem({ entry, onRemove }: Props) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 16px', borderRadius: 16,
      background: 'var(--vf-surf)', border: '1px solid var(--vf-bd)',
    }}>
      <Sparkles size={16} color="var(--vf-p)" style={{ flexShrink: 0 }} />
      <p style={{ margin: 0, fontSize: 14, color: 'var(--vf-tx)', flex: 1 }}>
        {entry.text}
      </p>
      <button
        onClick={() => onRemove(entry.id)}
        style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'color-mix(in srgb, var(--vf-er) 10%, transparent)',
          border: 'none', display: 'flex', alignItems: 'center',
          justifyContent: 'center', cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
        }}
        aria-label="Remover gratidão"
      >
        <Trash2 size={13} color="var(--vf-er)" />
      </button>
    </div>
  );
}
