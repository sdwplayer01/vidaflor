// src/features/espiritual/components/LeituraItem.tsx
import { BookOpen, Trash2 } from 'lucide-react';
import { formatBR } from '@/shared/utils/date';
import type { Leitura } from '../types';
import type { ID } from '@/shared/types/common';

interface Props {
  leitura:  Leitura;
  onRemove: (id: ID) => void;
}

export function LeituraItem({ leitura, onRemove }: Props) {
  const subtitulo = [
    leitura.capitulo > 0 && `Cap. ${leitura.capitulo}`,
    leitura.versiculo && `v. ${leitura.versiculo}`,
    formatBR(leitura.data),
  ].filter(Boolean).join(' · ');

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 16px', borderRadius: 16,
      background: 'var(--vf-surf)', border: '1px solid var(--vf-bd)',
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 11, flexShrink: 0,
        background: 'color-mix(in srgb, var(--vf-p) 12%, transparent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <BookOpen size={18} color="var(--vf-p)" />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--vf-tx)' }}>
          {leitura.livro}
        </p>
        <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--vf-tm)' }}>
          {subtitulo}
        </p>
      </div>

      <button
        onClick={() => onRemove(leitura.id)}
        style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'color-mix(in srgb, var(--vf-er) 10%, transparent)',
          border: 'none', display: 'flex', alignItems: 'center',
          justifyContent: 'center', cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
        }}
        aria-label="Remover leitura"
      >
        <Trash2 size={13} color="var(--vf-er)" />
      </button>
    </div>
  );
}
